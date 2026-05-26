import { useCallback, useEffect, useRef, useState } from "react";
import { playMidi } from "@/lib/audio";
import type { Note } from "@/lib/theory";

export type PlayMode = "asc" | "desc" | "loop" | "random";

// Shuffle mode improvises like a jazz line rather than running flat: notes come
// in phrases (short bursts of varying length) that move mostly stepwise with the
// odd leap, separated by breaths of varying length — so the density and the
// space between ideas keep shifting.
const SEVENTH_WEIGHT = 0.8; // 7th eased a touch, but still firmly in the mix
const SYNCOPATE_CHANCE = 0.18; // occasional one-step hole inside a phrase

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

// Notes in the next burst: usually a handful, sometimes a quick jab or a long run.
function phraseLength(): number {
  const r = Math.random();
  if (r < 0.15) return randInt(1, 2);
  if (r < 0.85) return randInt(3, 6);
  return randInt(7, 10);
}

// Silent steps between phrases: mostly a short breath, occasionally a long rest.
function breathLength(): number {
  const r = Math.random();
  if (r < 0.55) return randInt(1, 2);
  if (r < 0.9) return randInt(3, 4);
  return randInt(5, 7);
}

// Weighted pick over [0, n); a weight of 0 excludes that index.
function weightedPick(n: number, weight: (k: number) => number): number {
  let total = 0;
  for (let k = 0; k < n; k++) total += weight(k);
  if (total <= 0) return 0;
  let r = Math.random() * total;
  for (let k = 0; k < n; k++) {
    const w = weight(k);
    if (r < w) return k;
    r -= w;
  }
  return n - 1; // float rounding fallthrough
}

// Next note inside a phrase: favour small melodic steps from the current note so
// the line sings, allow the occasional leap, never repeat, ease the 7th a touch.
function melodicNext(seq: Note[], cur: number): number {
  const curMidi = seq[cur].midi;
  return weightedPick(seq.length, (k) => {
    if (k === cur) return 0;
    const d = Math.abs(seq[k].midi - curMidi);
    const contour = 1 / (1 + (d / 2) ** 2); // stepwise ≫ leap
    const deg = seq[k].degree === 7 ? SEVENTH_WEIGHT : 1;
    return (contour + 0.05) * deg; // 0.05 floor keeps bigger leaps in play
  });
}

// Opening note of a fresh phrase: jump anywhere but where we just were, so
// phrases start in different registers.
function phraseStart(seq: Note[], prev: number): number {
  return weightedPick(seq.length, (k) => (k === prev ? 0 : 1));
}

// Plays a sequence of notes one at a time, exposing which note is sounding.
// `stepMs` (the average gap between notes) and `swing` are read live, so tempo
// or feel changes mid-playback take effect on the next note. `mode` is captured
// when playback starts:
//   asc    — low → high once, then stop
//   desc   — high → low once, then stop
//   loop   — bounce low → high → low … until stopped (ping-pong)
//   random — improvise a jazzy line: stepwise phrases of varying length with
//            varying breaths between them, until stopped; ear training
// `swing` (0 = straight) lengthens every other step and shortens its partner —
// long/short = (1+swing)/(1-swing) — so consecutive notes lilt while each pair
// still sums to 2·stepMs and the tempo holds.
// Stops automatically when the note set changes (e.g. switching box/key/scale).
export function usePlayback(notes: Note[], stepMs: number, mode: PlayMode, swing: number) {
  // `running` tracks the engine; `playingKey` is the note currently sounding
  // (null during a rest), so the two can't be conflated.
  const [running, setRunning] = useState(false);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const stepMsRef = useRef(stepMs);
  stepMsRef.current = stepMs;
  const swingRef = useRef(swing);
  swingRef.current = swing;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const stop = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setRunning(false);
    setPlayingKey(null);
  }, []);

  const toggle = useCallback(() => {
    if (timer.current !== null) {
      stop();
      return;
    }
    const len = notesRef.current.length;
    if (len === 0) return;
    setRunning(true);
    const mode = modeRef.current;
    let i = mode === "desc" ? len - 1 : mode === "random" ? phraseStart(notesRef.current, -1) : 0;
    let dir = mode === "desc" ? -1 : 1;
    let long = true; // swing: alternate long/short, starting long (downbeat)
    let phraseLeft = mode === "random" ? phraseLength() : 0; // notes left in the burst
    let restLeft = 0; // silent steps left (a breath, or a one-step hole)

    const tick = () => {
      const seq = notesRef.current;
      if (seq.length === 0 || i < 0 || i >= seq.length) {
        stop();
        return;
      }
      // Gap until the next step: swing lengthens this one and shortens the next.
      const s = swingRef.current;
      const delay = s > 0 ? stepMsRef.current * (long ? 1 + s : 1 - s) : stepMsRef.current;
      long = !long;

      if (mode === "random") {
        // Resting: stay silent. When a breath ends, open the next phrase.
        if (restLeft > 0) {
          restLeft--;
          setPlayingKey(null);
          if (restLeft === 0 && phraseLeft <= 0) {
            phraseLeft = phraseLength();
            i = phraseStart(seq, i);
          }
          timer.current = window.setTimeout(tick, delay);
          return;
        }
        const n = seq[i];
        setPlayingKey(`${n.string}:${n.fret}`);
        playMidi(n.midi);
        phraseLeft--;
        if (phraseLeft <= 0) {
          restLeft = breathLength(); // phrase done → breathe
        } else {
          i = melodicNext(seq, i);
          if (Math.random() < SYNCOPATE_CHANCE) restLeft = 1; // syncopated hole
        }
        timer.current = window.setTimeout(tick, delay);
        return;
      }

      // asc / desc / loop: walk the sequence in order.
      const n = seq[i];
      setPlayingKey(`${n.string}:${n.fret}`);
      playMidi(n.midi);
      let next = i + dir;
      if (mode === "loop") {
        // Reverse at each end so the boundary notes aren't replayed back-to-back.
        if (next >= seq.length) {
          dir = -1;
          next = seq.length - 2;
        } else if (next < 0) {
          dir = 1;
          next = 1;
        }
      }
      i = next;
      timer.current = window.setTimeout(tick, delay);
    };
    tick();
  }, [stop]);

  useEffect(() => stop, [notes, stop]);

  return { playingKey, isPlaying: running, toggle, stop };
}
