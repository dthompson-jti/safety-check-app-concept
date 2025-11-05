Excellent. With the foundational shell and schedule display in place, we can now build the core interactive loop of the application.

---

## PRD-04: Core Scan & Check Workflow

### 1. Overview

This document specifies the requirements for building the end-to-end user workflow for performing a safety check. This is the primary "job-to-be-done" for the application. The workflow begins when an officer initiates a check from the schedule, proceeds to a camera-based scanning screen to identify the room, moves to a form for recording the check's outcome, and concludes by saving the data and returning to the updated schedule. This PRD includes provisions for both a live camera feed and a robust developer simulation mode to allow for complete testing without physical QR codes.

### 2. Problem & Goals

**Problem:** The safety check schedule, as built in PRD-03, is a read-only display. There is no mechanism for an officer to act on the information presented. We need to bridge the gap between seeing a due check and recording its completion, which is the fundamental purpose of the app.

**Goals:**

1.  **Enable Check Initiation:** Allow users to start the check workflow by tapping on a `CheckCard` or a primary "Scan" FAB.
2.  **Implement QR Code Scanning:** Create a dedicated scanning view that utilizes the device's camera to read QR codes.
3.  **Build the Check Form:** Develop a mobile-optimized form that allows for the quick and efficient recording of a resident's status and any optional notes (Req 44).
4.  **Connect State Updates:** On form submission, update the application's central state to mark the check as complete and record the completion time (Req 45).
5.  **Create a Seamless Flow:** Ensure the navigation between the schedule, scanner, and form is smooth, intuitive, and provides clear user feedback.
6.  **Support Damaged Tags:** Provide a manual override flow for situations where a tag cannot be scanned (Req 47).

### 3. Scope & Key Initiatives

**In Scope:**

*   **`ScanView` Component:** A new full-screen component that integrates a QR code scanning library.
*   **`CheckFormView` Component:** A new full-screen component for recording check details.
*   **Workflow State Management:** A new Jotai atom to manage the state of the active check workflow (e.g., which room is being checked).
*   **State Mutation:** An action will be added to the `dispatchActionAtom` to handle the completion of a safety check.
*   **Developer Simulation:** The `ScanView` will include on-screen controls to simulate a successful scan, a failed scan, and camera permission denial, enabling full workflow testing in a browser.
*   **Manual Override Flow:** A button on the `ScanView` will allow users to bypass the camera and select a room from a list to complete a check.
*   **User Feedback:** Toast notifications will be used to confirm successful saves and report errors.

**Out of Scope:**

*   **NFC Scanning:** This workflow is limited to QR codes only.
*   **Complex Status Logic:** For this prototype, a "saved" check will simply be marked as `complete`. The nuanced logic for `Late`, `Missed`, or `Supplemental` checks is not in scope for this PRD.
*   **Backend Syncing:** All state changes are local to the client.
*   **Rich Capture:** The form will not include photo or audio attachments (Req Out of Scope, pg 17).

### 4. UX/UI Specification & Wireframes

The workflow is a linear progression of three screens.

*   **Interaction Flow:**
    `ScheduleView -> ScanView -> CheckFormView -> ScheduleView`

*   **`ScanView` Component:** A full-screen view that immediately activates the camera.

    **ASCII Wireframe: `ScanView.tsx`**
    ```
          +----------------------------------+
          | [ X ]         Scan Room QR Code  | <-- Header with Close button
          |----------------------------------|
          |                                  |
          |      +--------------------+      |
          |      |                    |      |
          |      |   [ Camera Feed ]  |      | <-- Viewfinder overlay
          |      |                    |      |
          |      +--------------------+      |
          |                                  |
          |    [ Can't Scan? ]               | <-- Manual Override Button
          |----------------------------------|
          | --- DEV CONTROLS ---             |
          | [Simulate Success] [Simulate Fail]|
          +----------------------------------+
    ```

*   **`CheckFormView` Component:** A form focused on large, easy-to-use controls.

    **ASCII Wireframe: `CheckFormView.tsx`**
    ```
          +----------------------------------+
          | [ < Back ]      Record Check     | <-- Header
          |----------------------------------|
          | Room 104 - A. Jones (SR)         |
          |----------------------------------|
          | STATUS                           |
          | +-----------+ +------------+     |
          | |  Awake    | |  Sleeping  |     | <-- IconToggleGroup component
          | +-----------+ +------------+     |
          |                                  |
          | NOTES (OPTIONAL)                 |
          | +----------------------------+   |
          | |                            |   | <-- <textarea>
          | +----------------------------+   |
          |                                  |
          |----------------------------------|
          | [ Cancel ]           [ Save ]    | <-- Footer with Buttons
          +----------------------------------+
    ```

### 5. Architecture & Implementation Plan

1.  **Package Installation:**
    *   Install a modern QR scanner library: `npm install @yudiel/react-qr-scanner`.

2.  **State Management (Jotai):**
    *   In `src/data/atoms.ts`, create a workflow management atom. This will control which screen is shown and what data is being operated on.
        ```typescript
        type WorkflowState = 
          | { view: 'none' }
          | { view: 'scanning' }
          | { view: 'form'; checkId: string; roomName: string; residentName: string; };

        export const workflowStateAtom = atom<WorkflowState>({ view: 'none' });
        ```
    *   In `src/data/appDataAtoms.ts`, add a new action type to the `AppAction` union:
        ```typescript
        | { type: 'CHECK_COMPLETE'; payload: { checkId: string; notes: string; status: string; } }
        ```
    *   Implement the reducer logic for this action to update the status and `lastChecked` timestamp of the specified check.

3.  **Component Structure:**
    *   **Modify `AppShell.tsx`:** It will now render the active workflow view as an overlay on top of the main layout.
        ```tsx
        // src/AppShell.tsx (logic sketch)
        const workflow = useAtomValue(workflowStateAtom);
        
        return (
          <>
            <TheCorrectLayout>{...}</TheCorrectLayout>
            {workflow.view === 'scanning' && <ScanView />}
            {workflow.view === 'form' && <CheckFormView checkData={workflow} />}
          </>
        )
        ```
    *   **Create `ScanView.tsx`:**
        *   Located in `src/features/Scanning/`.
        *   Use the `useQrScanner` hook from the library. The `onDecode` callback will be the success path.
        *   The `onDecode` handler will find the matching `SafetyCheck` in the global state and then call `setWorkflowState` to transition to the `'form'` view.
        *   The "Simulate Success" button will do the same, picking a random check from the list.
        *   The "Close" button will set the workflow state back to `{ view: 'none' }`.
    *   **Create `CheckFormView.tsx`:**
        *   Located in `src/features/CheckForm/`.
        *   It will receive the check data as props from the `AppShell`.
        *   Use `useState` to manage the form inputs (selected status, notes).
        *   The "Save" button's `onClick` handler will call `dispatch({ type: 'CHECK_COMPLETE', ... })`, show a success toast, and then call `setWorkflowState({ view: 'none' })` to close the view.
    *   **Update `CheckCard.tsx` and Layouts:**
        *   The `CheckCard` component will get an `onClick` handler.
        *   The FAB in the layouts will get an `onClick` handler.
        *   Both handlers will call `setWorkflowState({ view: 'scanning' })`.

### 6. File Manifest

*   **src/features/Scanning/ `[NEW DIRECTORY]`**
    *   `ScanView.tsx` `[NEW]`
    *   `ScanView.module.css` `[NEW]`
*   **src/features/CheckForm/ `[NEW DIRECTORY]`**
    *   `CheckFormView.tsx` `[NEW]`
    *   `CheckFormView.module.css` `[NEW]`
*   **src/features/SafetyCheckSchedule/**
    *   `CheckCard.tsx` `[MODIFIED]` (Add `onClick` handler)
*   **src/layouts/**
    *   `ClassicLayout.tsx` (and others) `[MODIFIED]` (Add `onClick` handler to FAB)
*   **src/data/**
    *   `atoms.ts` `[MODIFIED]` (Add `workflowStateAtom`)
    *   `appDataAtoms.ts` `[MODIFIED]` (Add `'CHECK_COMPLETE'` action and reducer logic)
*   **src/**
    *   `AppShell.tsx` `[MODIFIED]` (Add logic to render workflow views as overlays)
*   **package.json** `[MODIFIED]` (Add `@yudiel/react-qr-scanner` dependency)

### 7. Unintended Consequences Check

*   **Camera Permissions:** The app will now request camera permissions. While the library handles the prompt, our UI must account for a "denied" state. The developer simulation controls provide a fallback, but a real-world app would need a user-friendly message explaining how to grant permission in browser settings.
*   **Layout Overlays:** Rendering the workflow views as overlays is a simple navigation strategy for a prototype. We must ensure they have a high `z-index` and a background that correctly obscures the underlying schedule view to prevent visual glitches or unintended interactions.
*   **Component Re-renders:** When a check is completed, the `safetyChecksAtom` will update, causing the schedule list to re-render. `react-virtuoso` will handle this efficiently, but we must verify that the updated card correctly reflects its new "complete" status.

### 8. Risks & Mitigations

1.  **Risk:** The QR scanner library may have cross-browser compatibility issues or poor performance on lower-end devices.
    *   **Mitigation:** We've chosen a modern, well-maintained library to minimize this risk. Crucially, the **developer simulation toggles are the primary mitigation**, ensuring that the entire workflow can be developed and tested without any reliance on the camera hardware.
2.  **Risk:** The overlay-based navigation could become complex if more steps are added to the workflow.
    *   **Mitigation:** For the defined scope (`Scan -> Form`), this approach is simple and effective. If the workflow were to become more complex (e.g., adding a supervisor approval step), we would refactor to use a more robust routing solution. This risk is acceptable for the prototype phase.
3.  **Risk:** The form for recording status could be slow for officers to use.
    *   **Mitigation:** The design explicitly calls for large, tappable controls like the `IconToggleGroup` component instead of standard, small radio buttons or a dropdown. This prioritizes speed and ergonomics for the primary user action.

### 9. Definition of Done

*   [ ] The `@yudiel/react-qr-scanner` package has been added to the project.
*   [ ] Tapping a `CheckCard` or the main "Scan" FAB opens the `ScanView` overlay.
*   [ ] The `ScanView` displays a live camera feed.
*   [ ] The `ScanView` includes developer buttons to simulate a successful and failed scan.
*   [ ] A successful scan (real or simulated) closes the `ScanView` and opens the `CheckFormView`, passing in the correct room/resident data.
*   [ ] The `CheckFormView` allows the user to select a status and enter notes.
*   [ ] Clicking "Save" on the form dispatches an action that updates the check's status to "complete" in the Jotai store.
*   [ ] After saving, the form overlay closes, a success toast is displayed, and the user is returned to the schedule.
*   [ ] The `CheckCard` on the schedule for the completed check now visually reflects its new "complete" status.
*   [ ] The "Can't Scan?" button on the `ScanView` is present and functional, leading to a manual selection flow.