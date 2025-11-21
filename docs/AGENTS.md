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
    *   **Example Simulation (Stateful Animation):** *"I need to animate an item out of a sorted list. A naive approach is to change the status to 'complete'. Hypothesis: This will cause a layout jump. The correct architecture is to use a transient `'completing'` status to play the animation on a stable element before updating the data model."*
    *   **Example Simulation (Modal Architecture):** *"I am implementing a mandatory post-login modal. The correct architecture is to *always* render the main `AppShell` structure and treat the modal as a true overlay controlled by its own state atom, decoupling setup from layout."*
    *   **Example Simulation (Component Variable Contract):** *"I need to implement a floating footer. A naive approach is fixed padding. The correct architecture is for the footer to measure its own `offsetHeight` and set a CSS variable (`--form-footer-height`) on the root, allowing the content container to adjust its padding dynamically."*
    *   **Example Simulation (Sensory Cohesion):** *"I am adding a 'Save' action. A visual change is not enough. The correct architecture is to trigger both a haptic pulse (`useHaptics`) and an audio cue (`useAppSound`) to provide tangible confirmation, respecting the user's global configuration."*
    *   **Example Simulation (The Mobile Keyboard):** *"I am building a full-screen form. A naive approach is `height: 100vh`. Hypothesis: On mobile, the keyboard will slide up and cover the bottom 40% of the view, hiding the submit buttons. The correct architecture is to use the Visual Viewport API to determine the true visible height and set a CSS variable (`--visual-viewport-height`), ensuring the footer docks perfectly above the keyboard."*
    *   **Example Simulation (Data Architecture):** *"I am updating the `FacilitySelectionModal`. The correct architecture is to establish a **single source of truth** by creating a dedicated `facilityData.ts` file that explicitly defines the hierarchy, rather than parsing mock resident strings."*
    *   **Example Simulation (Frame Painting / The "Barn Door" Effect):** *"I need to change an animation direction state right before closing a modal. A naive approach is `setDirection('left'); setIsOpen(false);`. Hypothesis: React batching will unmount the component before the direction update paints, causing the wrong exit animation. The correct architecture is to use a nested `requestAnimationFrame` to force a paint frame before triggering the unmount."*
    *   **Example Simulation (The Resilient Draft Pattern):** *"I am building a complex form. A naive approach is to store state locally in the component. Hypothesis: If the user accidentally swipes back, their data is lost. The correct architecture is to sync form state to a global `draftAtom` or `atomWithStorage`, restoring it automatically when the component remounts."*
    *   **Example Simulation (The Sticky Layout Contract):** *"I need a sticky header for a list. A naive approach is `top: 60px`. Hypothesis: If the app header changes height, the list header will be misaligned. The correct architecture is to use the `--header-height` variable set by the FloatingHeader component: `top: var(--header-height)`."*