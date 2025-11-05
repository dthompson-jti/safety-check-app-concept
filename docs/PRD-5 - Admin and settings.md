Of course. Here is the detailed breakdown for the final core feature PRD, which consolidates the developer controls and administrative functions into a unified Settings screen.

---

## PRD-05: Admin & Settings

### 1. Overview

This document specifies the requirements for creating the "Settings" section of the application. This view will serve two critical functions for the prototype. First, it will be the central, non-intrusive hub for all developer-facing controls, allowing for the real-time switching of experimental UI layouts and components. Second, it will house user-facing session management (Logout) and provide a simulated UI for an administrative task ("Write NFC Tag"), which is essential for prototyping the full feature set described in the main PRD.

### 2. Problem & Goals

**Problem:** The experimental layout toggles implemented in previous PRDs are managed by a temporary `DevMenu` in the header. This is not a scalable or organized solution. Furthermore, the application lacks a dedicated home for account actions like logging out and administrative functions. We need a single, coherent location for these features to create a clean user experience and a powerful developer toolkit.

**Goals:**

1.  **Build a Centralized Settings View:** Create a functional, well-organized `SettingsView` using existing UI components like accordions and selectors.
2.  **Consolidate Developer Toggles:** Migrate all experimental UI controls (e.g., App Shell Layout, Schedule Layout) into a "Developer Options" section within the `SettingsView`.
3.  **Finalize Logout Flow:** Move the "Logout" button from its placeholder location into a permanent "Account" section on this screen.
4.  **Prototype Admin Workflow:** Build a simulated UI flow for the "Write NFC Tag" feature, allowing us to prototype the interaction without implementing the underlying Web NFC API.

### 3. Scope & Key Initiatives

**In Scope:**

*   **`SettingsView` Component:** A full implementation of the settings screen, replacing the current placeholder.
*   **UI Controls:** The view will use `Accordion`, `Select`, and `Button` components to manage global state atoms.
*   **Developer Options Section:** Controls for switching the `layoutModeAtom` (from PRD-01) and the `scheduleLayoutAtom` (a new atom for PRD-03 layouts).
*   **Account Section:** The final home for the "Logout" button.
*   **`WriteNfcTagModal` Component:** A new modal component that simulates the workflow of selecting a room and writing its ID to an NFC tag.
*   **State Management:** A new `isWriteNfcModalOpenAtom` to control the visibility of the new modal.

**Out of Scope:**

*   **Settings Persistence:** All settings are in-memory via Jotai atoms and will reset on browser refresh.
*   **Real Web NFC API Implementation:** The "Write NFC Tag" feature is a UI simulation only. It will not interact with device hardware.
*   **Additional Admin Functions:** No other admin features from the main PRD (e.g., user permissions, audit logs, scheduling rules) will be implemented.

### 4. UX/UI Specification & Wireframes

The `SettingsView` will use accordions to create a clean, organized, and scalable layout.

*   **`SettingsView` Layout:**

    **ASCII Wireframe: `SettingsView.tsx`**
    ```
          +----------------------------------+
          | ≡  Settings                      |  <-- Header
          |----------------------------------|
          | ▼ Developer Options              |  <-- AccordionItem
          |   +--------------------------+   |
          |   | App Layout: [Classic ▼]  |   |  <-- Select component
          |   +--------------------------+   |
          |   +--------------------------+   |
          |   | Schedule:  [List View ▼]|   |  <-- Select component
          |   +--------------------------+   |
          |----------------------------------|
          | ▶ Admin Tools                    |  <-- AccordionItem
          |----------------------------------|
          | ▶ Account                        |  <-- AccordionItem
          |   +--------------------------+   |
          |   |          Log Out         |   |  <-- Destructive Button
          |   +--------------------------+   |
          +----------------------------------+
    ```

*   **`WriteNfcTagModal` Workflow:** This modal simulates the admin task of provisioning a new NFC tag.

    **ASCII Wireframe: `WriteNfcTagModal.tsx`**
    ```
          +----------------------------------+
          | Select Room to Provision   [ X ] | <-- Modal.Header
          |----------------------------------|
          | Select a Room:                   |
          | +----------------------------+   |
          | | Room 101 - J. Smith      ▼ |   | <-- Select component
          | +----------------------------+   |
          |                                  |
          | Ready to write.                  |
          | Tap device to physical tag.      |
          |                                  |
          |----------------------------------|
          | [ Cancel ]       [ Write Tag ]   | <-- Modal.Footer
          +----------------------------------+
          Container uses `.modal-container` styles
    ```

### 5. Architecture & Implementation Plan

1.  **State Management (Jotai):**
    *   In `src/data/atoms.ts`, create the new modal control atom:
        ```typescript
        export const isWriteNfcModalOpenAtom = atom(false);
        ```
    *   Create a new atom to control the schedule layout from PRD-03:
        ```typescript
        export type ScheduleLayoutMode = 'list' | 'card' | 'priority';
        export const scheduleLayoutAtom = atom<ScheduleLayoutMode>('list');
        ```
    *   The `SettingsView` will use `useAtom` to read and write to `layoutModeAtom`, `scheduleLayoutAtom`, and `isWriteNfcModalOpenAtom`.

2.  **Component Structure:**
    *   **Refactor `SettingsView.tsx`:** Replace the placeholder content with the full implementation using `Accordion` and `Select` components. The `Select` components will be wired to the respective Jotai atoms.
    *   **Create `WriteNfcTagModal.tsx`:**
        *   Create a new directory `src/features/Admin/` and place the new modal component inside.
        *   The modal's visibility will be controlled by `isWriteNfcModalOpenAtom`.
        *   It will use the `safetyChecksAtom` to get a list of rooms to populate its `Select` control.
        *   The "Write Tag" button will be a simulation. Its `onClick` handler will:
            1.  Show a "Writing..." toast.
            2.  Use a `setTimeout` of ~1 second.
            3.  Randomly decide success or failure.
            4.  Show a success ("Room 101 tag written") or failure ("Failed to write tag") toast.
            5.  Close the modal by setting `isWriteNfcModalOpenAtom` to `false`.
    *   **Update `AppShell.tsx`:** Add the `WriteNfcTagModal` to the top level of the shell so it can be displayed as an overlay, similar to the workflow views from PRD-04.
    *   **Update `DashboardView.tsx`:** The logic for switching between `ListView`, `CardView`, and `PriorityView` will be updated to read from the new `scheduleLayoutAtom` instead of a temporary dev atom.
    *   **Deprecate `DevMenu.tsx`:** The temporary `DevMenu` component and its trigger in the header can now be removed.

### 6. File Manifest

*   **src/features/Settings/**
    *   `SettingsView.tsx` `[MODIFIED]`
    *   `SettingsView.module.css` `[NEW]`
*   **src/features/Admin/ `[NEW DIRECTORY]`**
    *   `WriteNfcTagModal.tsx` `[NEW]`
    *   `WriteNfcTagModal.module.css` `[NEW]`
*   **src/features/Dashboard/**
    *   `DashboardView.tsx` `[MODIFIED]` (Reads from `scheduleLayoutAtom`)
*   **src/data/**
    *   `atoms.ts` `[MODIFIED]` (Add `isWriteNfcModalOpenAtom`, `scheduleLayoutAtom`)
*   **src/**
    *   `AppShell.tsx` `[MODIFIED]` (Renders the new modal)
*   **src/components/**
    *   `DevMenu.tsx` `[DELETED]`
    *   `Accordion.tsx` `[REFERENCE]`
    *   `Select.tsx` `[REFERENCE]`
    *   `Button.tsx` `[REFERENCE]`
    *   `Modal.tsx` `[REFERENCE]`

### 7. Unintended Consequences Check

*   **Atom Wiring:** The settings screen directly manipulates several global state atoms. We must ensure that the `Select` components are correctly wired and that their `onValueChange` callbacks provide the correct type-safe values to the atom setters. An incorrect value could crash the layout-switching logic.
*   **State Reset:** Because settings are not persisted, any change a developer makes will be lost on refresh. This is expected behavior for the prototype but must be remembered during testing sessions.

### 8. Risks & Mitigations

1.  **Risk:** The `SettingsView` could become cluttered if more options are added.
    *   **Mitigation:** The use of `Accordion` components is a proactive measure against this. It establishes a clear, scalable pattern for grouping related settings. We will commit to this pattern for any future additions.
2.  **Risk:** Removing the `DevMenu` from the main header could be forgotten, leaving behind dead code.
    *   **Mitigation:** The file manifest explicitly lists `DevMenu.tsx` as `[DELETED]`. The developer executing this PRD will be responsible for removing the file and all its import statements.

### 9. Definition of Done

*   [ ] The `SettingsView` is accessible from the main navigation and is no longer a placeholder.
*   [ ] The `SettingsView` contains an "Developer Options" accordion.
*   [ ] Inside the accordion, `Select` controls exist to change the "App Layout" and "Schedule Layout".
*   [ ] These controls are fully functional and update the application's UI in real-time.
*   [ ] The old `DevMenu` component has been completely removed from the codebase.
*   [ ] The `SettingsView` contains an "Account" section with a functional "Logout" button.
*   [ ] The `SettingsView` contains an "Admin Tools" section with a "Write NFC Tag" button that opens the `WriteNfcTagModal`.
*   [ ] The `WriteNfcTagModal` correctly simulates the tag writing process, including showing appropriate toast notifications for success or failure, and closes itself upon completion.