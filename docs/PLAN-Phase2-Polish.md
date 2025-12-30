# Phase 2: Design Spec Alignment & Polish

## Missed Scope / New Requirements

Based on the latest Design Specification review, the following items were missed or require further refinement:

### 3. Data Table Architecture
- **Column Resizing:**
  - [ ] Implement adjustable column widths.
  - [ ] Ensure horizontal scroll works with sticky right column.
- **Sorting Polish:**
  - [ ] Sort arrow icon is too subtle -> Update to use **Secondary Token** for better contrast.

### 4. Visual Components & Tokens
- **Resident Status Badge:**
  - [ ] Icon color: Current implementation uses `var(--surface-fg-primary)` (Dark Grey). Spec asks for `fg-on-solid-primary`.
    - *Note:* `fg-on-solid-primary` is usually white/light on dark backgrounds. Verify if "Near Black" is intended or if the token name is misleading/different in this system.
    - *Action:* Verify token value. If `fg-on-solid-primary` is white, and we want "Near Black", we might need `var(--surface-fg-primary)` (which we used) or a specific "Near Black" token. If the background is transparent, a white icon would be invisible on a light theme.
    - *Refinement:* Check `semantics.css` for `fg-on-solid-primary` value.

### Verified Completed Items (Phase 1)
- [x] Header Action Buttons (Secondary style)
- [x] Side Panel Trigger (Toggle state)
- [x] Side Panel Interaction (Push layout)
- [x] Search Input (White background)
- [x] Filter Button (Secondary style)
- [x] Column Dividers
- [x] Sticky Right Column (Logic existed, refined shadow)
- [x] Row Actions (Always visible - logic checked in CSS, need to verify "Hover Only" isn't lingering)
- [x] Resident Badge Structure (Container removed)

## Implementation Plan

1.  **Token Verification:** Check `src/styles/semantics.css` for `fg-on-solid-primary` and Sort Arrow contrast.
2.  **Column Resizing:** detailed implementation of column resizing logic.
3.  **Visual Refinements:**
    - Update Sort Arrow token.
    - Double check Row Action visibility (ensure no hover dependency).
    - Verify Resident Badge color token.

## Verification
- [ ] Manual visual verification of sort arrows and resident icons.
- [ ] Test column resizing and horizontal scroll behavior.
