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

#### 5. The Text Handling Contract

Complex user-facing messages (especially errors) often require specific formatting for clarity.
-   **The Rule:** Components displaying dynamic messages (like Toasts) must support `white-space: pre-line`.
-   **The Benefit:** This allows data to control line breaks (using `\n`), enabling the `[Problem].\n[Solution].` pattern without complex HTML parsing.

#### 6. Body Data Attributes for Global CSS Effects

When implementing global visual effects that span multiple components (e.g., glass tint, theme overlays), prefer **body data attributes** over rendered overlay divs.

-   **The Pattern:** A component sets a data attribute on `<body>` via `useEffect`, and CSS selectors trigger visual changes across the app.
-   **Example:**
    ```tsx
    // Component logic
    useEffect(() => {
      if (shouldActivate) {
        document.body.setAttribute('data-glass-tint', 'active');
      } else {
        document.body.removeAttribute('data-glass-tint');
      }
      return () => document.body.removeAttribute('data-glass-tint');
    }, [shouldActivate]);
    ```
    ```css
    /* Global CSS - applies to header/footer when active */
    body[data-glass-tint="active"] .header {
      animation: glass-tint-pulse 1.2s ease-in-out infinite;
    }
    ```
-   **Benefits:**
    -   **No z-index conflicts:** Effect is applied directly to target elements, not overlaid.
    -   **Performance:** No extra DOM nodes, uses existing surfaces.
    -   **Maintainability:** CSS co-located with affected components, not in a separate overlay component.
-   **When to Use:** Glass tints, global color shifts, late-state indicators, theme-based animations.

#### 6. Design for Layout Stability

-   **The Contract:** When an element is only sometimes visible, its container must **always reserve the necessary space** for it.
-   **The Default State Contract:** Components should default to their most stable, symmetric state in CSS. Modifiers (via data attributes) should only apply asymmetric changes. This prevents "Flash of Unstyled Content" (FOUC) or layout shifts during JS hydration.
-   **The Persistent Chrome Contract:** Structural elements like Headers and Footers should generally remain mounted. Conditional rendering of these elements changes the layout viewport size, causing underlying content to jump. Use Z-index layering to hide them if necessary.

#### 7. Font Loading Strategy for FOUC Prevention

Fonts require careful handling to prevent Flash of Unstyled Content (FOUC), especially icon fonts which render as ligature text before loading.

-   **Self-Hosted Fonts:** All fonts are served from `/public/fonts/` to enable offline PWA support.
-   **Icon Fonts (`font-display: block`):** Material Symbols must use `block` to hide icon elements until the font loads. Otherwise, users see the word "shield" instead of the icon.
-   **Text Fonts (`font-display: swap`):** Inter uses `swap` to allow immediate text rendering with a fallback font, swapping to the custom font when loaded.
-   **Async Loading:** Heavy font files (Material Symbols ~5MB) use `fetchpriority="low"` preload to avoid blocking initial render.
-   **Critical Path SVGs:** For login/splash screens, use inline SVG components (`CriticalIcons.tsx`) instead of font icons to render instantly without network dependency.
-   **Inline Critical CSS:** Background colors and dark mode detection CSS are inlined in `index.html` to prevent white flash before React hydrates.

#### 7. The Strict Transition-Navigation Pairing

We enforce a strict coupling between navigation type, transition, and meaning:

1.  **Horizontal Flow ("Push")**
    -   **Elements**: Left Title + **Back Arrow (Left)**.
    -   **Transition**: **Slide from Right**.
    -   **Meaning**: Deepening context or linear process (*Record Check*, *Facility Selection*, *Dev Tools*, *Settings*).

2.  **Vertical Modal ("Cover")**
    -   **Elements**: Left Title + **Close 'X' (Right)**.
    -   **Transition**: **Slide from Bottom**.
    -   **Meaning**: Temporary utility overlay (*NFC Write*).

#### 8. The Semantic Token Selection Pattern

When styling status messages, badges, or notification blocks, semantic token selection must be **intent-driven**, not merely aesthetic:

-   **Info (Blue):** Informational messages that provide context without urgency. Used for neutral status indicators.
    -   Example: "Early" check status (room checked recently, but not an error or problem).
    -   Tokens: `--surface-bg-info`, `--surface-border-info`, `--surface-fg-info-primary`.
    -   Icon: `info` (filled).
-   **Warning (Yellow):** Caution messages requiring user attention but not blocking progress.
    -   Example: Network degradation, approaching deadline.
    -   Tokens: `--surface-bg-warning-primary`, `--surface-border-warning`, `--surface-fg-warning-primary`.
    -   Icon: `warning` (filled).
-   **Alert/Error (Red):** Critical errors or failures requiring immediate action.
    -   Example: Hardware failure, validation error, missed check.
    -   Tokens: `--surface-bg-error-primary`, `--surface-border-alert`, `--surface-fg-alert-primary`.
    -   Icon: `error` or `cancel` (filled).
-   **Success (Green):** Confirmation of successful completion.
    -   Example: Check saved, sync complete.
    -   Tokens: `--surface-bg-success`, `--surface-border-success`, `--surface-fg-success-primary`.
    -   Icon: `check_circle` or `task_alt` (filled).

**Anti-Pattern:** Do not use Warning semantics for informational states just because they "stand out." This dilutes the signal and trains users to ignore yellow messages.

#### 9. The Dark Mode Token Hygiene Principle

When styling themed elements (badges, warnings, selected states), **always use semantic tokens**, never primitive tokens directly.

-   **The Problem:** Primitive tokens like `var(--primitives-yellow-100)` don't adapt to dark mode. They remain the same light-mode-optimized color, causing jarring contrast issues.
-   **The Solution:** Use the semantic equivalents that are remapped per theme:

| Instead of... | Use... |
|:---|:---|
| `var(--primitives-yellow-100)` | `var(--surface-bg-warning-secondary)` |
| `var(--primitives-red-50)` | `var(--surface-bg-error-primary)` |
| `var(--primitives-blue-600)` | `var(--surface-border-info)` |
| Hardcoded hex (`#0a1428`) | `var(--primitives-theme-800)` or appropriate semantic |

-   **Primary Buttons:**
    -   Background: `theme-800` (Dark) vs `theme-700` (Light)
    -   Contrast: Always check against `grey-50` or `white` foreground.

-   **Box-Shadow Warning:** `box-shadow` colors are especially prone to this error. If using a colored box-shadow for emphasis (e.g., classified resident glow), the color **must** be a semantic token:
    ```css
    /* WRONG - hardcoded, won't adapt to dark mode */
    box-shadow: 0 0 0 2px var(--primitives-yellow-100);
    
    /* CORRECT - semantic token adapts per theme */
    box-shadow: 0 0 0 2px var(--surface-bg-warning-secondary);
    ```

#### 10. The Dark Mode Shadow Strength Principle

Shadows serve a critical role in establishing visual hierarchy through elevation. However, **dark backgrounds reduce shadow visibility dramatically**.

-   **The Pattern:** All `--surface-shadow-*` tokens are automatically strengthened (2-10x opacity increase) in dark modes via theme-specific overrides in `semantics.css`.
-   **The Opacity Scale:**
    -   Light mode: 5-18% opacity (subtle, natural)
    -   Dark modes: 20-50% opacity (pronounced, clear separation)
-   **The Rationale:** Without stronger shadows, elevated surfaces (popovers, modals, cards) blend into dark backgrounds, losing depth perception and visual hierarchy.
-   **Implementation:** Never override shadow tokens with hard-coded values. Always use the semantic `--surface-shadow-*` tokens to ensure automatic dark mode adaptation.

**Example Usage:**
```css
/* CORRECT - Uses semantic token that adapts to dark mode */
.popover {
  box-shadow: var(--surface-shadow-xl);
}

/* WRONG - Hard-coded shadow won't strengthen in dark mode */
.popover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
```

#### 11. The Popover Semantic Token Pattern

**Popovers** (including dropdowns, tooltips with UI elements, and menus) follow standard dark mode theming and must use semantic tokens:

-   **Background:** `var(--surface-bg-primary)` (adapts per theme)
-   **Foreground:** `var(--surface-fg-primary)` (adapts per theme)
-   **Border:** `var(--surface-border-secondary)` (adapts per theme)
-   **Shadow:** `var(--surface-shadow-xl)` (strengthens in dark mode)

**Anti-Pattern:** Do not hard-code light colors for popovers with the assumption they should "pop out" in dark mode. This creates jarring discontinuity and breaks the elevation hierarchy system.

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

#### The Gap-Based Spacing Contract

When building form layouts or stacked sections (e.g., `CheckEntryView`):

-   **The Rule:** If a parent container uses `gap` (e.g., `.formContent { gap: var(--spacing-4); }`), child sections should **not** add `margin-bottom`.
-   **The Benefit:** Spacing is managed in one place (the parent), making it easier to adjust globally and preventing double-spacing bugs.
-   **For Dividers:** If a section needs a visual divider, use symmetric `padding-bottom` inside the section, not `margin-bottom`. This keeps the divider visually centered between sections.
-   **Example:**
    ```css
    /* CORRECT: Parent handles spacing, divider uses padding */
    .formContent { gap: var(--spacing-4); }
    .sectionWithDivider {
      padding-bottom: var(--spacing-4);
      border-bottom: 1px solid var(--surface-border-secondary);
      /* NO margin-bottom here */
    }
    ```

#### The Overflow and Box-Shadow Clipping Contract

When using `overflow: hidden` on containers:

-   **The Problem:** `overflow: hidden` clips all content extending beyond the box, including `box-shadow` and `outline` effects.
-   **The Impact:** Pulse/glow animations using `box-shadow` (like `card-flash-complete`) will be invisible or truncated.
-   **The Solution:**
    1.  Avoid permanent `overflow: hidden` on elements with box-shadow animations.
    2.  If overflow control is needed for layout (e.g., height collapse), apply it conditionally—only during the specific animation phase that requires it.
-   **Example (Framer Motion):**
    ```tsx
    // DON'T: Permanent overflow clips pulse animation
    style={{ overflow: 'hidden' }}
    
    // DO: Apply only in exit transition
    exit={{ height: 0, overflow: 'hidden' }}
    ```

#### The Sequenced Animation Contract

For complex exit animations requiring sequential phases (e.g., slide-out THEN collapse):

-   **The Problem:** Framer Motion applies all `exit` properties simultaneously, even with `delay`. The initial frame state is set immediately.
-   **The Solution:** Use **nested motion.divs** to separate concerns:
    -   **Outer div:** Controls slow/delayed properties (height, margin)
    -   **Inner div:** Controls immediate properties (x, opacity)
-   **Reference:** See `Animation-spec.md` for full implementation details and timing values.

#### 12. The Icon Size Token Contract

Icons must use the `--icon-size-*` design tokens from `primitives.css` for consistent sizing. Never use inline `fontSize` or `--font-size-*` tokens for icons.

-   **Token Scale:**
    | Token | Size | Use Case |
    |:------|:-----|:---------|
    | `--icon-size-xs` | 12px (0.75rem) | Hotkey hints, XS button text |
    | `--icon-size-sm` | 16px (1rem) | XS button icons, menu chevrons |
    | `--icon-size-md` | 20px (1.25rem) | **DEFAULT** - Standard UI icons, toast close |
    | `--icon-size-lg` | 24px (1.5rem) | Header icons via `size="lg"` buttons |
    | `--icon-size-xl` | 32px (2rem) | Feature icons, status indicators |
    | `--icon-size-2xl` | 48px (3rem) | Hero icons, empty states |

-   **The Default:** The base `.material-symbols-rounded` class in `fonts.css` sets `font-size: var(--icon-size-md)`. All icons inherit 20px by default.

-   **Header Icon Buttons:** Use `Button size="lg"` for header navigation buttons (menu, back, close). This provides 48px touch targets with 24px icons natively—no CSS overrides needed.

-   **Anti-Pattern:** Never use `size="m"` + CSS override for header icons. Use `size="lg"` instead. Never use `--font-size-*` tokens for icons—they're for typography.