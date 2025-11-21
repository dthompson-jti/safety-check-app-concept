### **PRD: Architectural Spike - Integrating a State Machine for Advanced UI Choreography**

#### **1. Overview**

This document outlines the goals, requirements, and evaluation criteria for integrating a formal state machine library (`xstate` via `jotai-xstate`) into our application's architecture. The primary goal is to establish a robust, scalable, and maintainable pattern for managing complex UI state and animations.

The initial proof-of-concept for this new architecture will be to refactor the safety check completion animation, replacing the current, brittle `setTimeout`-based implementation. This will serve as the blueprint for handling future state management challenges.

#### **2. Problem & Goals**

*   **Problem:** The current method for animating a completed check is fragile and difficult to maintain. It relies on manually synchronized timers spread across multiple components (`CheckFormView`, `CheckCard`, `CheckListItem`), making it prone to race conditions and visual glitches. Initial refactoring attempts have revealed that a deeper, more foundational approach is required to solve this class of problems effectively.

*   **Goals:**
    1.  **Establish a Robust Pattern:** Define and validate a standardized, application-wide pattern for managing complex, multi-step, or asynchronous UI state transitions using `jotai-xstate`.
    2.  **Improve Code Quality & Decoupling:** Create a single source of truth for UI choreography that is declarative, testable, and self-documenting. Logic should be extracted from components, making them simpler and more focused on rendering.
    3.  **Enhance User Experience:** Ensure UI animations and state transitions are seamless, interruptible, and free of race conditions, reinforcing the application's "high-craft" quality standard.
    4.  **Validate with a Proof of Concept:** Successfully refactor the check completion animation as the first implementation of this new pattern, proving its viability and benefits.

#### **3. Desired User Experience (UX) Specification**

The end-user experience of completing a check must be seamless and provide clear, reassuring feedback. This is a purely technical refactor; the user-facing animation should remain identical to the original design.

**Animation Flow:**

1.  **Save Action:** The user taps "Save" in the `CheckFormView`. The form immediately disappears.
2.  **Pulse Animation:** The corresponding `CheckCard` or `CheckListItem` in the schedule view instantly begins a "pulse" animation. It should briefly flash a success color (e.g., green) and then fade to its final "completed" state color (e.g., grey). This entire pulse should feel fluid and last approximately 1.2 seconds.
3.  **Exit & Reflow:** Immediately following the pulse, the completed item smoothly animates out of its current list position (e.g., slides to the right and fades out). The list of remaining items should reflow gracefully to fill the empty space.
4.  **Re-entry:** The completed item now appears, without a jarring refresh, in its new sorted position (e.g., at the top or bottom of the "Completed" group), looking visually distinct from actionable items.

**Visual Breakdown:**

```
Initial State (Time View):
+--------------------------------+
| ▼ Due Soon                     |
|  +--------------------------+  |
|  | [ ] Room 101 - J. Doe    |  |  <-- User will complete this check
|  +--------------------------+  |
|  +--------------------------+  |
|  | [ ] Room 102 - P. Smith  |  |
|  +--------------------------+  |
+--------------------------------+
| ▼ Completed                    |
+--------------------------------+

      |
      | User completes check for Room 101
      V

Intermediate State 1: Pulse (t = 0s to 1.2s)
+--------------------------------+
| ▼ Due Soon                     |
|  +==========================+  |  <-- Card pulses with a success color
|  | [#] Room 101 - J. Doe    |  |      (e.g., --surface-bg-success)
|  +==========================+  |
|  +--------------------------+  |
|  | [ ] Room 102 - P. Smith  |  |
|  +--------------------------+  |
+--------------------------------+
| ▼ Completed                    |
+--------------------------------+

      |
      | Pulse animation finishes
      V

Intermediate State 2: Exit (t = 1.2s to 1.7s)
+--------------------------------+
| ▼ Due Soon                     |
|                                |  <-- Card animates out (e.g., slide right)
|  +--------------------------+  |
|  | [ ] Room 102 - P. Smith  |  |  <-- This card reflows smoothly into the new space
|  +--------------------------+  |
+--------------------------------+
| ▼ Completed                    |
+--------------------------------+

      |
      | Exit animation finishes, data is updated
      V

Final State:
+--------------------------------+
| ▼ Due Soon                     |
|  +--------------------------+  |
|  | [ ] Room 102 - P. Smith  |  |
|  +--------------------------+  |
+--------------------------------+
| ▼ Completed                    |
|  +--------------------------+  |
|  | [✓] Room 101 - J. Doe    |  |  <-- Card reappears instantly in its final position
|  +--------------------------+  |
+--------------------------------+
```

#### **4. Key Investigation Areas & Architectural Questions**

This refactor is an architectural spike. The primary deliverable is not just the working feature, but a well-documented and understood pattern. The implementation should answer the following questions:

1.  **Jotai <> XState Integration:**
    *   What is the most robust and maintainable pattern for connecting an XState machine to the Jotai store using `atomWithMachine`?
    *   How should the machine read from other Jotai atoms (e.g., `connectionStatusAtom`)?
    *   How should the machine's actions write to other Jotai atoms (e.g., `recentlyCompletedCheckIdAtom`, `completingChecksAtom`, `dispatchActionAtom`)? Explore the `get` and `set` parameters provided by `atomWithMachine` to establish a clean, type-safe pattern.

2.  **State Machine Design & Granularity:**
    *   What is the optimal state chart definition for the completion animation?
    *   How should the machine's `context` be used to pass data (like the `checkId` and form payload) through the animation lifecycle?
    *   How can we use XState's features (e.g., `invoke`, `after`, `entry`/`exit` actions) to cleanly manage side effects like timers and data dispatches?

3.  **Component Interaction Model:**
    *   How do we ensure the `CheckCard` and `CheckListItem` components become truly "dumb" presenters of state driven by the FSM?
    *   What is the clean way to map the machine's state (e.g., `state.matches('pulsing')`) and context (`context.checkId`) to component props and CSS classes?

4.  **Error Handling & Concurrency:**
    *   How should the machine handle a failure during the data update step?
    *   How should the machine behave if a second `SAVE` event is received while an animation for a previous check is already in progress? (The desired behavior is to interrupt the old animation and start the new one immediately).

#### **5. Scope**

*   **In Scope:**
    *   Adding `xstate` and `jotai-xstate` as project dependencies.
    *   Conducting the necessary research to establish a best-practice integration pattern.
    *   Creating a new global `completionAnimationAtom` using the chosen pattern.
    *   Refactoring `CheckFormView.tsx`, `CheckCard.tsx`, and `CheckListItem.tsx` to use this new atom, completely removing the old `setTimeout` logic.
    *   Documenting the new pattern with code comments and clear explanations in the Pull Request.

*   **Out of Scope:**
    *   Refactoring any other component or workflow in this initiative.
    *   Changing the visual design or duration of the existing CSS animations.

#### **6. Definition of Done**

*   [ ] The `jotai-xstate` and `xstate` libraries have been added to the project.
*   [ ] A state machine atom (`completionAnimationAtom`) has been implemented that successfully orchestrates the entire check completion UI/data flow.
*   [ ] The `setTimeout` logic has been completely removed from all React components.
*   [ ] The completion animation sequence functions identically to the UX specification across both "Card" and "List" views.
*   [ ] The implementation robustly handles concurrent save events by prioritizing the most recent one.
*   [ ] The new architectural pattern is clearly documented within the code.
*   [ ] A team walkthrough has been conducted to explain the new pattern and gain consensus for its use in future complex UI state management.