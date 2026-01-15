---
name: plan-feature
description: Create a lightweight implementation plan for medium-scope features (1-5 files). Use when you need a plan but not a full PRD.
---

# Plan Feature

Create a lightweight implementation plan for medium-scope features.

## When to Use
- Medium features (1-5 files)
- Clear requirements, no UX exploration needed
- Standard patterns apply

## Artifacts
- `implementation_plan.md` artifact
- `task.md` updated via `task_boundary`

## Approach

### Phase 1: Discovery & Impact
1. **Proof of Understanding**: Summarize feature in one sentence.
2. **Holistic Impact Analysis**: What else might this affect?

### Phase 2: Approach Evaluation
Generate **3-4 strategies**.

Evaluate with brief Socratic Debate:
- Proponent: Benefits, consistency with patterns
- Adversary: Complexity, maintenance burden
- Synthesis: Final selection

### Phase 3: Design & Execution

#### File Changes Table
| Status | File | Changes |
|--------|------|---------|
| [NEW] | ... | ... |
| [MODIFY] | ... | ... |

#### Phased Implementation
Break into atomic, testable steps.

### Phase 4: Reflexion
Hostile Architect Review: Identify 3 tech debt risks.

## Constraints
- No code generation — plan only
- Steps must be atomic and testable
- No one-off patterns
