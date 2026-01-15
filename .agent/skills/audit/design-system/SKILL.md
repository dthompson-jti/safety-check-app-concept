---
name: audit-design-system
description: Review adherence to design system (tokens, components, theming). Use to ensure consistency with SPEC files.
---

# Audit Design System

Review adherence to the design system.

## When to Use
- After major UI changes
- Checking token usage
- Ensuring theming consistency

## Approach

### Step 1: Project Invariants (Required)
**Before auditing**, check `docs/knowledge-base/` for project-specific constraints:
- `SPEC-CSS.md` — token definitions and mandates
- `SPEC-SPACING.md` — spacing system
- `RULES-UI.md` — component and styling rules
- Flag any violation of documented invariants as **Critical** priority.

### Step 2: Focus Areas
- **Color Tokens**: Correct use of `var(--color-*)` tokens
- **Component Usage**: Using existing components, not one-offs
- **Theming**: Light/dark mode support
- **Semantic Tokens**: Using semantic tokens over primitive

### Checklist
- [ ] All colors use semantic tokens
- [ ] No inline styles with hardcoded values
- [ ] Existing components reused where possible
- [ ] Light and dark mode verified
- [ ] Custom properties follow naming convention

### Output
Findings report with specific file:line citations and token references.
