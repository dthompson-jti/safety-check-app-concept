---
name: explore-tech
description: Evaluate technical options (libraries, architecture patterns, performance tradeoffs). Use when exploring "how should we build this?" or "what library/approach should we use?"
---

# Explore Tech

Evaluate technical solutions, libraries, and architecture patterns.

## When to Use
- Evaluating library or framework options
- Exploring architectural approaches
- Analyzing performance tradeoffs
- Comparing implementation strategies

## Approach

### Phase 1: Problem Definition
Ask 3-5 probing questions to clarify:
- What problem are we solving?
- What are the constraints (performance, bundle size, learning curve)?
- What existing patterns must we integrate with?

### Phase 2: Options Analysis
Generate **3-4 distinct options** that differ meaningfully in approach.

For each option, evaluate:
- **Pros**: Benefits, alignment with existing patterns
- **Cons**: Complexity, maintenance burden, learning curve
- **Effort**: Low / Medium / High

### Phase 3: Recommendation
Synthesize findings into a clear recommendation with rationale.

## Constraints
- No code generation — exploration only
- No new dependencies not in `package.json` without explicit approval
- End with: "Which direction feels most aligned with our goals?"
