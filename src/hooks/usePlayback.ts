import { useCallback, useEffect, useRef, useState } from "react";
import { playMidi } from "@/lib/audio";
import type { Note } from "@/lib/theory";

export type PlayMode = "asc" | "desc" | "loop" | "random";

// In shuffle mode, this fraction of steps are rests (silence) so the line
// phrases like a melody instead of running flat. Never two rests in a row.
const REST_CHANCE = 0.3;

// The 7th is the most restless degree, so it gets this much of a normal note's
// pick weight in shuffle mode — present, but it leans on more consonant tones.
const SEVENTH_WEIGHT = 0.35;

// Weighted random index over `seq`, skipping `exclude` (use -1 for none) so the
// same note doesn't sound twice in a row. 7th-degree notes are de-emphasised.
function weightedRandomIndex(seq: Note[], exclude: number): number {
  const weight = (k: number) => (seq[k].degree === 7 ? SEVENTH_WEIGHT : 1);
  let total = 0;
  for (let k = 0; k < seq.length; k++) if (k !== exclude) total += weight(k);
  if (total <= 0) return exclude >= 0 ? exclude : 0; // only the excluded note exists
  let r = Math.random() * total;
  let last = exclude;
  for (let k = 0; k < seq.length; k++) {
    if (k === exclude) continue;
    last = k;
    if (r < weight(k)) return k;
    r -= weight(k);
  }
  return last; // float rounding fallthrough → last eligible index
}

// Plays a sequence of notes one at a time, exposing which note is sounding.
// `stepMs` (the gap between notes) is read live, so changing tempo mid-playback
// takes effect on the next note. `mode` is captured when playback starts:
//   asc    — low → high once, then stop
//   desc   — high → low once, then stop
//   loop   — bounce low → high → low … until stopped (ping-pong)
//   random — shuffle order (no immediate repeats), with random rests, until
//            stopped; ear training
// Stops automatically when the note set changes (e.g. switching box/key/scale).
export function usePlayback(notes: Note[], stepMs: number, mode: PlayMode) {
  // `running` tracks the engine; `playingKey` is the note currently sounding
  // (null during a rest), so the two can't be conflated.
  const [running, setRunning] = useState(false);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const stepMsRef = useRef(stepMs);
  stepMsRef.current = stepMs;
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
    let i =
      mode === "desc" ? len - 1 : mode === "random" ? weightedRandomIndex(notesRef.current, -1) : 0;
    let dir = mode === "desc" ? -1 : 1;
    let rested = false;
    const tick = () => {
      const seq = notesRef.current;
      if (i < 0 || i >= seq.length) {
        stop();
        return;
      }
      // Random rest: stay silent this step (but don't double up rests).
      if (mode === "random" && !rested && Math.random() < REST_CHANCE) {
        rested = true;
        setPlayingKey(null);
        timer.current = window.setTimeout(tick, stepMsRef.current);
        return;
      }
      rested = false;
      const n = seq[i];
      setPlayingKey(`${n.string}:${n.fret}`);
      playMidi(n.midi);
      let next = i + dir;
      if (mode === "random") {
        next = weightedRandomIndex(seq, i);
      } else if (mode === "loop") {
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
      timer.current = window.setTimeout(tick, stepMsRef.current);
    };
    tick();
  }, [stop]);

  useEffect(() => stop, [notes, stop]);

  return { playingKey, isPlaying: running, toggle, stop };
}
