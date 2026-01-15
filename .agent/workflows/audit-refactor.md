---
description: Identify refactoring opportunities without fixing.
---

# Audit Refactor Workflow

Identify code smells and refactoring opportunities.

## Steps

1. **Project Invariants**: Check `docs/knowledge-base/SPEC-*.md` and `RULES-*.md` for code style constraints.

2. **Target**: Identify scope.

3. **Audit**: Check for duplication, complexity, pattern violations, dead code per the `audit/refactor-opportunities` skill.

4. **Report**: Prioritized list with effort estimates.

## Suggested Next Steps

Review findings above. When ready:
- `/quick-fix` — for atomic fixes (≤30 lines, ≤5 files)
- `/refactor` — for behavior-preserving restructuring

## Artifacts Produced
- Findings report

## Notes
- Uses the `audit/refactor-opportunities` skill
- Identify only — fixes go through `/refactor` or `/quick-fix`
