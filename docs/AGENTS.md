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
    *   **Example Simulation (Stateful Animation):** *"I need to animate an item out of a sorted list. A naive approach is to change the status to 'complete'. Hypothesis: This will cause a layout jump. The correct architecture is to use a transient `'completing'` status to play the animation on a stable element before updating the data model."*
    *   **Example Simulation (Modal Architecture):** *"I am implementing a mandatory post-login modal. The correct architecture is to *always* render the main `AppShell` structure and treat the modal as a true overlay controlled by its own state atom, decoupling setup from layout."*
    *   **Example Simulation (Component Variable Contract):** *"I need to implement a floating footer. A naive approach is fixed padding. The correct architecture is for the footer to measure its own `offsetHeight` and set a CSS variable (`--form-footer-height`) on the root, allowing the content container to adjust its padding dynamically."*
    *   **Example Simulation (Audio/Haptic Cohesion):** *"I need to add sound effects. A naive approach is linking to external `.mp3` files. Hypothesis: This introduces network latency and potential 404s. The correct architecture is to use the Web Audio API to synthesize simple beeps/buzzes client-side, ensuring instant feedback and zero external dependencies."*
    *   **Example Simulation (The Mobile Keyboard):** *"I am building a full-screen form. A naive approach is `height: 100vh`. Hypothesis: On mobile, the keyboard will slide up and cover the bottom 40% of the view, hiding the submit buttons. The correct architecture is to use the Visual Viewport API to determine the true visible height and set a CSS variable (`--visual-viewport-height`), ensuring the footer docks perfectly above the keyboard."*
    *   **Example Simulation (Data Architecture):** *"I am updating the `FacilitySelectionModal`. The correct architecture is to establish a **single source of truth** by creating a dedicated `facilityData.ts` file that explicitly defines the hierarchy, rather than parsing mock resident strings."*