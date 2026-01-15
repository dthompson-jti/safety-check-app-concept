# Design System Rule

Always use design system tokens. Never use hardcoded values.

## Token Categories
- **Colors**: `var(--color-*)` — never use hex/rgb directly
- **Spacing**: `var(--spacing-*)` — never use px values directly
- **Typography**: `var(--font-size-*)`, `var(--font-weight-*)`
- **Borders**: `var(--border-radius-*)`, `var(--border-width-*)`

## References
Check your project's `docs/knowledge-base/` for:
- `SPEC-CSS.md` — Token definitions
- `SPEC-SPACING.md` — Spacing system
- Other SPEC files for your design system

## Violations
If you cannot map a value to an existing token:
1. Flag it as a potential "Hallucination"
2. Ask if a new token should be created
3. Never proceed with a hardcoded value
