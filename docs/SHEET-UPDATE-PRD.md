Of course. Your correction is a crucial refinement that significantly improves the feature's utility for its core purpose: provisioning multiple rooms efficiently. The workflow should absolutely support batch operations without forcing the user to re-open the list after every successful write.

Here is the updated, comprehensive PRD based on all your feedback.

---

### **PRD: High-Craft NFC Tag Provisioning Workflow**

**Version:** 2.1
**Status:** Approved

#### **1. Overview**

This document outlines the requirements for a high-craft, multi-step user experience for provisioning NFC tags. The current single-sheet workflow will be replaced with a more robust and intuitive "stacked bottom sheet" pattern. This new design prioritizes efficiency for batch operations, allowing a user to provision multiple rooms in a single session. It introduces clear, state-specific user feedback for the writing process and includes dedicated developer tools to ensure all workflow states can be reliably tested.

#### **2. Problem & Goals**

*   **Problem:** The existing NFC provisioning workflow is inefficient for its primary use case (setting up multiple rooms), as it closes after a single action. It also lacks the clear, stateful feedback required for a hardware-dependent interaction, and its underlying component architecture is not scalable.
*   **Goals:**
    1.  **UX Goal:** Reduce the time and cognitive load required to provision multiple NFC tags in a single, uninterrupted session.
    2.  **UI/Feedback Goal:** Provide clear, unambiguous, in-context feedback for the `writing`, `success`, and `error` states of the tag provisioning process.
    3.  **Architecture Goal:** Establish a scalable and maintainable component architecture by separating presentational primitives from feature-specific components.
    4.  **Testing Goal:** Enable robust and deterministic testing of all workflow states via a dedicated developer tool.

#### **3. Scope & Key Initiatives**

*   **Initiative 1: Stacked Bottom Sheet Workflow:** Implement the complete two-sheet user flow for room selection and tag writing, including the "batch mode" enhancement.
*   **Initiative 2: Developer Simulation Tool:** Create a new control in the Developer Overlay to simulate success and specific failure modes for the NFC writing process.
*   **Initiative 3: Component Architecture Refactor:** Decompose the generic `ListItem` into a reusable primitive (`ActionListItem`) and new feature-specific components (`NfcRoomListItem`, `ManualCheckListItem`).

*   **Out of Scope:**
    *   Native hardware integration with a device's NFC reader. This PRD covers the UI/UX simulation only.
    *   A full administrative dashboard for managing rooms or tags.
    *   The ability to edit room names or other data within this workflow.

#### **4. UX/UI Specification & Wireframes**

The user initiates the flow from the side menu, which opens the **Room Selection Sheet (Sheet 1)**. Tapping a room opens the **Tag Writing Sheet (Sheet 2)** on top of it.

*   **Core Interaction Flow:**
    1.  User selects a room from Sheet 1.
    2.  Sheet 2 slides up, displaying the "Writing..." state.
    3.  After a simulated delay, Sheet 2 transitions to either the "Success" or "Error" state.
    4.  **On Success:** Sheet 2 automatically dismisses after a brief pause, returning the user to the still-open Sheet 1, ready to select the next room. A toast notification provides persistent confirmation.
    5.  **On Error:** Sheet 2 remains open, displaying the error and allowing the user to "Retry" or "Cancel".

*   **Wireframes:**

    **Sheet 1: Room Selection (`WriteNfcTagModal`)**
    ```
    +----------------------------------------+
    |  Provision NFC tag                     |  // Drawer.Title
    +----------------------------------------+
    |  [🔍 Search for a room...]             |  // SearchInput, var(--spacing-4) padding
    +----------------------------------------+
    |                                        |  // List Container
    |  +----------------------------------+  |
    |  | Cyberdyne Annex                  |  |  // <NfcRoomListItem />
    |  +----------------------------------+  |
    |  | Future Resistance Bunker         |  |
    |  +----------------------------------+  |
    |  | Skynet Command Center            |  |
    |  +----------------------------------+  |
    |                                        |
    +----------------------------------------+
    ```

    **Sheet 2: Tag Writing - Success State (`NfcWritingSheet`)**
    ```
    +----------------------------------------+
    |                                        |
    |                  (v)                   |  // Success Icon, color: var(--surface-fg-success-primary)
    |                                        |
    |        Tag Written Successfully        |  // Title
    |                                        |
    |   The tag for 'Cyberdyne Annex' is     |  // Message
    |      now synced with eSupervision.     |
    |                                        |
    |                                        |  // This sheet auto-dismisses after ~2s
    +----------------------------------------+
    |  Provision NFC tag                     |  // Sheet 1 is visible underneath
    +----------------------------------------+
    ```
    **Sheet 2: Tag Writing - Error State (`NfcWritingSheet`)**
    ```
    +----------------------------------------+
    |                                        |
    |                  (!)                   |  // Error Icon, color: var(--surface-fg-alert-primary)
    |                                        |
    |               Write Failed             |  // Title
    |                                        |
    |     Unable to write tag due to         |  // Message
    |        (Low Connectivity).             |
    |                                        |
    |  [   Retry   ]  [   Cancel   ]         |  // Buttons using .btn styles
    |                                        |
    +----------------------------------------+
    |  Provision NFC tag                     |  // Sheet 1 is visible underneath
    +----------------------------------------+
    ```

#### **5. Architecture & Implementation Plan**

*   **State Management:** A new Jotai atom, `nfcWorkflowStateAtom`, will be created in a new `nfcAtoms.ts` file to manage the state of this specific workflow. It will function as a state machine, holding the `status: 'selecting' | 'writing' | 'success' | 'error'` and the `context: { roomId: string, roomName: string }`.
*   **Component Architecture:**
    1.  **`ActionListItem.tsx` [NEW]:** A generic, unopinionated component in `/src/components`. It will provide the core tappable container with shared styles (padding, hover/active states) and accept `children`.
    2.  **`NfcRoomListItem.tsx` [NEW]:** A feature component in `/src/features/Overlays`. It will compose `<ActionListItem>` and render the room name.
    3.  **`ManualCheckListItem.tsx` [NEW]:** A feature component in `/src/features/Overlays`. It will compose `<ActionListItem>` and render the complex layout for a safety check (room name, list of residents, inline `warning` icons).
    4.  **`WriteNfcTagModal.tsx` [MODIFIED]:** Will be refactored to manage only Sheet 1. It will render `<NfcRoomListItem>`s. Its `onClick` handler will set the `nfcWorkflowStateAtom` to begin the writing process.
    5.  **`NfcWritingSheet.tsx` [NEW]:** A new component in `/src/features/Overlays`. It will be controlled by a `Drawer.Root` whose `open` state is derived from the `nfcWorkflowStateAtom`. It will conditionally render the UI for the writing, success, and error states.
    6.  **`DeveloperOverlay.tsx` [MODIFIED]:** A new "NFC SIMULATION" section will be added, controlled by a new `nfcSimulationAtom` that dictates the outcome of the write process.

#### **6. File Manifest**

*   **/src/components/**
    *   `ActionListItem.tsx` **[NEW]** - The new presentational primitive.
    *   `ActionListItem.module.css` **[NEW]**
    *   `ListItem.tsx` **[REMOVED]** - Will be replaced by the new architecture.
    *   `ListItem.module.css` **[REMOVED]**
*   **/src/features/Overlays/**
    *   `NfcWritingSheet.tsx` **[NEW]** - The new component for the second sheet.
    *   `NfcWritingSheet.module.css` **[NEW]**
    *   `NfcRoomListItem.tsx` **[NEW]** - Feature-specific list item for NFC workflow.
    *   `ManualCheckListItem.tsx` **[NEW]** - Feature-specific list item for Manual Check.
    *   `WriteNfcTagModal.tsx` **[MODIFIED]** - Refactored to manage Sheet 1 and use new components/state.
    *   `ManualSelectionView.tsx` **[MODIFIED]** - Refactored to use `ManualCheckListItem`.
    *   `DeveloperOverlay.tsx` **[MODIFIED]** - To add the new simulation controls.
*   **/src/data/**
    *   `nfcAtoms.ts` **[NEW]** - To house the new `nfcWorkflowStateAtom` and `nfcSimulationAtom`.
*   **[REFERENCE]**
    *   `AppShell.tsx` - Renders all the overlay modals.
    *   `atoms.ts` - For comparison and to ensure no naming conflicts.
    *   `appDataAtoms.ts` - The progressive disclosure search logic will be replicated from here.
    *   `buttons.css` - The new components will rely on these global button styles.

#### **7. Unintended Consequences Check**

*   **Global Styles:** Removing `ListItem.module.css` and its associated component requires checking `ManualSelectionView.tsx` and any other potential consumers to ensure they are updated to the new `ManualCheckListItem` component. The new `ActionListItem` styles must be scoped to avoid conflicts with other list-like components (e.g., `.menu-item`).
*   **State Management:** The new `nfcAtoms.ts` file must be cleanly integrated. We must ensure that the state for this workflow is fully reset when the user cancels or completes the entire process to prevent stale data on the next invocation.
*   **Accessibility:** The focus management for the stacked sheets must be verified. When Sheet 2 appears, focus should be trapped within it. When it dismisses, focus should return gracefully to Sheet 1.

#### **8. Risks & Mitigations**

*   **Risk 1 (UX):** The stacked sheet animation could feel janky or complex.
    *   **Mitigation:** We will use the `vaul` library, which is designed for this pattern, and leverage Framer Motion for hardware-accelerated animations. The interaction will be tested on-device.
*   **Risk 2 (State Complexity):** Managing the state between two active modals could be complex.
    *   **Mitigation:** A single, dedicated Jotai atom (`nfcWorkflowStateAtom`) acting as a state machine will be the single source of truth, ensuring predictable transitions and preventing race conditions.
*   **Risk 3 (Code Duplication):** The progressive disclosure search logic could be duplicated.
    *   **Mitigation:** The exact, battle-tested Jotai atom pattern (`contextual...`, `global...`, `...ResultsAtom`) from the Manual Selection feature will be replicated for the location search, minimizing new logic and ensuring consistency.

#### **9. Definition of Done**

1.  [ ] The "Write NFC Tag" button opens a bottom sheet (Sheet 1) displaying a searchable list of rooms.
2.  [ ] The search functionality correctly implements progressive disclosure (contextual first, then global).
3.  [ ] Tapping a room opens a second bottom sheet (Sheet 2) over the first, displaying the "Writing..." UI.
4.  [ ] The developer tool in the Developer Overlay can successfully force a "Success" or "Failure" state.
5.  [ ] On a successful write, Sheet 2 displays the success message for ~2 seconds, a confirmation toast is fired, and Sheet 2 then automatically dismisses, returning the user to the fully interactive Sheet 1.
6.  [ ] On a failed write, Sheet 2 displays the correct error message (including the reason) and provides "Retry" and "Cancel" options.
7.  [ ] The `ListItem` component is successfully refactored into `ActionListItem`, `NfcRoomListItem`, and `ManualCheckListItem` without any visual or functional regressions in the Manual Selection view.
8.  [ ] The feature is fully accessible and performs smoothly on target devices.