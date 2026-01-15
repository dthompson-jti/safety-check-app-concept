---
description: Atomic fix for small bugs or tweaks (≤30 lines, ≤5 files).
---

# Quick Fix Workflow

Atomic code changes for small-scope fixes.

## Steps

1. **Scope Check**: Confirm ≤30 lines, ≤5 files. If larger, escalate to `/plan`.
2. **High-Risk Gate**: If touching config/security paths, stop and notify.
3. **Implement**: Make the change with lint/build verification.
4. **User Review**: Ask user to verify in browser.

## Artifacts Produced
- `task.md` artifact

## Notes
- Uses the `implement/quick-fix` skill
- Do NOT use browser for testing
