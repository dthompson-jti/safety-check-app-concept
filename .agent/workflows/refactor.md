---
description: Code restructuring without behavior change.
---

# Refactor Workflow

Restructure code while preserving behavior.

## Steps

1. **Scope**: Define refactoring goal and behavior invariants.
2. **Safety Net**: List existing tests and manual verifications.
3. **Plan**: List atomic transformation steps.
4. **Execute**: Apply changes one at a time with verification.
5. **Verify**: Confirm all invariants hold.

## Artifacts Produced
- `task.md` artifact

## Notes
- Uses the `implement/refactor` skill
- NO behavior changes — if bug found, note but don't fix
