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

// Chromatic spelling for each semitone offset from the tonic (0..11): which
// letter step it sits on, and its degree label. Conventional jazz spelling —
// flats for ♭2/♭3/♭6/♭7, ♯4 for the tritone.
const CHROMATIC: { step: number; degree: string }[] = [
  { step: 0, degree: "1" },
  { step: 1, degree: "♭2" },
  { step: 1, degree: "2" },
  { step: 2, degree: "♭3" },
  { step: 2, degree: "3" },
  { step: 3, degree: "4" },
  { step: 3, degree: "♯4" },
  { step: 4, degree: "5" },
  { step: 5, degree: "♭6" },
  { step: 5, degree: "6" },
  { step: 6, degree: "♭7" },
  { step: 6, degree: "7" },
];

// Label any pitch class relative to a key: spelled note name + chromatic degree.
// Used for ghost labels on out-of-scale frets.
export function chromaticLabel(key: Key, pc: number): { name: string; degree: string } {
  const { step, degree } = CHROMATIC[mod(pc - key.tonicPc, 12)];
  const tonicLetterIdx = LETTERS.indexOf(key.letter as (typeof LETTERS)[number]);
  return { name: spell(tonicLetterIdx + step, pc), degree };
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

// The ascending interval run for the Intervals overlay. Starting from the
// anchor's lowest instance in the box, each next note is a diatonic `interval`
// (a 2nd, 3rd, …) above the previous — N-1 scale steps, since the box's notes
// are consecutive scale degrees. It climbs continuously across octaves (it does
// not restart each octave) until the box ends. Returns the run notes in order.
export function intervalRun(box: Note[], anchorDeg: number, interval: number): Note[] {
  const start = box.findIndex((n) => n.degree === anchorDeg);
  if (start < 0) return [];
  const step = Math.max(1, interval - 1);
  const run: Note[] = [];
  for (let i = start; i < box.length; i += step) run.push(box[i]);
  return run;
}

// A chord progression as an ordered list of scale degrees — the Progressions
// overlay lights these degrees in the box (quality isn't shown, only the roots).
// Labelled with the common major-key roman numerals; the degrees are positional,
// so they hold in any scale.
export type Progression = { id: string; label: string; degrees: number[] };

export const PROGRESSIONS: Progression[] = [
  { id: "ii-V-I", label: "ii–V–I", degrees: [2, 5, 1] },
  { id: "vi-ii-V-I", label: "vi–ii–V–I", degrees: [6, 2, 5, 1] },
  { id: "I-vi-ii-V", label: "I–vi–ii–V", degrees: [1, 6, 2, 5] },
  { id: "I-IV-V", label: "I–IV–V", degrees: [1, 4, 5] },
  { id: "I-V-vi-IV", label: "I–V–vi–IV", degrees: [1, 5, 6, 4] },
  { id: "I-vi-IV-V", label: "I–vi–IV–V", degrees: [1, 6, 4, 5] },
];

// The close root-position triad of `degree` in the box: the lowest root plus the
// 3rd and 5th above it. Because the box's notes are consecutive scale degrees,
// those are simply box[i], box[i+2], box[i+4]. Trimmed to whatever fits the box.
export function boxTriad(box: Note[], degree: number): Note[] {
  const i = box.findIndex((n) => n.degree === degree);
  if (i < 0) return [];
  return [i, i + 2, i + 4].filter((j) => j < box.length).map((j) => box[j]);
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
