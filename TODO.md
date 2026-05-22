# Woodshed Lab — Backlog

Loose, living list. Check things off, reorder freely, dump raw ideas in the parking
lot at the bottom. (Curriculum source of truth is `src/exercises.ts`; this is the
"what to build / change" view.)

## Tooling & DX

- [x] Switch package manager to **pnpm** (do this first — scripts/hooks below build on it)
- [x] **oxlint** (lint) + **oxfmt** (format) — fast; per-edit (Claude hook) + pre-commit (lefthook) gates
- [x] **fallow** (dead-code / dupes / health / architecture drift) — in the lefthook
      pre-commit gate (`dead-code` + `dupes`); `pnpm health` (`fallow audit`) + MCP registered
- [x] Quick-access `package.json` scripts: `lint`, `format`/`format:check`, `typecheck`, `health` (fallow)
- [x] **pre-commit hook via lefthook**: oxfmt + oxlint on staged files, `tsc -b` + fallow project-wide
- [x] Claude Code hook to run oxfmt/oxlint **after editing files** (settings.json) — tsc
      deliberately excluded (whole-project, too slow per-edit; left to the commit gate)
- [x] First `oxfmt` run reformats everything — commit a checkpoint *before* it so the
      reformat lands as its own commit

## Phase 2 — exercises to build

Each is a `soon` stub in `src/exercises.ts`; building one = a component + flipping it
to `status: "live"`.

- [ ] Intervals in the box — overlay 3rds/6ths/♭7 relative to a chosen root
- [ ] II–V–I across the neck in a key
- [ ] One note of II–V–I per key
- [ ] Modes on one string
- [ ] Pentatonics (its own renderer — not the 3NPS box engine; see ADR 0006)
- [ ] Chromatic targeting (note above / below / it)
- [ ] Bebop scale on the dominant
- [ ] Dominant alterations
- [ ] Voice leading
- [ ] Harmonic minor (engine already supports the scale — dedicated drill?)
- [ ] Diminished + arpeggio
- [ ] Pentachord
- [ ] Pyramid exercise
- [ ] Autumn Leaves (application song)

## Features & enhancements

- [ ] **Circle-of-fifths key picker** — replace the Key `<Select>` with a clickable circle of fifths
- [ ] **Box playback randomizer** — play the box's notes in random order (ear training)
- [ ] Icons on the **Notes / Degrees** toggle
- [ ] Hover an out-of-scale fret → faint **ghost label**: chromatic note name (Notes
      mode) / chromatic degree like `♯4`, `♭7` (Degrees mode). Dots stay scale-only;
      ties into the chromatic-targeting exercise
- [ ] Tempo control for box playback (BPM slider; currently fixed `STEP_MS = 300`)
- [ ] Ascending / descending (and loop) playback toggle
- [ ] Per-box tinting in the dim layer so you can see boxes interlock
- [ ] Highlight a selected root and show intervals from it
- [ ] Alternate tunings / capo (TUNING is already data-driven in `theory.ts`)
- [ ] Metronome
- [ ] Cool-neutral theme option (bluish backgrounds, not just accents)

## Design & UX

- [ ] **Audit shadcn usage** — are we reaching for the right components? e.g. the left nav
      could be a shadcn sidebar / navigation-menu instead of hand-rolled buttons
- [ ] **Curate palettes** — keep just a few good ones, drop the rest
- [x] **Better keybindings hint** — shadcn `Popover` + `Kbd` in the header (`ShortcutsHelp`)
- [ ] Revisit overall design once a couple exercises exist (look for shared patterns;
      possibly with Pencil)
- [ ] **Header cleanup** — drop in the new logo; consider removing the subtitle
      (it's box-specific, not app-wide)
- [ ] Logo — Pencil prompt drafted; pick a direction, generate, wire into header + favicon
- [ ] Replace the default Vite `favicon.svg`

## Content & docs

- [ ] **Name the system correctly** — research the proper name (it's standard
      *3-notes-per-string*; the "Ted Greene" attribution is likely off — confirm), then
      sharpen the **Boxes** description so it's actually clear what it is
- [ ] Establish a consistent **title + description pattern** for every exercise page
      (drives the `label`/`description` fields in `src/exercises.ts`)

## Polish & tech debt

- [ ] Remove the temporary `PaletteSwitcher` once palettes are curated (Magenta Dream is default)
- [ ] Rename `fretboard-lab-theme` localStorage key → `woodshed-lab-theme` (one-time theme reset)
- [ ] Decide on `.agents/` / `.claude/` / `skills-lock.json` — keep committed vs gitignore
- [ ] Commit the current uncommitted work (cleanup / refactor / docs — consider splitting)
- [ ] ~~Tests on `theory.ts`~~ — declined for now (personal project)

## Parking lot — raw ideas

<!-- dump anything here, half-formed is fine -->

-
