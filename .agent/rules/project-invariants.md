# Project Invariants Rule

Before auditing or implementing, always check for project-specific constraints.

## Required Checks

### Before Any Audit
1. Review `docs/knowledge-base/SPEC-*.md` for token and style mandates
2. Review `docs/knowledge-base/RULES-*.md` for behavioral rules
3. Review `docs/knowledge-base/AGENTS.md` for code patterns

### Priority Handling
- Any violation of a documented invariant is automatically **Critical** priority
- These take precedence over generic best practices

## Examples of Project Invariants
- Typography: "No bold text" or "Weights limited to 400/500"
- Spacing: "Use gap, not margins"
- Colors: "Use semantic tokens only"
- Code: "No `as any` casts"

## Why This Matters
Generic audits miss project-specific rules. This step ensures audits align with the project's "Gold Standard" rather than general best practices.
