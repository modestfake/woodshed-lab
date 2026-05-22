import { useCallback, useEffect, useRef, useState } from "react";
import { playMidi } from "@/lib/audio";
import type { Note } from "@/lib/theory";

// Plays a sequence of notes one at a time, exposing which note is sounding.
// `stepMs` (the gap between notes) is read live, so changing tempo mid-playback
// takes effect on the next note. Stops automatically when the note set changes
// (e.g. switching box/key/scale).
export function usePlayback(notes: Note[], stepMs: number) {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const stepMsRef = useRef(stepMs);
  stepMsRef.current = stepMs;

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
      timer.current = window.setTimeout(tick, stepMsRef.current);
    };
    tick();
  }, [stop]);

  useEffect(() => stop, [notes, stop]);

  return { playingKey, isPlaying: playingKey !== null, toggle, stop };
}
