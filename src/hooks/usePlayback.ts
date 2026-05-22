import { useCallback, useEffect, useRef, useState } from "react";
import { playMidi } from "@/lib/audio";
import type { Note } from "@/lib/theory";

const STEP_MS = 300;

// Plays a sequence of notes one at a time, exposing which note is sounding.
// Stops automatically when the note set changes (e.g. switching box/key/scale).
export function usePlayback(notes: Note[]) {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const notesRef = useRef(notes);
  notesRef.current = notes;

  const stop = useCallback(() => {
    if (timer.current !== null) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setPlayingKey(null);
  }, []);

  const toggle = useCallback(() => {
    if (timer.current !== null) {
      stop();
      return;
    }
    let i = 0;
    const tick = () => {
      const seq = notesRef.current;
      if (i >= seq.length) {
        stop();
        return;
      }
      const n = seq[i];
      setPlayingKey(`${n.string}:${n.fret}`);
      playMidi(n.midi);
      i++;
    };
    tick();
    timer.current = window.setInterval(tick, STEP_MS);
  }, [stop]);

  useEffect(() => stop, [notes, stop]);

  return { playingKey, isPlaying: playingKey !== null, toggle, stop };
}
