# Agent Charter & Execution Protocol

This document defines the operating protocol for AI agents working on the Screen Studio codebase. Its purpose is to maximize the probability of a correct, complete, and architecturally sound "one-shot" outcome for any given task.

## Prime Directive: One-Shot Excellence

The agent's primary goal is to deliver a complete and correct solution in a single response, minimizing the need for iterative correction. This is achieved by adhering to three pillars:

1.  **Holistic Analysis:** Before writing code, the agent must ingest and synthesize **all** provided context: the user's request, the PRD, the project `README.md`, `CSS-PRINCIPLES.md`, and all relevant existing code files.
2.  **Systematic Diagnosis:** When faced with a bug, the agent must not guess. It must systematically form multiple hypotheses, gather evidence, and select a solution that addresses the root cause.
3.  **Comprehensive Delivery:** A "one-shot" response is not just code. It is a complete solution package, including all necessary file operations, code modifications, documentation updates, and a strategic verification plan.

## Standard Execution Algorithm (Internal)

For any non-trivial task (e.g., implementing a PRD), the agent must follow this internal thought process *before* generating the final output:

1.  **Ingestion & Synthesis:** Read and fully comprehend the entire user request and all context files.
2.  **Impact Analysis & Dependency Mapping:** Create a definitive list of all files that will be **Created, Read, Updated, or Deleted (CRUD)**.
3.  **Virtual Refactoring (The Mental Walkthrough):**
    *   **Example Simulation (The Render Cycle):** *"I need to implement a countdown timer. A naive approach is to use `setInterval` inside the component. Hypothesis: With 50 items, this creates 50 active intervals, causing React thrashing. The correct architecture is to subscribe to the global `fastTickerAtom`."*
    *   **Example Simulation (The Notification Storm):** *"I need to alert on missed checks. A naive approach is to toast every time a check expires. Hypothesis: If the device wakes after 30 minutes, 50 checks expire at once, flooding the UI. The correct architecture is Tick-Based Aggregation: collect all expiries in a single tick and dispatch one summary toast."*
    *   **Example Simulation (Persistence Strategy):** *"I am adding a new user preference. Should this reset on reload? If no, I must use `atomWithStorage`. If yes, a standard `atom` is sufficient. I must clarify this distinction in the implementation."*
    *   **Example Simulation (The Environment-Agnostic Timer):** *"I need to store a timer ID. A naive approach is `NodeJS.Timeout`. Hypothesis: This will throw TS2503 in browser environments. The correct architecture is to use `ReturnType<typeof setTimeout>`."*
    *   **Example Simulation (The Developer Override):** *"I am building a simulation flow (e.g., NFC). It has an auto-advance timer. I also need manual buttons for error testing. The correct architecture is to ensure manual interaction cancels the auto-timer immediately to prevent race conditions."*
    *   **Example Simulation (Sensory Cohesion):** *"I am adding a 'Save' action. A visual change is not enough. The correct architecture is to trigger both a haptic pulse (`useHaptics`) and an audio cue (`useAppSound`) to provide tangible confirmation, respecting the user's global configuration."*
    *   **Example Simulation (The Mobile Keyboard):** *"I am building a full-screen form. A naive approach is `height: 100vh`. Hypothesis: On mobile, the keyboard will slide up and cover the bottom 40% of the view, hiding the submit buttons. The correct architecture is to use the Visual Viewport API to determine the true visible height and set a CSS variable (`--visual-viewport-height`), ensuring the footer docks perfectly above the keyboard."*
    *   **Example Simulation (Frame Painting / The "Barn Door" Effect):** *"I need to change an animation direction state right before closing a modal. A naive approach is `setDirection('left'); setIsOpen(false);`. Hypothesis: React batching will unmount the component before the direction update paints, causing the wrong exit animation. The correct architecture is to use a nested `requestAnimationFrame` to force a paint frame before triggering the unmount."*
    *   **Example Simulation (List Stability / The "Ghost Item"):** *"I need to animate a list item freely leaving the screen. A naive approach is to filter it out of the data immediately. Hypothesis: This causes the item to vanish instantly or the list to jump. The correct architecture is to KEEP the item in the list (`AnimatePresence` requirement) but use a **Computed Display Group** (based on its original timestamp) to anchor it in place visually until the exit animation completes."*

## UI & Component Standards

### 1. High-Precision Implementation
*   **Verify Paths First:** never guess file locations. Always verify path existence (e.g., `src/types.ts` vs `src/data/types.ts`) before importing or editing to prevent build errors.
*   **Holistic Fixes:** Do not patch a symptom. Trace the root cause (e.g., if a style is missing, check the global theme variables first).
*   **Lint Proactively:** Run `npm run lint` immediately after making structural changes (moving files, refactoring atoms).
*   **Error Feedback Standard:** User-facing errors must follow the `[Problem].\n[Actionable Solution].` pattern (e.g., "Camera not responding.\nTry restarting your device."). Use the `alert` variant for blocking errors.

### 2. List Items
*   **Directive:** Do not create custom list item components (e.g., `MyFeatureListItem`, `RoomRow`).
*   **Solution:** Always use the `ActionListItem` component.
*   **Reasoning:** Enforces the "Golden Row" pattern (56px height, consistent padding, full-width separators) defined in `list.css`.

### 2. Context Switching
*   **Directive:** When displaying the Facility Group/Unit selector, use the `ContextSwitcherCard` component.
*   **Reasoning:** Ensures consistency between the Side Menu and the NFC Provisioning workflow.

### 3. Icons
*   **Directive:** Use `Material Symbols Rounded`.
*   **Style:**
    *   **Small / UI Icons (24px):** Filled (`font-variation-settings: 'FILL' 1`) for active/prominent states.
    *   **Large / Hero Icons (48px+):** Outlined (`font-variation-settings: 'FILL' 0`) for Success/Error status screens to maintain visual balance.
*   **Color:**
    *   Leading icons in lists: `var(--surface-fg-quaternary)`.
    *   Interactive icons: `var(--surface-fg-secondary)` (default) or `var(--surface-fg-primary)` (active).

### 4. Sheets & Drawers (Vaul)
*   **Directive:** Use the standard overlay structure:
    *   **Handle:** If using `Drawer.Root` directly (bypassing `BottomSheet` wrapper), you **must** manually implement the handle bar (`.handleContainer` + `.handle`) to ensure visual consistency.
    *   Header: Fixed height (60px), `sticky` or fixed positioning.
    *   Content: Scrollable area with `padding: 0` if containing a list (to allow edge-to-edge separators).
    *   Footer: Fixed/Sticky at bottom if containing actions.

## CSS Architecture
*   **Directive:** Do not add new global CSS files without updating `src/styles/index.css` to include them in the correct `@layer`.
*   **Directive:** Prefer CSS Modules (`*.module.css`) for feature-specific styles. Use Global CSS (`src/styles/*.css`) only for reusable design patterns (buttons, lists, inputs).