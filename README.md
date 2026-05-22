# Woodshed Lab

An interactive guitar-practice fretboard for jazz students. Phase 1 visualizes the
**3-notes-per-string (3NPS) box system** across any key and scale.

## Features

- **Fretboard** (frets 0–17, standard tuning) showing the full diatonic map of the
  selected scale.
- **7 boxes per scale** — step through them; the active box lights up over the map.
- **12 keys** with correct enharmonic spelling, plus **major, natural / harmonic /
  melodic minor, and the diatonic modes**.
- **Note names ⇄ scale degrees** toggle (`1 2 ♭3 4 5 ♭6 ♭7`).
- **Click any fret to hear it** — Karplus–Strong string synthesis voiced like a warm
  jazz neck pickup (no samples, pure Web Audio).
- **Play the active box** note-by-note, with the playhead highlighted.
- **Light / dark theme** and a live **palette switcher** (temporary, for design).

## Keyboard

| Key | Action |
| --- | --- |
| `←` / `→` | switch box |
| `↑` / `↓` | cycle palette |
| `T` | toggle light / dark |
| `Space` | play the box |

## Stack

React + Vite + TypeScript · Tailwind v4 · shadcn/ui · Web Audio.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## Layout

- `src/lib/theory.ts` — the music engine (scales, boxes, spelling); pure, no React.
- `src/lib/audio.ts` — plucked-string synthesis.
- `src/exercises.ts` — the curriculum registry (only **Boxes** is live in Phase 1).
- `src/components/` — UI; `BoxTrainer` is the live exercise, `Fretboard` renders the neck.
- `CONTEXT.md` — domain glossary (the box-system vocabulary).
- `docs/adr/` — architecture decision records.
