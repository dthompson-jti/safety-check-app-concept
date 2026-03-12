# Figma Color Reconciliation Updates (Concept)

Date: 2026-02-28
Project: safety-check-app-concept
Decision lock source: `design-tokens-canonical/reports/figma-update-list.md`

## Objective

Align concept with canonical outputs after Figma updates, and remove effect-level token drift from shared semantics.

## Approved Figma-Level Changes (Concept-Relevant)

1. Add `--control-fg-success` default token.
2. Add explicit alert interaction state tokens:
   - `--control-fg-alert-hover`
   - `--control-fg-alert-pressed`
   - Target state: no `default-hover` naming dependency.
3. Add/keep destructive control token family from Figma, mapped directly to primitives.
4. Add selected-pressed interaction tokens:
   - `--control-bg-selected-pressed`
   - `--control-border-selected-pressed`
5. Add translucent surface family:
   - `--surface-bg-header-translucent`
   - `--surface-bg-tertiary-translucent`
   - `--surface-bg-quaternary-translucent`
6. Add one global pulse set:
   - `--surface-bg-pulse-min`
   - `--surface-bg-pulse-max`
   - `--surface-bg-pulse-static`
7. Add navigation token families with explicit light/dark values:
   - `top-nav/*`
   - `nav/*`
8. Add global skeleton token: `--surface-bg-skeleton` (not nav-specific).
9. Add `--brand-logo-text`.
10. Enforce neutral shared shadows only.
11. Enforce utility alpha remaps to primitives alpha.
12. No design-system magma token family.
13. Do not add splash tokens to Figma; replace splash usage with canonical surface/fg tokens.

## Concept Implementation Actions After Canonical Regen

1. Replace local pulse literals with canonical global pulse tokens in:
   - `src/features/Shell/AppHeader.module.css`
   - `src/features/Shell/AppFooter.module.css`
   - `src/features/Workflow/CheckEntryView.module.css`
   - `src/components/FullScreenModal.module.css`
   - `src/features/Schedule/CheckCard.module.css`
2. Remove `magma-*` variables from shared semantic strategy; keep only component-local values if still needed for animation internals.
3. Remove local duplicate translucent/success/alert-hover aliases where canonical tokens exist.
4. Replace splash bootstrap references with canonical surface/fg semantics.
5. Maintain explicit dark selector contract (`[data-theme='dark']`) and avoid variant-prefix selectors.

## Current Out-of-Line Risks To Verify Post-Sync

1. `magma-*` variables are still spread across concept effect styles and must remain local-only.
2. `surface-bg-pulse-max` currently local in concept modules and must move to canonical global pulse token.
3. Any brand-shadow intent must remain mapped to neutral shadow semantics.

## Acceptance Criteria

1. Concept has zero unresolved non-canonical color token usages in `src/**` except approved local exceptions.
2. Pulse semantics come from canonical outputs (single global set).
3. Translucent surfaces, selected-pressed, alert hover/pressed, and destructive family come from canonical outputs.
4. `npm run audit:tokens` and `npm run audit:tokens:strict` pass with expected exception list only.
