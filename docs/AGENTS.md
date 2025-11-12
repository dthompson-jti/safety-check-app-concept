# Agent Charter & Execution Protocol

This document defines the operating protocol for AI agents working on the Screen Studio codebase. Its purpose is to maximize the probability of a correct, complete, and architecturally sound "one-shot" outcome for any given task.

## Prime Directive: One-Shot Excellence

The agent's primary goal is to deliver a complete and correct solution in a single response, minimizing the need for iterative correction. This is achieved by adhering to three pillars:

1.  **Holistic Analysis:** Before writing code, the agent must ingest and synthesize **all** provided context: the user's request, the PRD, the project `README.md`, `CSS-PRINCIPLES.md`, and all relevant existing code files. The agent must build a complete mental model of the system's current state and the desired future state.
2.  **Systematic Diagnosis:** When faced with a bug, the agent must not guess. It must systematically form multiple hypotheses about the root cause, gather evidence from the codebase and error logs to support or refute each hypothesis, and select a solution that definitively addresses the most likely cause.
3.  **Comprehensive Delivery:** A "one-shot" response is not just code. It is a complete solution package, including all necessary file operations, code modifications, documentation updates, and a strategic verification plan to prove the fix is correct and has no regressions.

## Standard Execution Algorithm (Internal)

For any non-trivial task (e.g., implementing a PRD), the agent must follow this internal thought process *before* generating the final output:

1.  **Ingestion & Synthesis:**
    *   Read and fully comprehend the entire user request and all context files.
    *   Identify the core problem statement and the key success criteria ("Definition of Done").
    *   Cross-reference the request with the architectural principles in `README.md`.

2.  **Impact Analysis & Dependency Mapping:**
    *   Create a definitive list of all files that will be **Created, Read, Updated, or Deleted (CRUD)**.
    *   Map the dependencies. For example: "Updating the component renderers will require changes in `CanvasNode.tsx` and `DndDragOverlay.tsx`." This prevents leaving dependent files in a broken state.

3.  **Virtual Refactoring (The Mental Walkthrough):**
    *   Simulate the changes in the most critical files first.
    *   **Example Simulation (CSS):** *"I will create a unified renderer with a `selectableWrapper`. The old CSS targeted `.selected > .formComponentWrapper`. This selector will fail. Therefore, I must update `EditorCanvas.module.css` to target `.selectableWrapper.selected` to prevent a visual regression."*
    *   **Example Simulation (Security):** *"I am implementing a login form. A naive approach is giving specific errors like 'User not found' or 'Incorrect password'. Hypothesis: This leaks information and allows for username enumeration attacks. The correct, secure architecture is to return a single, generic error message like 'The username or password you entered is incorrect' for all failed authentication attempts, preventing an attacker from determining which usernames are valid."*
    *   **Example Simulation (Race Condition):** *"I am implementing a `useOnClickOutside` hook. The naive approach of adding a listener directly in `useEffect` can cause a race condition where the menu closes instantly. The correct architecture is to rely on `useEffect`'s post-paint execution guarantee, which ensures the event that opened the menu has already propagated. No timeouts or flags are necessary."*
    *   **Example Simulation (Stateful Animation):** *"I need to animate an item out of a sorted list upon completion. A naive approach is to change the item's status to 'complete' and then trigger its exit animation. Hypothesis: This will cause a bug. The list is derived from a sorted atom. Changing the status to 'complete' will cause the sorter to immediately move the item to a different group (e.g., 'Completed'), causing a jarring layout jump *before* the animation can start. The correct architecture is to decouple the visual state from the data-model state. I must introduce a transient status like `'completing'`. This status makes the item *look* complete (via CSS data attributes) but is handled by the sorting and grouping logic to keep it in its original position. I can then play the 'pulse' and 'exit' animations on a stable element. Only after all animations are finished do I update the status to the final 'complete' state and allow the list to reflow."*
    *   **Example Simulation (Component Composition):** *"I need to add a Popover to a Button that already has a Tooltip. A naive wrapper (`<Popover><Tooltip><Button/></Tooltip></Popover>`) causes the Popover's click event to fail. Hypothesis: Both Radix components use `asChild` and are competing for the button's events. The correct architecture, per Radix documentation, is to nest the `Root` components (`<Popover.Root><Tooltip.Root>...`) and then nest their `Trigger` components. This ensures both components correctly attach their event listeners to the final button without conflict."*