# Idea Ticket: Expand FSM Pattern to Core Application Workflows

**Status:** Proposed Idea
**Owner:** System Architect
**Related Tickets:** [PRD-JOTAI-FSM-ADOPTION](#)

#### 1. The Opportunity

The initial refactor of the `CheckCard` completion animation to use `jotai-fsm` was a success. It replaced a fragile, imperative `setTimeout` chain with a declarative, robust, and self-documenting state machine. This has demonstrably improved code quality and developer confidence for that specific feature.

However, other areas of the application still rely on less formal state management patterns (`useState`, `useEffect` hooks, and manual `setTimeout` calls) to orchestrate multi-step UI logic. This creates architectural inconsistency and leaves us exposed to the same class of timing and state bugs we just solved.

We have an opportunity to leverage our success and establish the `jotai-fsm` pattern as a core pillar of our architecture, bringing enhanced predictability and craft to the entire application.

#### 2. The Proposal: Systematically Refactor Key Workflows

This proposal recommends a phased adoption of `jotai-fsm` for other key stateful components and workflows. By converting their logic into formal state machines, we can make them more resilient, easier to test, and simpler to reason about.

**Candidate Features for Refactoring:**

1.  **`WriteNfcTagModal`:** The modal's lifecycle (`initial` → `writing` → `success` / `error`) is a perfect, self-contained use case for a simple FSM. This would eliminate manual state tracking and timers.
2.  **`OfflineBanner` / `ConnectionStatus`:** The application's connectivity flow (`online` ↔ `offline` → `syncing` → `online` / `offline`) is a critical piece of state logic that would benefit immensely from the rigor of a state machine, especially for handling sync failures and retries.
3.  **`workflowStateAtom` (The Core Workflow):** This is the most significant opportunity. The primary user journey (`none` ↔ `scanning` ↔ `form`) is currently managed by a simple atom. Migrating this to a state machine would allow us to enforce transition rules (guards), manage side effects cleanly (e.g., pre-loading data on a state transition), and create a single, unimpeachable source of truth for the application's primary state.

#### 3. How to Confirm This is the Right Path

We will follow a deliberate, phased approach to de-risk this expansion and build team consensus.

1.  **Phase 1: Refactor Low-Hanging Fruit:** Begin by refactoring the `WriteNfcTagModal`. This is a small, low-risk component that will allow the team to gain more hands-on experience with the `jotai-fsm` pattern.
2.  **Phase 2: Solidify the Pattern:** Refactor the `ConnectionStatus` logic. This is slightly more complex and will demonstrate the FSM's value in managing asynchronous operations and branching logic.
3.  **Phase 3: Architect the Core:** Once the pattern is well-understood and validated, create a dedicated PRD for the ambitious refactor of the main `workflowStateAtom` into a formal state machine.