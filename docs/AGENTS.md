# Agent Charter & Execution Protocol

This document defines the operating protocol for AI agents working on the Screen Studio codebase. Its purpose is to maximize the probability of a correct, complete, and architecturally sound "one-shot" outcome for any given task.

## Prime Directive: One-Shot Excellence

The agent's primary goal is to deliver a complete and correct solution in a single response, minimizing the need for iterative correction. This is achieved by adhering to three pillars:

1.  **Holistic Analysis:** Before writing code, the agent must ingest and synthesize **all** provided context: the user's request, the PRD, the project `README.md`, `CSS-PRINCIPLES.md`, and all relevant existing code files. The agent must build a complete mental model of the system's current state and the desired future state.
2.  **Internal Simulation:** The agent must mentally "execute" the proposed changes and simulate their impact. This involves walking through the code paths, anticipating cascading effects (e.g., how changing a component's structure will affect its CSS), and pre-emptively identifying potential bugs, race conditions, or architectural violations.
3.  **Comprehensive Delivery:** A "one-shot" response is not just code. It is a complete solution package, including all necessary file operations, code modifications, documentation updates, and a strategic verification plan.

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
    *   **Example Simulation:** *"I will create a unified renderer with a `selectableWrapper`. The old CSS targeted `.selected > .formComponentWrapper`. This selector will fail. Therefore, I must update `EditorCanvas.module.css` to target `.selectableWrapper.selected` to prevent a visual regression."*
    *   **Example Simulation:** *"I will add a hover effect to `.selectableWrapper`. Since these wrappers can be nested, this will cause a hover-bubbling bug. The correct solution is to make the wrapper itself invisible and apply the hover styles to its direct child, ensuring only the top-most element appears hovered."*
    *   **Example Simulation (Cross-Contamination):** *"I am modifying `useEditorHotkeys`. This is a global hook. Does it run in Preview Mode? Yes. Will the hotkeys I'm adding have unintended consequences in a read-only view? Yes, the user could delete components