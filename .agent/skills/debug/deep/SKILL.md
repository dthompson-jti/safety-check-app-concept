---
name: debug-deep
description: Tree-of-thoughts reasoning for elusive, intermittent bugs. Use when standard debugging fails or the bug is hard to reproduce.
---

# Debug Deep

Tree-of-thoughts reasoning for elusive bugs.

## When to Use
- Intermittent or hard-to-reproduce bugs
- Standard debugging failed
- Race conditions suspected
- Multiple potential causes

## Artifacts
- `DEBUG-PLAN-[BUG-ID].md`
- `task.md` updated via `task_boundary`

## Approach

### Phase 1: False Premise Challenge
List every assumption in the bug report. Test each as True/False before proceeding:
- Assumption 1: [e.g., "Bug occurs on every load"]
- Assumption 2: [e.g., "Data is correctly formatted"]

### Phase 2: Tree of Thoughts (Multi-Hypothesis)
Generate **4-6 hypotheses** with dual investigation paths:

| # | Hypothesis | Confidence | Path A | Path B | Selected |
|---|------------|------------|--------|--------|----------|
| 1 | ... | High | Check X with grep | Instrument Y | A (faster) |
| 2 | ... | Medium | Trace via debugger | Reproduce isolated | B (reliable) |

### Phase 3: Investigation & Fix Plan
- **Primary Fix Plan**: Main approach
- **Reflexion (Security Engineer)**: List 3 ways fix might fail, introduce vulnerabilities, or degrade performance
- **Fallback Plan**: If primary fails

### Phase 4: Systemic Analysis
- Does this bug represent a class of problems?
- Should a new rule be added to prevent recurrence?

## Constraints
- **Non-Linear Exploration**: Don't converge prematurely
- Must have fallback plan
- If fix fails, iterate (max 3 attempts)
