// Music theory engine for the 3-notes-per-string (3NPS) box system,
// generalized to any 7-note scale.
// String indices: 0 = low E (6th string) ... 5 = high E (1st string).

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;

const NATURAL_PC: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

// Semitones from the tonic for the major scale degrees 1..7 — the reference
// against which other scales' degrees are labelled (♭3, ♯4, ♭7, …).
const MAJOR_OFFSETS = [0, 2, 4, 5, 7, 9, 11];

// Standard tuning, open-string MIDI notes, low E -> high E.
export const TUNING = [40, 45, 50, 55, 59, 64];
export const STRING_LABELS = ["E", "A", "D", "G", "B", "e"];
export const MAX_FRET = 17;
export const BOX_COUNT = 7;

export type Key = {
  id: string;
  label: string;
  tonicPc: number;
  letter: string;
};

export const KEYS: Key[] = [
  { id: "C", label: "C", tonicPc: 0, letter: "C" },
  { id: "Db", label: "D♭", tonicPc: 1, letter: "D" },
  { id: "D", label: "D", tonicPc: 2, letter: "D" },
  { id: "Eb", label: "E♭", tonicPc: 3, letter: "E" },
  { id: "E", label: "E", tonicPc: 4, letter: "E" },
  { id: "F", label: "F", tonicPc: 5, letter: "F" },
  { id: "Fs", label: "F♯", tonicPc: 6, letter: "F" },
  { id: "G", label: "G", tonicPc: 7, letter: "G" },
  { id: "Ab", label: "A♭", tonicPc: 8, letter: "A" },
  { id: "A", label: "A", tonicPc: 9, letter: "A" },
  { id: "Bb", label: "B♭", tonicPc: 10, letter: "B" },
  { id: "B", label: "B", tonicPc: 11, letter: "B" },
];

export type Scale = {
  id: string;
  label: string;
  group: string;
  offsets: number[]; // 7 semitone offsets from the tonic
};

export const SCALES: Scale[] = [
  { id: "major", label: "Major (Ionian)", group: "Scales", offsets: [0, 2, 4, 5, 7, 9, 11] },
  {
    id: "natural-minor",
    label: "Natural minor (Aeolian)",
    group: "Scales",
    offsets: [0, 2, 3, 5, 7, 8, 10],
  },
  {
    id: "harmonic-minor",
    label: "Harmonic minor",
    group: "Scales",
    offsets: [0, 2, 3, 5, 7, 8, 11],
  },
  { id: "melodic-minor", label: "Melodic minor", group: "Scales", offsets: [0, 2, 3, 5, 7, 9, 11] },
  { id: "dorian", label: "Dorian", group: "Modes", offsets: [0, 2, 3, 5, 7, 9, 10] },
  { id: "phrygian", label: "Phrygian", group: "Modes", offsets: [0, 1, 3, 5, 7, 8, 10] },
  { id: "lydian", label: "Lydian", group: "Modes", offsets: [0, 2, 4, 6, 7, 9, 11] },
  { id: "mixolydian", label: "Mixolydian", group: "Modes", offsets: [0, 2, 4, 5, 7, 9, 10] },
  { id: "locrian", label: "Locrian", group: "Modes", offsets: [0, 1, 3, 5, 6, 8, 10] },
];

type ScaleTone = {
  degree: number;
  pc: number;
  name: string;
  label: string; // degree with alteration, e.g. "1", "♭3", "♯4"
};

export type Note = {
  string: number;
  fret: number;
  pc: number;
  midi: number;
  name: string;
  degree: number;
  label: string;
  isRoot: boolean;
};

const mod = (n: number, m: number) => ((n % m) + m) % m;

// Spell a pitch class as the given letter plus accidentals (♯/♭).
function spell(letterIdx: number, pc: number): string {
  const letter = LETTERS[mod(letterIdx, 7)];
  const natural = NATURAL_PC[letter];
  let diff = mod(pc - natural, 12);
  if (diff > 6) diff -= 12;
  if (diff > 0) return letter + "♯".repeat(diff);
  if (diff < 0) return letter + "♭".repeat(-diff);
  return letter;
}

// A scale degree's label relative to the major scale: 1, ♭3, ♯4, ♭7, …
function degreeLabel(offset: number, degreeIndex: number): string {
  let diff = offset - MAJOR_OFFSETS[degreeIndex];
  if (diff > 6) diff -= 12;
  if (diff < -6) diff += 12;
  const acc = diff > 0 ? "♯".repeat(diff) : diff < 0 ? "♭".repeat(-diff) : "";
  return acc + (degreeIndex + 1);
}

// Semitones from each degree to the next (wrapping over the octave).
function scaleSteps(offsets: number[]): number[] {
  return offsets.map((o, i) => mod(offsets[(i + 1) % offsets.length] - o, 12));
}

function scaleTones(key: Key, scale: Scale): ScaleTone[] {
  const tonicLetterIdx = LETTERS.indexOf(key.letter as (typeof LETTERS)[number]);
  return scale.offsets.map((off, i) => {
    const pc = mod(key.tonicPc + off, 12);
    return {
      degree: i + 1,
      pc,
      name: spell(tonicLetterIdx + i, pc),
      label: degreeLabel(off, i),
    };
  });
}

// Every scale note across the neck (frets 0..MAX_FRET) — the dim base layer.
export function diatonicMap(key: Key, scale: Scale): Note[] {
  const tones = scaleTones(key, scale);
  const byPc = new Map(tones.map((t) => [t.pc, t]));
  const notes: Note[] = [];
  for (let s = 0; s < 6; s++) {
    for (let f = 0; f <= MAX_FRET; f++) {
      const pc = mod(TUNING[s] + f, 12);
      const tone = byPc.get(pc);
      if (!tone) continue;
      notes.push({
        string: s,
        fret: f,
        pc,
        midi: TUNING[s] + f,
        name: tone.name,
        degree: tone.degree,
        label: tone.label,
        isRoot: tone.degree === 1,
      });
    }
  }
  return notes;
}

// One 3-notes-per-string box. Box n starts on the nth scale degree on the
// low E string, at its lowest playable instance, and climbs the neck.
export function box(key: Key, scale: Scale, n: number): Note[] {
  const tones = scaleTones(key, scale);
  const byPc = new Map(tones.map((t) => [t.pc, t]));
  const steps = scaleSteps(scale.offsets);
  let degIdx = mod(n - 1, 7);
  const startFret = mod(tones[degIdx].pc - TUNING[0], 12);
  let midi = TUNING[0] + startFret;
  const notes: Note[] = [];
  for (let i = 0; i < 18; i++) {
    const string = Math.floor(i / 3);
    const pc = mod(midi, 12);
    const tone = byPc.get(pc)!;
    notes.push({
      string,
      fret: midi - TUNING[string],
      pc,
      midi,
      name: tone.name,
      degree: tone.degree,
      label: tone.label,
      isRoot: tone.degree === 1,
    });
    midi += steps[degIdx];
    degIdx = mod(degIdx + 1, 7);
  }
  return notes;
}

// The seven boxes of the major scale are the seven diatonic modes, in order.
// The other diatonic modes are just rotations of this list.
const MODE_NAMES = [
  "Ionian",
  "Dorian",
  "Phrygian",
  "Lydian",
  "Mixolydian",
  "Aeolian",
  "Locrian",
] as const;

// How far each diatonic scale is rotated from Ionian (major). Harmonic and
// melodic minor aren't rotations of the major scale, so they're absent here.
const MODE_ROTATION: Record<string, number> = {
  major: 0,
  dorian: 1,
  phrygian: 2,
  lydian: 3,
  mixolydian: 4,
  "natural-minor": 5,
  locrian: 6,
};

// Name of box `n` (1..7) for `scale`: the diatonic mode that box's shape plays.
// Returns null for non-diatonic scales (harmonic/melodic minor), which have no
// standard mode name.
export function boxModeName(scale: Scale, n: number): string | null {
  const rot = MODE_ROTATION[scale.id];
  if (rot === undefined) return null;
  return MODE_NAMES[mod(rot + n - 1, 7)];
}

export const keyById = (id: string): Key => KEYS.find((k) => k.id === id) ?? KEYS[0];
export const scaleById = (id: string): Scale => SCALES.find((s) => s.id === id) ?? SCALES[0];
