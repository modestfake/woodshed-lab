# Intervals and progressions are overlays on the 3NPS box, not separate exercises

Every other curriculum item is its own flat entry in the `EXERCISES` registry, but
intervals and progressions are not — they are an **Overlay** picker (None / Intervals
/ Progressions) inside the existing 3NPS view. Selecting an overlay re-colours which
box notes are emphasised and what Play runs over; key, scale, box, labels, and tempo
stay put. The point is that they are the *same fretboard* — you keep your box and just
layer a harmonic lens over it, which a separate exercise (with its own state and a
remount) would throw away.

## Considered options

- **Separate registry entries** ("3NPS — Intervals", "3NPS — Progressions"): more
  discoverable in the sidebar, but each is its own component/state, so switching loses
  the current key/scale/box (or forces a shared store) and breaks the "same board" feel.
- **Two always-on selects** (Interval + Progression dropdowns): they both drive the one
  highlight layer, so they'd fight; the overlay picker makes the either/or explicit.

## Consequences

- The sidebar will not list intervals/progressions as their own items — a reader
  expecting the flat-registry pattern should look inside the 3NPS view instead.
- `Fretboard` grows a third visual tier (box-context vs selected) to support overlays.
