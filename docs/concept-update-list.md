# Concept Update List

Date: 2026-02-28
Project: safety-check-app-concept

## Post-Figma/Canonical Sync Work

1. Adopt canonical `top-nav/*` and `nav/*` semantic families with explicit light + dark values.
2. Adopt canonical translucent glass surfaces:
   - `surface-bg-header-translucent`
   - `surface-bg-tertiary-translucent`
   - `surface-bg-quaternary-translucent`
3. Adopt canonical selected-pressed control states:
   - `control-bg-selected-pressed`
   - `control-border-selected-pressed`
4. Adopt canonical alert hover/pressed tokens and remove local dependency on `default-hover` naming.
5. Keep canonical destructive control token family (mapped directly to primitives).
6. Keep canonical `control-fg-success` default token.
7. Replace local pulse literals with one canonical global pulse set (`pulse-min/max/static`).
8. Keep `magma-*` values local to component effects only; do not expose as DS semantics.
9. Keep utility alpha aliases mapped to primitives alpha tokens.
10. Keep shared shadow semantics neutral-only.
11. Use global `--surface-bg-skeleton` (not nav-specific skeleton token).
12. Replace splash token references with canonical surface/fg semantic tokens.
13. Re-run token audits and strict audit after sync.

## Verify

1. No shared design-system magma token usage.
2. No non-canonical color token drift in `src/**` after regeneration and sync.
