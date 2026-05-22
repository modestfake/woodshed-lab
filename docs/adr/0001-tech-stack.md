# Tech stack: React + Vite + TypeScript with shadcn/ui on Tailwind v4

Phase 1 is an interactive fretboard whose UI keeps growing (key/scale/box controls
now, interval and II–V–I overlays planned). We chose React + Vite + TS with shadcn/ui
(Radix + Tailwind v4) over vanilla JS because the component model maps cleanly onto
the fretboard grid and the controls compose without a rewrite as curriculum features
land. shadcn copies components into the repo rather than pulling a versioned UI
package, so there's no framework lock-in to swap out later.
