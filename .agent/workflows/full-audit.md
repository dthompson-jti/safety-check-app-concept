---
description: Comprehensive visual and code audit.
---

# Full Audit Workflow

Run a comprehensive audit across multiple dimensions.

## Steps

1. **Project Invariants**: Check `docs/knowledge-base/SPEC-*.md` and `RULES-*.md` for all project constraints before beginning.

2. **Code Audit**: Architecture, types, patterns (`audit/code`)

3. **Layout Audit**: Spacing, alignment, grid (`audit/layout`)

4. **Typography Audit**: Fonts, weights, hierarchy (`audit/typography`)

5. **Design System Audit**: Tokens, components, theming (`audit/design-system`)

6. **Synthesis**: Combine findings, identify systemic issues, prioritize.

## Suggested Next Steps

Review combined findings above. When ready:
- `/quick-fix` — for atomic fixes (≤30 lines, ≤5 files)
- `/plan` — for larger remediation efforts

## Artifacts Produced
- Combined findings report

## Notes
- Orchestrates multiple audit skills
