---
description: Wrap-up
---

# Wrap-Up Workflow

Finalize work session with verification, cleanup, and documentation.

## Steps

// turbo
1. **Verify (Technical)**: Run `npm run lint` and `npm run build`. Fix any errors.

2. **Verify (Functional Intent)**: Beyond lint/build, verify project-specific rules are satisfied:
   - Grep for patterns that should/shouldn't exist
   - Confirm stylistic mandates from `docs/knowledge-base/` are honored
   - Example: If project has "No Bold" rule, verify no `font-weight: 700` remains

3. **Cleanup**: 
   - Remove dead code
   - Remove console.log statements
   - Add architectural invariant comments

4. **Document**: Update `walkthrough.md` artifact with:
   - Changes made
   - Testing performed
   - Key decisions

5. **Changelog & Specs**: 
   - Update `CHANGELOG.md` with summary
   - Update relevant `docs/knowledge-base/*.md` files for architectural or token changes

6. **Archive Artifacts**: 
   - Move completed `implementation_plan.md` to `docs/archive/` with dated filename
   - Move audit reports to `docs/archive/` if applicable

## Artifacts Produced
- `walkthrough.md` artifact (updated)
- `CHANGELOG.md` (updated)
- `docs/knowledge-base/*.md` (if specs changed)

## Notes
- This is the standard session finalization
- Always run after `/build` or significant changes
