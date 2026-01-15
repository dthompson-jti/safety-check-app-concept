---
description: Debug a bug with systematic root cause analysis.
---

# Debug Workflow

Systematic debugging for bugs.

## Steps

1. **Reproduce**: Document steps to reproduce, expected vs actual.
2. **Hypothesize**: Generate 3-4 hypotheses with confidence levels.
3. **Investigate**: Test hypotheses methodically.
4. **Fix**: Plan and implement fix with regression analysis.
5. **Verify**: User confirms fix in browser.

## Escalation
If bug is elusive or touches >5 files, the `debug/deep` skill is used automatically.

## Artifacts Produced
- `task.md` artifact
- `DEBUG-PLAN-*.md` (optional for complex bugs)

## Notes
- Uses `debug/standard` or `debug/deep` skills
- Do NOT use browser for testing
