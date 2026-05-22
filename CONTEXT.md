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

**Interval** _(Phase 2)_:
The distance between two notes (3rd, 6th, ♭7). Distinct from **scale degree**,
which is a fixed position in the scale.
_Avoid_: degree

### UI

**Label mode**:
Whether dots show note names (C, D, E…) or scale degrees (1, 2, ♭3…).
_Avoid_: display mode, view

## Flagged ambiguities

- **box vs position** — in CAGED/pentatonic worlds "position" implies two-note-per-
  string shapes. Here a box is strictly 3NPS. Use **box**.
- **key vs scale vs mode** — **key** = tonic; **scale** = the interval set; a
  **mode** is just one of the scales in the list, not a separate axis of choice.
- **degree vs interval** — **degree** is a position in the scale (1–7); **interval**
  (Phase 2) is the distance between two notes. They share glyphs (♭3) but mean
  different things.
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
