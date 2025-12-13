# PRD 2: Keyboard Interaction & Viewport Strategy

### 1. Overview
This initiative addresses the "Keyboard Cover-up" problem inherent in mobile web apps. By implementing a rigorous **Visual Viewport Contract**, we ensure that critical actions (Save, Login) remain visible and accessible when the virtual keyboard is active, mimicking native iOS/Android behavior.

### 2. Problem & Goals
**The Problem:** When a user focuses on an input field on mobile, the keyboard slides up.
1.  In `LoginView`, the "Sign In" button is often pushed off-screen.
2.  In `CheckEntryView`, the sticky footer might be obscured by the browser's bottom bar or the keyboard itself if `100vh` is used instead of `visualViewport.height`.
3.  The active input field might be hidden behind the sticky footer.

**The Goal:**
*   **Sticky Stability:** Footers must stick precisely to the top of the keyboard.
*   **Auto-Scroll:** The active input must automatically scroll into the visible "Safe Zone".
*   **Consistency:** Apply this behavior to both Login and Check Entry views.

### 3. Scope & Key Initiatives
**In Scope:**
*   **Hooks:** Refine `useVisualViewport` and create `useScrollToFocused`.
*   **CSS:** Refactor `LoginView` to use the `AppShell` layout primitives (or similar structure) to support viewport-height logic.
*   **Components:** Update `CheckEntryView` to utilize the new scroll logic.

**Out of Scope:**
*   Handling landscape orientation on small phones (we will allow standard scrolling behavior there as sticky footers consume too much vertical space).

### 4. UX/UI Specification & Wireframes

**Behavioral Design:**
*   **Event:** User taps "Notes" textarea.
*   **Reaction 1:** Keyboard slides up.
*   **Reaction 2:** `visualViewport` resizes. The `--visual-viewport-height` CSS variable updates.
*   **Reaction 3:** The `.footer` (positioned `bottom: 0` inside the relative container) moves up instantly.
*   **Reaction 4:** The app calculates if the textarea is covered. If yes, it smooth-scrolls the `main` container to center the textarea.

**Visual Contract (The Viewport Stack):**
```text
[ Mobile Screen - Keyboard Open ]
+--------------------------------------------------+
| Header (Sticky Top)                              |
+--------------------------------------------------+
| Main Content (Overflow-y: auto)                  |
|                                                  |
|  [ Input Field 1 ]                               |
|  [ Input Field 2 (FOCUSED) ] <--- Auto-scrolled  |
|    | Cursor |                     to center      |
|                                                  |
+--------------------------------------------------+
| Footer (Sticky Bottom of Viewport)               |
| [ Save Button ]                                  |
+--------------------------------------------------+
|                                                  |
|  ( Virtual Keyboard Area )                       |
|  ( Height determined by OS )                     |
|                                                  |
+--------------------------------------------------+
```

### 5. Architecture & Implementation Plan

**A. The Visual Viewport Hook (`src/data/useVisualViewport.ts`)**
We will refine the existing hook. It must listen to `visualViewport.resize` and `visualViewport.scroll`.
*   **Refinement:** Ensure it sets not just height, but also `offsetTop` if the browser pushes the layout up (common in Android).

**B. The Scroll-Assist Hook (`src/data/useScrollToFocused.ts`)** `[NEW]`
A hook that attaches a global `focusin` listener (or specific ref listeners).
*   **Logic:**
    1.  Get `activeElement` bounding rect.
    2.  Get `visualViewport.height`.
    3.  Get Footer Height (via `--footer-height` or `--form-footer-height` variable).
    4.  Calculate `visibleSpace = viewportHeight - footerHeight - headerHeight`.
    5.  If element is outside `visibleSpace`, scroll `element.scrollIntoView({ block: 'center', behavior: 'smooth' })`.

**C. Login View Refactor**
Currently, `LoginView` might be using `100vh`. We need to change the wrapper to:
```css
.loginContainer {
  height: 100vh; /* Fallback */
  height: var(--visual-viewport-height, 100dvh);
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Pushes footer down */
}
```

### 6. File Manifest

**Directory: `src/data`**
*   `useVisualViewport.ts` `[MODIFIED]`: Add debounce and offset handling for Android stability.
*   `useScrollToFocused.ts` `[NEW]`: The logic to keep inputs visible.

**Directory: `src/features/Session`**
*   `LoginView.tsx` `[MODIFIED]`: Wrap in a container that respects `--visual-viewport-height`.
*   `LoginView.module.css` `[MODIFIED]`: Update layout to flex-column with sticky footer logic.

**Directory: `src/features/Workflow`**
*   `CheckEntryView.tsx` `[MODIFIED]`: Integrate `useScrollToFocused`.

### 7. Unintended Consequences Check
*   **iOS "Bounce":** When scrolling to focus, iOS sometimes over-scrolls the whole page (rubber band effect).
    *   *Check:* Ensure `overscroll-behavior-y: none` is applied to the root container in `index.css`.
*   **Desktop Browsers:** `visualViewport` API exists on desktop but behaves differently during window resize.
    *   *Check:* Ensure the hook doesn't cause layout thrashing on desktop window resizes.

### 8. Risks & Mitigations
*   **Risk:** "Jumpiness" on Android. Android keyboards sometimes resize the window, sometimes overlay.
    *   **Mitigation:** The `useVisualViewport` hook will use `requestAnimationFrame` to ensure the CSS variable update happens in sync with the paint cycle.
*   **Risk:** Input hidden behind the sticky footer.
    *   **Mitigation:** The `useScrollToFocused` hook specifically accounts for `--form-footer-height` in its calculation.

### 9. Definition of Done
1.  **Login View:** On mobile, tapping the "Username" field opens the keyboard. The "Sign In" button remains visible above the keyboard.
2.  **Check Entry:** Tapping the "Notes" field (bottom of form) opens the keyboard. The "Save" button moves up with the keyboard.
3.  **Auto-Scroll:** When "Notes" is tapped, the form automatically scrolls so the text cursor is clearly visible and not hidden by the "Save" button.
4.  **Desktop:** No regression in layout behavior on desktop browsers.