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

export function playMidi(midi: number) {
  const ac = context();
  if (ac.state === "suspended") void ac.resume();

  const freq = 440 * Math.pow(2, (midi - 69) / 12);

  const src = ac.createBufferSource();
  src.buffer = pluck(ac, freq);

  // Neck pickup with the tone rolled well down: one smooth lowpass darkens the
  // highs while leaving enough harmonics for a real, round string tone.
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 780;
  lp.Q.value = 0.9;

  // A low-mid lift fills out the body for a round, woody tone.
  const body = ac.createBiquadFilter();
  body.type = "peaking";
  body.frequency.value = 220;
  body.gain.value = 4;
  body.Q.value = 0.8;

  const gain = ac.createGain();
  gain.gain.value = 0.9;

  src.connect(lp).connect(body).connect(gain).connect(ac.destination);
  src.start();
}
