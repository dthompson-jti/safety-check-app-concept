# IDEA-001: Core Workflow Accessibility Remediation

**Status:** Proposed
**Area:** UI/UX / Accessibility
**Impact:** High (Blocking for Assistive Tech)

## 1. The Problem

The current prototype relies heavily on `div` elements with `onClick` handlers for its primary interactive list items, specifically the `CheckCard` component.

*   **Keyboard Navigation:** Users cannot Tab to these cards.
*   **Activation:** Users cannot activate them via `Enter` or `Space`.
*   **Semantics:** Screen readers announce them as generic groups, not interactive buttons.

This violates WCAG 2.1 Success Criterion 2.1.1 (Keyboard) and 4.1.2 (Name, Role, Value).

## 2. Proposed Solution

Refactor core interactive cards to use semantic button elements.

### A. The Check Card Refactor

Convert `CheckCard.tsx` from `motion.div` to `motion.button`.

**Requirements:**
1.  **Reset Browser Styles:** Ensure the `button` element inherits zero default styles (border, background, padding) to match the current card design.
2.  **Focus Visibility:** Ensure the focus ring is visible but follows the card's `border-radius`.
    *   *Note:* `CSS-PRINCIPLES.md` mentions a "Safe Zone" contract for focus rings. We must ensure the card's parent container or the card itself handles the outline offset correctly so it isn't clipped.
3.  **Keyboard Listeners:** By using `<button>`, we get `Enter` and `Space` activation for free.

### B. Impacted Files

*   `src/features/Schedule/CheckCard.tsx`
*   `src/features/Schedule/CheckCard.module.css` (Add `display: block; width: 100%; text-align: left;` to reset button behavior)

### C. Future Considerations

*   **Context Menu:** If we add long-press actions, we must ensure they are accessible via keyboard shortcut or a visible "More Options" button.
*   **Swipe Actions:** If swipe-to-complete is added, equivalent buttons must remain visible or accessible via a mode toggle.

## 3. Verification Plan

1.  **Tab Test:** Verify that hitting `Tab` moves focus sequentially through the check list.
2.  **Activation Test:** Verify that pressing `Enter` on a focused card opens the form.
3.  **Screen Reader Test:** Verify that NVDA/VoiceOver announces "Button: Room 101, Due, [Status Details]".
