# Note names are spelled by letter-stepping, not pitch-class lookup

Each scale degree is assigned the next musical letter (C, D, E, F, G, A, B…) and the
accidental is derived to reach the target pitch class. This produces correct,
key-aware spelling (F♯ in D, E♯ in F♯ harmonic minor) instead of a flat `pc % 12`
table that would mix sharps and flats in the same scale.

## Consequences

Theoretical keys can produce double accidentals (D♭ natural minor → B𝄫). This is
accepted as musically correct; the Degrees label mode sidesteps it entirely. Do not
"simplify" spelling back to a pitch-class table — it will break the spelling guarantee.
