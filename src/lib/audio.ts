// Plucked-string synthesis via Karplus-Strong: a short noise burst fed through
// a damped feedback delay line. Sounds like a plucked guitar string, no samples.

let ctx: AudioContext | null = null;

function context(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
  }
  return ctx;
}

function pluck(ac: AudioContext, freq: number): AudioBuffer {
  const sr = ac.sampleRate;
  const period = Math.max(2, Math.round(sr / freq));
  const seconds = 1.1;
  const len = Math.floor(sr * seconds);

  const buffer = ac.createBuffer(1, len, sr);
  const out = buffer.getChannelData(0);

  // Delay line seeded with white noise (the "pluck").
  const line = new Float32Array(period);
  for (let i = 0; i < period; i++) line[i] = Math.random() * 2 - 1;

  // One light smoothing pass takes the edge off the excitation while keeping
  // the bright pluck transient and harmonics that read as a real string.
  {
    let prev = line[period - 1];
    for (let i = 0; i < period; i++) {
      const cur = line[i];
      line[i] = (prev + cur) * 0.5;
      prev = cur;
    }
  }

  const damp = 0.5; // averaging lowpass — bleeds off high harmonics over time
  const decay = 0.996; // feedback gain — lower frequencies ring longer naturally
  const envRate = 4.5; // overall amplitude decay, keeps every note short and even
  let p = 0;
  for (let i = 0; i < len; i++) {
    const cur = line[p];
    const next = line[(p + 1) % period];
    out[i] = cur * Math.exp((-envRate * i) / sr);
    line[p] = (cur * damp + next * (1 - damp)) * decay;
    p = (p + 1) % period;
  }

  // Fast attack (~1ms, declick only) — the note plucks instantly, no swell.
  const fadeIn = Math.min(Math.floor(sr * 0.001), len);
  for (let i = 0; i < fadeIn; i++) out[i] *= i / fadeIn;
  const fadeOut = Math.floor(sr * 0.18);
  for (let i = 0; i < fadeOut; i++) out[len - 1 - i] *= i / fadeOut;

  return buffer;
}

// Synthetic impulse response for a small room: stereo decaying noise. Built
// once and cached — the convolver reuses it for every note.
let ir: AudioBuffer | null = null;
function reverbIR(ac: AudioContext): AudioBuffer {
  if (ir) return ir;
  const sr = ac.sampleRate;
  const len = Math.floor(sr * 1.4); // ~1.4s tail — a room, not a hall
  const buf = ac.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  ir = buf;
  return buf;
}

export async function playMidi(midi: number) {
  const ac = context();
  // Browsers suspend the AudioContext after idle, freezing currentTime. Resume
  // and wait before scheduling, or the note queues at the stale time and fires
  // late — doubled with whatever else was waiting — once the clock catches up.
  if (ac.state === "suspended") {
    try {
      await ac.resume();
    } catch {
      // resume rejects without a user gesture; the next click retries.
    }
  }

  const freq = 440 * Math.pow(2, (midi - 69) / 12);

  // Per-note velocity so playback breathes instead of machine-gunning one
  // level. A harder pluck is louder and brighter, so it also nudges the cutoff.
  const velocity = 0.66 + Math.random() * 0.29; // 0.66–0.95

  const src = ac.createBufferSource();
  src.buffer = pluck(ac, freq);

  // Neck pickup with the tone rolled most of the way down — a dark, mellow
  // archtop voicing. Low cutoff + gentle Q for a smooth, jazzy roll-off.
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 500 + velocity * 100; // ~566–595Hz, brighter when louder
  lp.Q.value = 0.7;

  // A low-mid lift fills out the body for a round, woody tone.
  const body = ac.createBiquadFilter();
  body.type = "peaking";
  body.frequency.value = 220;
  body.gain.value = 4;
  body.Q.value = 0.8;

  const gain = ac.createGain();
  gain.gain.value = velocity;

  // Small-room reverb mixed low under the dry signal — a touch of space, the
  // tail already dark since it's tapped after the lowpass.
  const dry = ac.createGain();
  dry.gain.value = 0.85;
  const wet = ac.createGain();
  wet.gain.value = 0.22;
  const verb = ac.createConvolver();
  verb.buffer = reverbIR(ac);

  src.connect(lp).connect(body).connect(gain);
  gain.connect(dry).connect(ac.destination);
  gain.connect(verb).connect(wet).connect(ac.destination);
  src.start();
}
