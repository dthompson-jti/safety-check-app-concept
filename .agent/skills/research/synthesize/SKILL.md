---
name: research-synthesize
description: Apply external research findings to project context. Use when you have research documents and need to map them to actionable recommendations.
---

# Research Synthesize

Apply external research findings to the project.

## When to Use
- Have research documents to process
- Need to map findings to project constraints
- Filtering relevant insights

## Approach

### Phase 1: Research Ingestion
- Document inventory
- Cross-reference themes

### Phase 2: Relevance Filtering
Score each finding:

| Finding | Relevance (1-5) | Feasibility (1-5) | Alignment (1-5) |
|---------|-----------------|-------------------|-----------------|
| ... | ... | ... | ... |

**Threshold**: Discard if Relevance < 3 OR Feasibility < 3.

### Phase 3: Mapping to Existing Systems
- Map to design tokens/components
- Note adaptation requirements
- Check dependency constraints

### Phase 4: Recommendation Synthesis
- Ranked recommendations
- Implementation hints
- Open questions

## Output
`RESEARCH-APPLICATION-[FEATURE-NAME].md` ending with: "These are the top recommendations. Ready for PRD scoping?"

## Constraints
- No original ideation — recommendations trace to research
- No new dependencies without approval
- No code generation
