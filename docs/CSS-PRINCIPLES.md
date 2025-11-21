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
-   **The Default State Contract:** Components should default to their most stable, symmetric state in CSS. Modifiers (via data attributes) should only apply asymmetric changes. This prevents "Flash of Unstyled Content" (FOUC) or layout shifts during JS hydration.
-   **The Persistent Chrome Contract:** Structural elements like Headers and Footers should generally remain mounted. Conditional rendering of these elements changes the layout viewport size, causing underlying content to jump. Use Z-index layering to hide them if necessary.

---

### Key Architectural Patterns

#### The Z-Index Layering Contract

To prevent visual bleeding during full-screen transitions, we adhere to a strict Z-index hierarchy:

1.  **Content (1):** Standard scrolling views.
2.  **Chrome (50):** App Header, Footer, and Offline Banner.
3.  **Navigation (100):** Side Menu and Backdrops.
4.  **Overlays (105):** Full-screen tools (Scanner, NFC Writer, Forms) that must cover everything.
5.  **Sheets (110+):** Bottom sheet modals (Vaul) that sit on top of full-screen overlays.

#### Interaction State Philosophy (`:hover` vs. `:active`)

1.  **`:active` is for Universal Feedback:** Applied universally to provide immediate confirmation on tap or click.
2.  **`:hover` is a Progressive Enhancement:** All `:hover` styles **must** be wrapped in a `@media (hover: hover)` block to prevent "sticky hover" issues on touch devices.

#### The "Safe Zone" Padding Contract for Focus Rings

Any container component with `overflow: hidden` **must provide an internal "safe zone" of padding** (standard is `2px`) to ensure the focus rings of its children are not clipped.

#### The Mobile Drill-Down Contract

To replicate native "Push" and "Pop" page transitions on the web (e.g., iOS NavigationController):

1.  **The Container:** Must be `position: relative` and `overflow: hidden`. This creates the "viewport" or "stage" for the sliding pages.
2.  **The Pages:** Must be `position: absolute` with `inset: 0`. This allows the entering page and exiting page to exist simultaneously within the viewport without stacking vertically, preventing layout jumps during the transition.

#### The Touch Action Contract

To support the "Intent-Based Gesture" system (Film Strip navigation):

-   **The Rule:** Any scrollable container that exists within a gesture-controlled view must explicitly set `touch-action: pan-y`.
-   **The Why:** This tells the browser to handle vertical scrolling natively but yield horizontal swipes to the application's JavaScript handlers. Without this, the browser may capture all touch events, breaking the navigation swipe.

#### The Bottom Sheet Handle Contract

When using `Vaul` drawers directly (bypassing the generic wrapper) for custom workflows:

-   **The Rule:** You **must** manually implement the visual "handle" bar at the top of the sheet content.
-   **The Spec:** 40px width, 4px height, `surface-border-primary` color, rounded full, centered in a container with padding.
-   **The Why:** This provides the critical affordance that the sheet is swipeable/dismissible.

#### The "Golden Row" List Pattern (`list.css`)

The application uses a standardized pattern for lists to ensure consistent height, touch targets, and separator logic across Sheets, Modals, and Menus.

*   **`.list-item-root`**: The interactive container.
    *   Handles the **border-bottom** to ensure separators span the full width of the container.
    *   Enforces `min-height: 56px` for touch accessibility.
*   **`.list-item-leading`**: A fixed-width (48px) container for icons, avatars, or checkboxes.
    *   Ensures that text in `.list-item-content` aligns vertically across rows, even if one row has a wide icon and another has a narrow one.
*   **`.list-item-content`**: The fluid container for text labels and trailing actions.
    *   **Padding Logic**: If a list item has *no* leading icon, `.list-item-root` must have `data-has-leading="false"`. This triggers CSS to add left padding to `.list-item-content`, preventing text from hugging the screen edge.