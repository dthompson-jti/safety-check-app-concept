# Color Reconciliation Strategy (Decision Tree + Case Matrix)

Generated: 2026-02-27

## Objective

Choose the best remediation path for each color delta using measurable criteria:

- visual hierarchy preservation (`fg-primary` > `fg-secondary` > `fg-tertiary`)
- WCAG safety for fg/bg pairings (target >= 4.5 for normal text)
- cross-project consistency
- source-of-truth durability

## Current Facts (Color-First)

- Core color tokens are synced across both projects from canonical outputs.
- Structured core alignment is complete for:
  - primitives core
  - semantics light core
  - semantics dark core
  - typography valid core
- Remaining color-relevant gaps:
  - Figma export contains unresolved placeholders and invalid entries:
    - `#ff00ff` placeholders in semantic files
    - `NaNrem` in typography file
  - Some non-core token families are excluded (`old-*`, `ext-*`, `remap-*`).
- WCAG and hierarchy analysis is in:
  - [color-contrast-analysis.md](/c:/Users/dthompson/Documents/CODE/design-tokens-canonical/reports/color-contrast-analysis.md)

## Decision Tree (Per Delta)

1. Is the delta in core token scope (`surface-*`, `control-*`, primitives core, valid typography)?
   - Yes: continue.
   - No: classify as non-core debt and track separately.

2. Does current color pairing fail WCAG or break visual hierarchy intent?
   - Yes: prioritize correction in source-of-truth path.
   - No: continue.

3. Is the issue caused by invalid Figma export data (`#ff00ff`, `NaNrem`, ambiguous remap)?
   - Yes: **Case A or D** (update Figma first, then propagate).
   - No: continue.

4. Is the delta localized to one project implementation (same canonical token available, usage/local override differs)?
   - Yes: **Case B** (update one project).
   - No: continue.

5. Is the delta shared by both projects but not yet in Figma canonical definitions?
   - Yes: **Case C or D**.
   - If intended design-system change: **Case D**.
   - If temporary product exception: **Case C** with explicit expiration.

## Case Matrix

## Case A: Update Figma

Use when:
- export has placeholders/invalid values
- design intent is unresolved in source-of-truth
- we need semantic naming/value correction upstream

Pros:
- fixes root cause
- prevents repeated downstream patching

Cons:
- slower short-term

Expected outputs:
- corrected Figma tokens
- regenerated canonical outputs
- re-audit both projects

## Case B: Update One Project

Use when:
- delta is implementation-only in one repo
- canonical/Figma already expresses the correct value

Pros:
- fastest containment

Cons:
- easy to miss mirrored issues

Expected outputs:
- project-local fix
- audit proof no drift introduced

## Case C: Update Both Projects

Use when:
- both repos need behavior alignment
- Figma already approved and stable

Pros:
- fast operational convergence

Cons:
- still vulnerable if Figma later changes

Expected outputs:
- both repos patched/synced
- parity checks pass

## Case D: Update All (Figma + Canonical + Both Projects)

Use when:
- high-impact semantic remap decision
- hierarchy/WCAG improvements require source + implementation shift
- long-term durability is required

Pros:
- highest integrity / lowest long-term drift

Cons:
- highest effort

Expected outputs:
- Figma update approved
- canonical regenerated
- both projects synced
- reports + audits green

## Recommended Default Policy (High-Effort, High-Integrity)

Default to **Case D** for core color token changes.

Only downgrade to B/C when all are true:
- no Figma ambiguity
- no source-token deficiency
- strictly implementation-local issue

## Remapping Decision Checklist (Color)

For each candidate remap:

1. Pairing safety:
   - fg/bg ratio >= 4.5 for normal text use
2. Hierarchy:
   - fg-primary contrast > fg-secondary > fg-tertiary on same surface
3. Dark model fit:
   - respects “lights-down” strategy (primary surfaces lighter than base canvas, not pure inversion)
4. Cross-project impact:
   - identical canonical token value in both projects after sync
5. Source durability:
   - if semantic intent changes, reflected in Figma (Case D)

## Immediate Color Work Queue

1. Resolve Figma placeholder/invalid token debt upstream (`#ff00ff`, `NaNrem`) using Case A/D.
2. Normalize unresolved color-adjacent non-core tokens into approved canonical/bridge mapping or remove.
3. Re-run contrast/hierarchy analysis after each accepted remap.
4. Keep raw geometry cleanup separate (already isolated in audit reports).

