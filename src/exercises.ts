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
    label: "3NPS",
    status: "live",
    description:
      'The 3-notes-per-string system maps every scale as seven movable shapes — "boxes" — that tile the whole neck. Even and symmetrical: fast to pick, and one set of shapes covers any scale in any key, anywhere. Step through the seven over the full diatonic map.',
    component: BoxTrainer,
  },
  {
    id: "251",
    label: "II–V–I in all keys",
    status: "soon",
    description:
      "Jazz's backbone progression — ii7 → V7 → Imaj7. Drill it through all twelve keys until the changes fall under your fingers wherever a tune modulates.",
  },
  {
    id: "pentatonics",
    label: "Pentatonics",
    status: "soon",
    description:
      "The five-note scales behind most soloing. Fewer notes means stronger, more forgiving melodic shapes — usually the first vocabulary an improviser reaches for.",
  },
  {
    id: "autumn-leaves",
    label: "Autumn Leaves",
    status: "soon",
    description:
      "A classic standard and a rite of passage. Put the ii–V–Is and major/minor scales to work in a real tune instead of drilling them in isolation.",
  },
  {
    id: "bebop",
    label: "Bebop scale (dominant)",
    status: "soon",
    description:
      "A dominant scale with one chromatic passing tone added (between the ♭7 and the root), making eight notes. That extra note keeps chord tones landing on the beat — the secret behind bebop's smooth eighth-note flow.",
  },
  {
    id: "alterations",
    label: "Dominant alterations",
    status: "soon",
    description:
      "The tensions you stack on a V7 — ♭9, ♯9, ♯11, ♭13. They sharpen the pull back to the I: the sound of jazz reaching 'outside' before resolving home.",
  },
  {
    id: "voice-leading",
    label: "Voice leading",
    status: "soon",
    description:
      "Move between chords by the smallest step possible — often a half step. It's what makes a line flow through the changes instead of leaping between shapes.",
  },
  {
    id: "chromatic",
    label: "Chromatic targeting",
    status: "soon",
    description:
      "Approach a target chord tone from a half step above, below, or both. A few chromatic notes around the strong tones add tension and forward motion to any line.",
  },
  {
    id: "251-one-note",
    label: "One note of II–V–I per key",
    status: "soon",
    description:
      "Play one well-chosen note over each chord of a ii–V–I. Strips improvising to its core — hearing the single note that best spells each change.",
  },
  {
    id: "harmonic-minor",
    label: "Harmonic minor",
    status: "soon",
    description:
      "Natural minor with a raised 7th — the tweak that gives a minor key its dominant V7 and that distinctive, slightly exotic pull.",
  },
  {
    id: "diminished",
    label: "Diminished + arpeggio",
    status: "soon",
    description:
      "The symmetric diminished scale and its arpeggios. Built from a repeating half-/whole-step pattern, it covers diminished and dominant ♭9 chords — and its symmetry lets a shape repeat every minor 3rd up the neck.",
  },
  {
    id: "pentachord",
    label: "Pentachord",
    status: "soon",
    description:
      "The first five notes of a scale — a compact building block for melodies and a tidy fingering drill before you commit to the full shape.",
  },
  {
    id: "pyramid",
    label: "Pyramid exercise",
    status: "soon",
    description:
      "A melodic sequence that grows step by step (play 1, then 1-2, then 1-2-3 …), building scale fluency and picking control through an expanding pattern.",
  },
  {
    id: "modes",
    label: "Modes on one string",
    status: "soon",
    description:
      "Play each mode along a single string. With no fingering shape to lean on, you hear a mode as pure intervals — the clearest way to feel what sets each one apart.",
  },
];
