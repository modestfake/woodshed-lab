import { useCallback, useEffect, useRef, useState } from "react";
import { playMidi } from "@/lib/audio";
import type { Note } from "@/lib/theory";

export type PlayMode = "asc" | "desc" | "loop";

// Plays a sequence of notes one at a time, exposing which note is sounding.
// `stepMs` (the gap between notes) is read live, so changing tempo mid-playback
// takes effect on the next note. `mode` is captured when playback starts:
//   asc  — low → high once, then stop
//   desc — high → low once, then stop
//   loop — bounce low → high → low … until stopped (ping-pong)
// Stops automatically when the note set changes (e.g. switching box/key/scale).
export function usePlayback(notes: Note[], stepMs: number, mode: PlayMode) {
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
    setPlayingKey(null);
  }, []);

  const toggle = useCallback(() => {
    if (timer.current !== null) {
      stop();
      return;
    }
    const len = notesRef.current.length;
    if (len === 0) return;
    const mode = modeRef.current;
    let i = mode === "desc" ? len - 1 : 0;
    let dir = mode === "desc" ? -1 : 1;
    const tick = () => {
      const seq = notesRef.current;
      if (i < 0 || i >= seq.length) {
        stop();
        return;
      }
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
      timer.current = window.setTimeout(tick, stepMsRef.current);
    };
    tick();
  }, [stop]);

  useEffect(() => stop, [notes, stop]);

  return { playingKey, isPlaying: playingKey !== null, toggle, stop };
}
