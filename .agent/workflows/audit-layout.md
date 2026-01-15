---
description: Audit layout consistency (spacing, alignment, grid usage).
---

# Audit Layout Workflow

Review layout consistency across the codebase.

## Steps

1. **Project Invariants**: Check `docs/knowledge-base/SPEC-*.md` and `RULES-*.md` for layout-specific constraints before auditing.

2. **Target**: Identify scope (specific component, page, or entire app).

3. **Audit**: Check spacing tokens, alignment, grid usage, margins per the `audit/layout` skill.

4. **Report**: Document findings with file:line citations.

## Suggested Next Steps

Review findings above. When ready:
- `/quick-fix` — for atomic fixes (≤30 lines, ≤5 files)
- `/plan` — for larger remediation efforts

## Artifacts Produced
- Findings report

## Notes
- Uses the `audit/layout` skill
