# Boxes are transposable shapes at their lowest playable instance; neck is frets 0–17

A box is stored once as a set of `(string, fret-offset-from-root)` positions and
transposed onto the neck for the chosen key, rather than anchored to fixed neck
regions. We always render the lowest playable instance (low-E root at fret 0–11).

## Considered options

- Fixed neck regions per box — rejected, because the box wouldn't move when the key
  changes, which is the whole point of the system.

## Consequences

The worst-case box top lands exactly on fret 17, which is why the neck spans **0–17**.
A 0–12 or 0–15 neck would clip the highest boxes in sharp keys.
