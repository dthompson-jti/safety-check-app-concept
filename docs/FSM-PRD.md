### **Fully Updated PRD: Adopt `jotai-fsm` for Completion Animation**

#### 1. Overview
This document details the approved plan to refactor the safety check completion animation. We will replace the current, brittle `setTimeout`-based implementation with a robust, declarative state machine using the `jotai-fsm` library. This will improve code quality, eliminate a class of timing bugs, and establish a foundational pattern for handling complex UI state choreography throughout the application.

#### 2. Problem & Goals
*   **Problem:** The current method for animating a completed check is fragile. It relies on manually calculated `setTimeout` delays that are tightly coupled to CSS animation durations. This is hard to maintain, difficult to debug, and prone to breaking if timings are adjusted.
*   **Goals:**
    1.  Decouple the animation sequence logic from the `CheckFormView` component.
    2.  Eliminate the use of "magic number" timers in favor of a declarative state chart.
    3.  Improve developer experience by making the animation flow self-documenting and predictable.
    4.  Establish `jotai-fsm` as a trusted, reusable pattern for future UI state management challenges.

#### 3. Scope & Key Initiatives
*   **In Scope:**
    *   Add `jotai-fsm` as a project dependency.
    *   Create a new Jotai atom, `completionAnimationAtom`, that defines the `idle` → `pulsing` → `exiting` → `updatingData` state machine.
    *   Refactor `CheckFormView.tsx` to trigger the animation by sending a single event to the new machine atom.
    *   Refactor `CheckCard.tsx` and `CheckListItem.tsx` to derive their visual state from atoms controlled by the state machine.
*   **Out of Scope:**
    *   Refactoring any other component or workflow in this PR. This will be addressed in a separate initiative.
    *   Changing the visual appearance or duration of the existing animations.

#### 4. UX/UI Specification
The user experience will be **identical** to the current implementation. This is a purely technical refactor to improve architectural robustness. The states managed by the FSM correspond directly to the existing visual states of the `CheckCard` (Idle, Pulsing, Exiting).

#### 5. Architecture & Implementation Plan
1.  **State Machine Definition:** A new `completionAnimationAtom` will be created using `atomWithMachine` from `jotai-fsm`. It will define the four states (`idle`, `pulsing`, `exiting`, `updatingData`) and their transitions.
2.  **Side Effects:** The machine's `effect` blocks will be responsible for:
    *   Running timers (`setTimeout`).
    *   Updating other Jotai atoms (`recentlyCompletedCheckIdAtom`, `completingChecksAtom`).
    *   Dispatching the final data update to `dispatchActionAtom`.
3.  **Component Interaction:**
    *   **`CheckFormView`:** On save, it will no longer call `setTimeout`. It will call `send({ type: 'SAVE', checkId: '...' })` on the machine atom. Its responsibility ends there.
    *   **`CheckCard`/`CheckListItem`:** These components will be simplified. Their internal `useEffect` for managing the pulse will be removed. Their visual appearance will be a pure function of the `recentlyCompletedCheckIdAtom` and `completingChecksAtom` atoms.

#### 6. File Manifest
*   `package.json` **[MODIFIED]**
    *   Add `jotai-fsm` to dependencies.
*   `/src/data/atoms.ts` **[MODIFIED]**
    *   Define the new `export const completionAnimationAtom = atomWithMachine(...)`.
*   `/src/features/Workflow/CheckFormView.tsx` **[MODIFIED]**
    *   Remove `setTimeout` chain and local state.
    *   Import and use `completionAnimationAtom` to send the `SAVE` event.
*   `/src/features/Schedule/CheckCard.tsx` **[MODIFIED]**
    *   Remove the internal `useEffect` and `isPulsing` state.
    *   Simplify logic to derive visual state from Jotai atoms.
*   `/src/features/Schedule/CheckListItem.tsx` **[MODIFIED]**
    *   Remove the internal `useEffect` and `isPulsing` state.
    *   Simplify logic to derive visual state from Jotai atoms.
*   `/src/data/appDataAtoms.ts` **[REFERENCE]**
    *   The FSM will interact with `dispatchActionAtom`.
*   `/src/features/Schedule/CheckCard.module.css` **[REFERENCE]**
    *   Animation timings defined here must match the timers in the FSM.

#### 7. Unintended Consequences Check
*   **Animation Timing Sync:** The `setTimeout` durations in the FSM's `effect` blocks must be kept in sync with the animation durations defined in `CheckCard.module.css` and `CheckListItem.module.css`. A mismatch will cause visual glitches.
*   **Global State Interaction:** The FSM is a global atom. Its logic must correctly use the `checkId` passed in the event payload to avoid race conditions if two saves were somehow triggered in rapid succession. The proposed design handles this correctly.

#### 8. Risks & Mitigations
*   **Risk:** Team unfamiliarity with state machine patterns.
    *   **Mitigation:** The developer implementing this will conduct a brief code walkthrough for the team. The PR description will link to the `jotai-fsm` documentation and this PRD.
*   **Risk:** Animation timings in JS and CSS become desynchronized over time.
    *   **Mitigation:** Add a code comment in both the FSM definition (e.g., `// Corresponds to 1.2s card-pulse-success animation in CheckCard.module.css`) and the relevant CSS file to remind future developers to update both locations if a timing change is needed.

#### 9. Future Considerations & Scalability
The successful implementation of this refactor will serve as the blueprint for applying the FSM pattern to other areas of the application. This will be tracked in the **`IDEA-FSM-EXPANSION.md`** ticket, which proposes a phased refactor of other key components like the `WriteNfcTagModal` and the core `workflowStateAtom`.

#### 10. Definition of Done
*   [ ] `jotai-fsm` is added as a dependency.
*   [ ] The `completionAnimationAtom` is implemented and exported.
*   [ ] The `setTimeout` logic is fully removed from `CheckFormView.tsx`.
*   [ ] The completion animation sequence is triggered correctly on save and functions identically to the previous implementation across both "Card" and "List" views.
*   [ ] `CheckCard.tsx` and `CheckListItem.tsx` have been simplified and no longer contain their own timer-based state.
*   [ ] The PR has been reviewed and approved by at least one other team member.