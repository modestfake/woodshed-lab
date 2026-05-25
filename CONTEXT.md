# Woodshed Lab

An interactive guitar-practice fretboard built around a jazz curriculum. Phase 1
visualizes the 3-notes-per-string (3NPS) **box** system in any key and scale.
This file pins down the project's shared vocabulary so plans and code stay precise.

## Language

### Fretboard & boxes

**Box**:
A 3-notes-per-string fingering shape. Box _N_ starts on the _N_th scale degree on
the low E string, at its lowest playable instance, and repeats every octave.
_Avoid_: position, pattern, shape, CAGED box

**3NPS**:
Three-notes-per-string — the fingering system boxes are built on (exactly three
scale tones per string). Implies seven boxes per scale.
_Avoid_: position playing

**Diatonic map**:
Every note of the current scale across frets 0–17 — the dim base layer the active
box is highlighted over. Because the seven boxes tile the neck, it is the full
scale map.
_Avoid_: grid, all-notes view

**Active box**:
The currently selected box (1–7), drawn at full opacity over the dim map.
_Avoid_: current pattern, selection

**Playhead**:
The single note highlighted while a box is being played back note-by-note.
_Avoid_: cursor

### Scales & spelling

**Key**:
The chosen tonic pitch class and its spelling — one of 12. The key picks where a
box lands on the neck.
_Avoid_: root (the key is the choice; the root is its degree-1 note)

**Scale**:
A heptatonic (7-note) interval set, selectable independently of key — major,
natural/harmonic/melodic minor, or a mode.
_Avoid_: key (a scale is not a key), mode (a mode is one kind of scale here)

**Scale degree**:
A scale tone's index 1–7; the **root** is degree 1. Altered degrees are written
`♭3`, `♯4`, `♭7`.
_Avoid_: interval, note number

**Root**:
Degree 1 of the selected scale — the tonic. Rendered in its own colour and labelled
`1` in degrees mode.
_Avoid_: tonic (UI copy says "root"), key center

**Anchor**:
The note intervals are measured from in the Intervals overlay — any scale degree
(1–7), chosen via a select, defaulting to the root. Not necessarily the tonic.
_Avoid_: root (the root is degree 1; an anchor can be any degree)

**Interval**:
A diatonic distance measured by walking scale steps (a 2nd, 3rd, … 7th), so its
quality comes from the scale and where you start — a "3rd" from D in C major is a
minor 3rd (F). In the Intervals overlay one interval is the **run step**: from the
**anchor**, each next note is that interval above the previous, climbing the box
continuously (no per-octave reset). Distinct from **scale degree**, a fixed position
in the scale; they share glyphs but mean different things.
_Avoid_: degree

**Progression**:
A named chord progression as an ordered list of scale degrees (ii–V–I = 2, 5, 1).
The Progressions overlay shows the diatonic **triad** on each degree — the close
root-position voicing in the box (root + 3rd + 5th, ii–V–I → D-F-A · G-B-D · C-E-G),
the tonic note in the root colour. Play walks the triads in order: ascending plays
each low→high, descending high→low, back-and-forth ping-pongs, random plays a few
notes per triad then moves on.
_Avoid_: changes; quality (we voice diatonic triads, not figured chords)

### UI

**Label mode**:
Whether dots show note names (C, D, E…) or scale degrees (1, 2, ♭3…).
_Avoid_: display mode, view

**Overlay**:
A highlight layer chosen on top of the active box, mutually exclusive: **None**
(the plain box), **Intervals** (an interval run climbing the box from an anchor), or
**Progressions** (the scale degrees of a chord progression, e.g. ii–V–I = 2,5,1).
Switching overlay re-colours which box notes are emphasised; key, scale, and box
are unchanged.
_Avoid_: mode, layer, view

## Flagged ambiguities

- **box vs position** — in CAGED/pentatonic worlds "position" implies two-note-per-
  string shapes. Here a box is strictly 3NPS. Use **box**.
- **key vs scale vs mode** — **key** = tonic; **scale** = the interval set; a
  **mode** is just one of the scales in the list, not a separate axis of choice.
- **degree vs interval** — **degree** is a position in the scale (1–7); **interval**
  is the distance between two notes. They share glyphs (♭3) but mean different things.
- **root vs anchor** — **root** is the tonic (degree 1). **anchor** is whatever degree
  the Intervals overlay measures from (default the root, but any degree). "A 3rd" from
  the anchor is a true interval, not scale degree 3.
- **root vs tonic vs "1"** — the same note. UI says **root**; the degree label shows
  **1**.

## Example dialogue

> **Dev:** When I switch the key from C to E♭, does the box move?
> **Teacher:** Right — the box is a shape, so it slides up the neck. Box 1 still
> starts on the root on the low E string, just at a different fret.
>
> **Dev:** And if I pick harmonic minor instead of major?
> **Teacher:** Same seven boxes, different scale tones. Box 3 still starts on the
> third degree — which in harmonic minor is the ♭3.
>
> **Dev:** The dim notes around the lit box — are those other boxes?
> **Teacher:** They're the diatonic map, the whole scale on the neck. The seven
> boxes tile that map; you're just lighting one box of it at a time.
