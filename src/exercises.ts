import type { ComponentType } from "react";
import { BoxTrainer } from "@/components/BoxTrainer";

// The full practice curriculum. `component` is set for live exercises; the rest
// are stubs until built. This registry drives both the sidebar and the main panel.
export type Exercise = {
  id: string;
  label: string;
  status: "live" | "soon";
  description?: string;
  component?: ComponentType;
};

export const EXERCISES: Exercise[] = [
  {
    id: "boxes",
    label: "Boxes",
    status: "live",
    description:
      "Pick a key and scale, then step through the seven 3-notes-per-string boxes. The active box lights up over the full diatonic map.",
    component: BoxTrainer,
  },
  { id: "251", label: "II–V–I in all keys", status: "soon" },
  { id: "intervals", label: "Intervals in the box (6ths)", status: "soon" },
  { id: "pentatonics", label: "Pentatonics", status: "soon" },
  { id: "autumn-leaves", label: "Autumn Leaves", status: "soon" },
  { id: "bebop", label: "Bebop scale (dominant)", status: "soon" },
  { id: "alterations", label: "Dominant alterations", status: "soon" },
  { id: "voice-leading", label: "Voice leading", status: "soon" },
  { id: "chromatic", label: "Chromatic targeting", status: "soon" },
  { id: "251-one-note", label: "One note of II–V–I per key", status: "soon" },
  { id: "harmonic-minor", label: "Harmonic minor", status: "soon" },
  { id: "diminished", label: "Diminished + arpeggio", status: "soon" },
  { id: "pentachord", label: "Pentachord", status: "soon" },
  { id: "pyramid", label: "Pyramid exercise", status: "soon" },
  { id: "modes", label: "Modes on one string", status: "soon" },
  { id: "box-intervals", label: "Box with intervals (6ths)", status: "soon" },
];
