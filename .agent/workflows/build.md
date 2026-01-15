---
description: Implement a feature from an approved plan.
---

# Build Workflow

Implement a feature from an approved implementation plan.

## Scale Note

This workflow is for implementing approved plans. For atomic fixes (≤30 lines, ≤5 files), use `/quick-fix` instead.

## Steps

1. **Pre-Flight**: Load plan, view files, confirm dev server running.
2. **Execute**: Implement changes phase by phase, running lint/build after each.
3. **Self-Correction**: Hostile QA review, fix issues silently.
4. **User Review**: Stop and ask user to verify in browser.
5. **Cleanup**: Remove dead code, add invariant comments.
6. **Wrap-Up**: Call `/wrap-up` to finalize.

## Artifacts Produced
- `task.md` artifact (updated throughout)
- `walkthrough.md` artifact (via `/wrap-up`)

## Notes
- Uses the `implement/feature` skill
- Do NOT use browser for testing — user tests manually
