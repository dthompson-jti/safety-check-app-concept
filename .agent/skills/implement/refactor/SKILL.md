---
name: implement-refactor
description: Code restructuring without behavior change. Use when improving code organization while preserving functionality.
---

# Implement Refactor

Restructure code without changing user-facing behavior.

## When to Use
- Code cleanup
- Reducing tech debt
- Improving maintainability
- Extracting shared patterns

## Artifacts
- `task.md` updated via `task_boundary`

## Approach

### Phase 1: Scope Definition
1. **Refactoring Goal**: Specific code smell or tech debt
2. **Behavior Invariants**: List behaviors that MUST NOT change
3. **Scope Boundaries**: In-scope vs out-of-scope files

### Phase 2: Safety Net
- List existing tests
- Define manual verification for each invariant

### Phase 3: Refactoring Plan
List atomic transformation steps.

**Reflexion Loop**: Act as Hostile Reviewer — identify 3 ways refactoring could break behavior. Revise plan.

### Phase 4: Execution
For each step:
1. Make one change
2. Verify behavior unchanged
3. Run `npm run lint`
4. Run `npm run build`
5. Repeat

### Phase 5: Verification
- [ ] All behavior invariants verified
- [ ] Lint/build pass
- [ ] No regressions

## Constraints
- **NO behavior changes**
- If bug discovered, note but do NOT fix (separate concern)
- Each transformation independently reversible
