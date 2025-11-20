# High-Craft CSS Principles

This document codifies the core principles and patterns for writing CSS in the Safety Check App project. Adhering to these guidelines is essential for maintaining a consistent, robust, and high-craft user interface.

---

### Core Principles

#### 1. Master the Box Model, Especially Positioning

The CSS Box Model is not optional knowledge. Before using `position: absolute` or `position: fixed`, you must be able to answer:

-   **What is its "positioned ancestor"?**
-   **How will it get its width and height?** Never assume an element will "just know" its size.

##### The Component Variable Contract
This powerful pattern allows components to communicate layout information to the rest of the application.

-   **The Contract:** A component can measure its own dimensions (e.g., height) after it renders and set that value as a CSS Custom Property (variable) on the `:root` element.
-   **The Benefit:** Other components can then use this variable in their own CSS (e.g., with `calc()`) to dynamically position themselves relative to the first component.
-   **Example:** The `FloatingFooter` sets `--footer-height`. The content area uses `padding-bottom: var(--footer-height)` to ensure no content is ever obscured.

##### The Visual Viewport Contract
Handling full-screen layouts on mobile browsers requires more than just `100vh`.

-   **The Problem:** `100vh` refers to the *Layout Viewport*, which often includes the area *behind* the on-screen keyboard. When the keyboard opens, `100vh` elements are pushed up or covered, hiding critical actions.
-   **The Solution:** We use a `useVisualViewport` hook to listen for resize events and set a `--visual-viewport-height` variable.
-   **The Contract:** Any full-screen overlay (like `CheckFormView`) that contains input fields **must** set its height to `var(--visual-viewport-height, 100dvh)`. This ensures the bottom of the component is always visible, even when the keyboard is open.
-   **The Footer Padding Contract:** Scrollable containers must always include `padding-bottom: var(--footer-height)` (plus any safe area insets) to ensure the last item in the list is never hidden behind a fixed footer.

#### 2. Diagnose, Don't Guess

When debugging a UI issue, follow this simple diagnostic process:
1.  **Isolate:** Find the exact failing element.
2.  **Inspect:** Analyze "Computed" styles.
3.  **Hypothesize:** Form a hypothesis based on CSS fundamentals.
4.  **Test:** Use the browser's style editor to test in real-time.

#### 3. Trust, but Verify the Final DOM

React components and libraries (Radix, Framer Motion) change the DOM structure. Always debug the final rendered HTML in the browser's "Elements" panel, not the JSX.

#### 4. Use Sentence Case for Readability

To ensure maximum readability and accessibility, all UI text should use sentence case or title case. **Do not use `text-transform: uppercase;`** for headers, titles, or labels.

#### 5. Design for Layout Stability

CSS should be written defensively to prevent elements from "jumping" as content or state changes.

-   **The Contract:** When an element is only sometimes visible, its container must **always reserve the necessary space** for it.

---

### Key Architectural Patterns

#### Interaction State Philosophy (`:hover` vs. `:active`)

1.  **`:active` is for Universal Feedback:** Applied universally to provide immediate confirmation on tap or click.
2.  **`:hover` is a Progressive Enhancement:** All `:hover` styles **must** be wrapped in a `@media (hover: hover)` block to prevent "sticky hover" issues on touch devices.

#### The "Safe Zone" Padding Contract for Focus Rings

Any container component with `overflow: hidden` **must provide an internal "safe zone" of padding** (standard is `2px`) to ensure the focus rings of its children are not clipped.

#### The Mobile Drill-Down Contract

To replicate native "Push" and "Pop" page transitions on the web (e.g., iOS NavigationController):

1.  **The Container:** Must be `position: relative` and `overflow: hidden`. This creates the "viewport" or "stage" for the sliding pages.
2.  **The Pages:** Must be `position: absolute` with `inset: 0`. This allows the entering page and exiting page to exist simultaneously within the viewport without stacking vertically, preventing layout jumps during the transition.

#### The Icon Alignment Contract (`ActionListItem`)

In lists where some items have icons and others do not (e.g., mixed selection lists):

-   **Rule:** Text labels must always align vertically with each other to reduce visual noise.
-   **Implementation:** Use a dedicated `leadingIconContainer` (or an `indent` prop) with a fixed width (e.g., `24px`) to reserve space on the left side of the item, even when the icon itself is absent.

#### The Shared Menu System (`menu.css`)

To enforce the "Single Source of Truth" principle, we use a shared, global stylesheet (`.menu-popover`, `.menu-item`) for all list-based selection components (Dropdowns, Context Menus, Selects).

#### The Bottom Sheet Modal Contract for Mobile Actions

For mobile-first contextual actions, use a "Bottom Sheet" modal pattern (via `vaul`) instead of centered modals. This preserves context and improves ergonomics.

#### The Icon Badging Pattern for Visual Status

Use a consistent pattern of prominent icons paired with semantic background colors to communicate status visually (e.g., warning triangle + yellow background for special resident classifications).

#### The Sticky Stacking Context

When using `position: sticky` for list headers (e.g., "Late", "Due Soon"):

-   **Rule:** The sticky element must have an opaque background color (usually `var(--surface-bg-secondary)` or `var(--surface-bg-tertiary)`) to prevent content from "bleeding" through it as it scrolls underneath.
-   **Rule:** It must utilize the `top: var(--header-height)` variable to stack perfectly beneath the global floating header.