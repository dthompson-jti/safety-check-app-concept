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
    *   **Example Simulation (Cross-Contamination):** *"I am modifying `useEditorHotkeys`. This is a global hook. Does it run in Preview Mode? Yes. Will the hotkeys I'm adding have unintended consequences in a read-only view? Yes, the user could delete components from the preview. Therefore, I must add a guard clause at the top of my event handler: `if (viewMode !== 'editor') return;` to prevent this architectural leak."*
    *   **Example Simulation (Layout & Document Flow):** *"I will change the main header to be `position: fixed`. This removes it from the document flow, meaning the scrollable list content will start at the very top of the page, underneath the header. This will obscure the first few list items. A naive fix would be to add `padding-top` to the scroll container (`.mainContent`). However, this prevents the content from *ever* scrolling into that padded area, breaking the translucent effect. The architecturally correct solution is to keep the scroll container's padding at `0` and instead add a dedicated, non-interactive 'spacer' element as the first item *inside* the virtualized list. This pushes the content down on initial render but allows it to scroll up into the space behind the header, preserving the desired visual effect."*
    *   This is the most critical step. The agent must act as its own QA engineer, actively trying to "break" its own plan.

4.  **Code Generation & Self-Correction:**
    *   Generate the full code for all modified files.
    *   Perform a final pass over the generated code, checking it against the **Technical Mandates** listed below. This is a fast, final check for common, known errors.


## Technical Mandates & Known Pitfalls

These are non-negotiable rules learned from the project's history. Violating them will result in rework.

1.  **The Rules of Hooks are Absolute.** All React Hooks (`useRef`, `useState`, `useAtomValue`, etc.) **must** be called unconditionally at the top level of a component. Never place a hook call inside a conditional block (`if/else`), loop, or nested function. If a component has different logic paths, hoist all hooks to the top.

2.  **CSS Selectors Must Match the Final DOM.** When refactoring a component's JSX structure, the corresponding CSS **must** be updated. The agent is responsible for ensuring selectors for states like `:hover` and `.selected` target the new, correct class names and element hierarchy.

3.  **Solve Nested Hovers with Child Targeting.** To prevent a "hover bubbling" effect where nested interactive elements all show a hover state simultaneously, the interactive wrapper element should be stylistically invisible. The visual feedback (`background-color`, `border-color`) must be applied to its **direct child** (e.g., `.wrapper:hover > .content`). This ensures only the top-most element appears hovered.

4.  **Precision in Imports is Mandatory.** All package names must be exact (e.g., `@radix-ui/react-dialog`). All relative paths must be correct. There is no room for typos. Be especially vigilant for typos in long, similar-sounding names (e.g., `isWriteNfcModalOpenAtom` vs `isWriteNfcTagModalOpenAtom`). A single-character mistake is a common source of "module has no exported member" errors.

5.  **"Ghost Errors" are Real.** If the user reports errors for files that have been deleted, the agent's first diagnostic step is to instruct the user to **restart the VS Code TypeScript Server**. This resolves stale cache issues.

6.  **Radix Primitives Have Accessibility Contracts.** Many Radix UI components enforce accessibility best practices. For example, a `Dialog` **must** contain a `Dialog.Title` and `Dialog.Description` to be properly announced by screen readers. Always check the browser console after implementing a new component; Radix provides clear warnings for these violations. Treat them as mandatory fixes, not optional suggestions.