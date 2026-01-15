# Refining Semantic Badge Borders

Standardize semantic badge borders to use "subtle" values: 300 in light mode and 700 in dark mode.

## Proposed Changes

### [Styles]

#### [MODIFY] [semantics.css](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/styles/semantics.css)
- Update primary status border tokens (alert, warning, success, info) to use primitive 300 tokens in light mode and 700 tokens in dark mode.
- Ensure `_subtle` variants align with these values.

### [Components]

#### [VERIFY] [StatusBadge.tsx](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/features/Schedule/StatusBadge.tsx)
- Ensure it uses the semantic border tokens correctly.

## Verification Plan

### Manual Verification
- View badges in light mode and verify borders are lighter (300).
- View badges in dark mode and verify borders are 700.
