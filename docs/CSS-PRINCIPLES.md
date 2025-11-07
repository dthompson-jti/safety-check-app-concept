# High-Craft CSS Principles

This document codifies the core principles and patterns for writing CSS in the Safety Check App project. Adhering to these guidelines is essential for maintaining a consistent, robust, and high-craft user interface.

---

### Core Principles

#### 1. Master the Box Model, Especially Positioning

The CSS Box Model is not optional knowledge. Before using `position: absolute` or `position: fixed`, you must be able to answer:

-   **What is its "positioned ancestor"?** If none exists, it will be the viewport.
-   **How will it get its width and height?** Have I provided explicit dimensions (`width`, `height`) or constraints (`top`, `right`, `bottom`, `left`)?
-   Never assume an element will "just know" its size. You must declare it.

##### The Component Variable Contract
This powerful pattern allows components to communicate layout information to the rest of the application.

-   **The Contract:** A component can measure its own dimensions (e.g., height) after it renders and set that value as a CSS Custom Property (variable) on the `:root` element (i.e., `document.documentElement.style.setProperty(...)`).
-   **The Benefit:** Other components, even in completely different parts of the DOM tree, can then use this variable in their own CSS (e.g., with `calc()`) to dynamically position themselves relative to the first component. This creates a robust, decoupled layout system that adapts automatically.
-   **Example:** The `FloatingFooter` sets `--footer-height`. The global `toast.css` stylesheet uses `bottom: calc(var(--footer-height) + 16px)` to ensure toasts always appear perfectly above the footer, no matter its size.

#### 2. Diagnose, Don't Guess

When debugging a UI issue, follow this simple diagnostic process to find the root cause instead of guessing at solutions:

1.  **Isolate:** Use the browser inspector to find the exact element that is failing.
2.  **Inspect:** Analyze its "Computed" styles. Don't just look at the CSS you wrote; look at what the browser *actually rendered*. A `width: 0px` or unexpected `margin` is the key clue.
3.  **Hypothesize:** Form a hypothesis based on CSS fundamentals. "My hypothesis is the element has no width because it's absolutely positioned without horizontal constraints."
4.  **Test:** Use the browser's style editor to test your hypothesis in real-time (e.g., add `left: 0; right: 0;`). If it works, you've found the solution.

#### 3. Trust, but Verify the Final DOM

React components, UI libraries (Radix), and animation libraries (Framer Motion) can all add wrapper `divs` or change the final DOM structure. Your React code is not the final source of truth—the browser's "Elements" panel is. Always debug the final rendered HTML, not the JSX you assume is being rendered.

---

### Key Architectural Patterns

#### The "Safe Zone" Padding Contract for Focus Rings

To ensure visual consistency and prevent UI bugs, we have standardized on a **`2px` outer focus ring** for all interactive components.

-   **Problem:** Parent containers with `overflow: hidden` (like accordions) will clip this outer focus ring, making it invisible and creating an accessibility issue.
-   **Solution (The Contract):** Any container component that must use `overflow: hidden` **must also provide an internal "safe zone" of padding** to accommodate the focus rings of its children.
-   **Implementation:** The standard safe zone is a `2px` padding (`var(--spacing-0p5)`). For example, our `Accordion` component's content area has this padding, guaranteeing that any form input placed inside can display its full `2px` outer focus ring without being clipped.

#### The Shared Menu System (`menu.css`)

To enforce the "Single Source of Truth" principle for our UI, we use a shared, global stylesheet for all list-based selection components. This system guarantees that primitives from multiple Radix UI packages (`DropdownMenu`, `ContextMenu`, `Select`) and custom components are visually indistinguishable.

It is built on two key patterns:

1.  **Shared Container (`.menu-popover`):** All menu popovers use this class, which defines the container's shape, shadow, padding, and a **`gap: 2px`** to create consistent spacing between items.
2.  **Shared Item (`.menu-item`):** All list items use this class. It defines a consistent height, internal padding, and a `1px solid transparent` border in its resting state. On hover or highlight, only the `background-color` and `border-color` are changed, preventing any layout shift. This creates a light, modern interaction style.

By composing these two classes, we achieve a perfectly consistent and robust menu system across the entire application.

#### The Icon Badging Pattern for Visual Status

To add secondary information or communicate status visually, we use a consistent pattern of icons and semantic colors.

-   **Problem:** A component or view has a special status that needs to be communicated at a glance.
-   **Solution:** We use a prominent icon (like the `warning` triangle) paired with a semantic background color (like `--surface-bg-warning-secondary`) to create an unmistakable visual cue. The text content is also given a matching semantic color to ensure high contrast and legibility.
-   **Implementation Examples:**
    -   A `CheckCard` for a resident with a Special Classification uses a `warning` icon to draw immediate attention in the schedule list.
    -   The **pre-scan alert banner** in `ScanView` uses this same pattern to provide a persistent, high-visibility warning to the caregiver while they are aiming the camera.
    -   The resident-specific wrapper in `CheckFormView` uses this pattern to highlight a resident with a special classification within the form.