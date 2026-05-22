# Dev toolchain: pnpm + oxc (oxlint/oxfmt) + fallow, gated by lefthook

The repo started on npm + ESLint with no formatter. We moved to a Rust-native
toolchain — pnpm for installs, oxlint for linting, oxfmt for formatting, and fallow
for dead-code / duplication / circular-dependency / architecture-boundary analysis —
because the linter and formatter run as a per-edit (Claude PostToolUse) and
pre-commit gate, where speed is the whole point: the oxc tools are orders of
magnitude faster than ESLint/Prettier, so the gate stays near-instant. lefthook runs
the full gate on pre-commit (oxfmt + oxlint on staged files, then `tsc -b` + fallow
project-wide).

We chose the oxc toolchain over Biome (the other fast all-in-one) because it pairs
with fallow for the dead-code / architecture layer that neither Biome nor oxlint
covers, and over keeping ESLint+Prettier because that's exactly the slow setup we
were leaving.

Consequences worth remembering:

- **oxlint replaces ESLint outright.** We lose `eslint-plugin-react-refresh`
  (`only-export-components`), and oxlint's `react/exhaustive-deps` has documented
  behavioural diffs from `eslint-plugin-react-hooks` (occasional false positives,
  different error lines). Suppressions use `oxlint-disable`, not `eslint-disable`.
- **oxfmt is beta** (v0.51 at adoption) but passes 100% of Prettier's JS/TS
  conformance tests; swap to Prettier only if it regresses on this codebase.
- **fallow is a blocking pre-commit gate.** shadcn intentionally over-exports, so
  `components/ui/**` is in fallow's `ignoreExports` (still checked for dupes and
  circular deps, just not unused exports). First-party dead exports are still flagged
  and removed rather than ignored.
