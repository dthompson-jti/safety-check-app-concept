Excellent. The core interactive prototype is now well-defined. The next logical step is to enhance its fidelity by introducing the remaining check statuses, dynamic timers, and the crucial "Supplemental Check" workflow. This will make the prototype feel alive and demonstrate how it handles the full lifecycle of a safety check.

Here is the detailed plan for the next phase.

---

## PRD-06: High-Fidelity Schedule & Supplemental Checks

### 1. Overview

This document specifies the requirements for elevating the prototype's realism by introducing dynamic, time-sensitive elements and accommodating unscheduled events. This phase will focus on implementing the full range of check statuses (`Late`, `Missed`, `Supplemental`), adding live countdown timers to the schedule, and providing in-app alerts for time-sensitive checks. Crucially, it will also build the complete workflow for an officer to perform a "Supplemental Check"—an unscheduled check prompted by an ad-hoc event like a noise or incident.

### 2. Problem & Goals

**Problem:** The current schedule is static and only represents a "happy path" scenario. It lacks the visual language to communicate urgency for late or missed checks. Without live timers and alerts, it doesn't feel like a real-time operational tool. Furthermore, the application doesn't support the critical, real-world scenario of an officer needing to perform a check outside of the regular schedule.

**Goals:**

1.  **Implement All Check Statuses:** Update the `CheckCard` component to visually represent `Late`, `Missed`, and `Supplemental` states, in addition to the existing ones.
2.  **Introduce Live Timers:** Integrate a performant, global timer to power live countdowns on each `CheckCard`, showing the time until a check is due.
3.  **Provide In-App Alerts:** Implement a system that triggers a toast notification when a check becomes "Due Soon" or "Overdue," drawing the officer's attention to urgent tasks.
4.  **Build the Supplemental Check Workflow:** Create an intuitive entry point and process for an officer to select a room and record an unscheduled, supplemental check.

### 3. Scope & Key Initiatives

**In Scope:**

*   **`CheckCard` Style Updates:** Add new visual variants to `CheckCard.module.css` for `Late`, `Missed`, and `Supplemental` statuses.
*   **Global Timer System:** A single, efficient timer mechanism that updates a `currentTimeAtom` periodically.
*   **Alerting Logic:** A centralized effect hook that monitors check due times and triggers toast notifications for key events.
*   **Supplemental Check Entry Point:** A new, clearly marked button in the main header to initiate an unscheduled check.
*   **Room Selection Modal:** A new modal (`SelectRoomModal.tsx`) that allows the officer to choose a room for the supplemental check.
*   **State Management:**
    *   The `SafetyCheck` type will be updated to include all possible statuses.
    *   A new `CHECK_SUPPLEMENTAL_ADD` action will be added to the `dispatchActionAtom` reducer.
    *   The mock data will be updated to include checks in `Late` and `Missed` states for testing.

**Out of Scope:**

*   **Complex Business Logic:** The prototype will not calculate *when* a check becomes late or missed. These states will be hardcoded in the mock data. The goal is to build the UI for these states, not the logic that triggers them.
*   **Push Notifications:** All alerts will be in-app toast notifications. No native or web push notifications will be implemented.
*   **Audit Trail/History:** The new supplemental checks will be added to the main data store, but the full "History" view for viewing and filtering them is deferred to the next PRD.

### 4. UX/UI Specification & Wireframes

This phase introduces more dynamic and state-rich UI elements.

*   **Updated `CheckCard` States:**

    **ASCII Wireframe: `CheckCard` for a `Late` check**
    ```
          +-------------------------------------------------+
          | | [ Room 101 ] - [ J. Smith ]                   |
          | |                                               |
          | | LATE - Overdue by 2m 15s                      | <-- Text is red, timer counts up
          +-------------------------------------------------+
            ^
            Status Indicator: var(--surface-fg-alert-primary)
    ```
    *   **Missed:** The card might appear greyed out (`opacity: 0.6`) with the status "MISSED" to indicate it's no longer actionable.
    *   **Supplemental:** These will not appear on the main schedule but will be visible in the history view (PRD-07).

*   **Supplemental Check Workflow:**

    **ASCII Wireframe: Header with new button**
    ```
          +-------------------------------------------------+
          | ≡  Schedule      [ + ] Sort by: [Due Time ▼]    | <-- New "Add Supplemental" Button
          +-------------------------------------------------+
    ```
    *   **Flow:**
        1.  Officer taps the `[ + ]` button in the header.
        2.  The `SelectRoomModal` appears, prompting them to choose a room.
        3.  After selecting a room and clicking "Continue," the existing `CheckFormView` (from PRD-04) is opened for that room.
        4.  Upon saving, the data is recorded as a `Supplemental` check, and the user is returned to the schedule.

### 5. Architecture & Implementation Plan

1.  **State Management & Data:**
    *   **Types:** In `src/types.ts`, update the `SafetyCheck` status union:
        ```typescript
        status: 'pending' | 'complete' | 'late' | 'missed' | 'supplemental';
        ```
    *   **Mock Data:** In `appDataAtoms.ts`, add examples of checks with `late` and `missed` statuses and past-due timestamps.
    *   **Global Timer:** In `src/data/atoms.ts`, create the time-tracking atom:
        ```typescript
        export const currentTimeAtom = atom(new Date());
        ```
    *   **Reducer:** In `appDataAtoms.ts`, add the new action and logic:
        ```typescript
        | { type: 'CHECK_SUPPLEMENTAL_ADD'; payload: { roomId: string; notes: string; status: string; } }
        ```

2.  **Component Implementation:**
    *   **`AppShell.tsx`:** This is the ideal location for the global timer and alert logic.
        *   Use a `useEffect` with an empty dependency array to start a `setInterval` on mount. This interval will call `setCurrentTime(new Date())` every second.
        *   Create a second `useEffect` hook that depends on `currentTimeAtom` and `safetyChecksAtom`. This hook will contain the logic to check for upcoming checks that cross the "due soon" or "overdue" threshold and fire a toast via `addToastAtom`. It must maintain an internal state (e.g., a `useRef` holding a `Set` of check IDs) to prevent firing duplicate alerts.
    *   **`CheckCard.tsx`:**
        *   This component will now subscribe to `currentTimeAtom`.
        *   It will calculate the difference between the check's `dueDate` and the `currentTime` to display a live countdown.
        *   It will use conditional classes based on the check's `status` to apply different styles (colors, opacity).
    *   **Create `SelectRoomModal.tsx`:**
        *   Create a new modal in `src/features/Admin/`.
        *   Its visibility will be controlled by a new `isSelectRoomModalOpenAtom`.
        *   It will contain a `Select` component populated with all available rooms.
        *   Its "Continue" button will set the `workflowStateAtom` to the `form` view, passing the selected room's data.
    *   **Update Layouts:** The header section of each layout component from PRD-01 will be modified to include the new "Add Supplemental" `Button`. Its `onClick` handler will open the `SelectRoomModal`.

### 6. File Manifest

*   **src/features/Admin/**
    *   `SelectRoomModal.tsx` `[NEW]`
    *   `SelectRoomModal.module.css` `[NEW]`
*   **src/features/SafetyCheckSchedule/**
    *   `CheckCard.tsx` `[MODIFIED]`
    *   `CheckCard.module.css` `[MODIFIED]`
*   **src/layouts/**
    *   `ClassicLayout.tsx` (and others) `[MODIFIED]` (Add supplemental button to header)
*   **src/data/**
    *   `atoms.ts` `[MODIFIED]` (Add `currentTimeAtom`, `isSelectRoomModalOpenAtom`)
    *   `appDataAtoms.ts` `[MODIFIED]` (Add `CHECK_SUPPLEMENTAL_ADD` action, update mock data)
*   **src/**
    *   `AppShell.tsx` `[MODIFIED]` (Add global timer and alert logic)
    *   `types.ts` `[MODIFIED]` (Update `SafetyCheck['status']` type)

### 7. Unintended Consequences Check

*   **Performance:** The global timer updating every second will trigger re-renders in all visible `CheckCard` components. This is generally fine for a prototype, but in a production app, we would use memoization (`React.memo`) on the `CheckCard` and ensure the time calculation is extremely lightweight to prevent any jank.
*   **Alert Fatigue:** The alerting logic must be carefully designed to be helpful, not annoying. Firing a toast for every single due check in a large facility could be overwhelming. For the prototype, this is acceptable, but a real implementation would need rules to batch or rate-limit alerts.

### 8. Risks & Mitigations

1.  **Risk:** The time-based logic (timers, alerts) could be buggy due to timezone issues or incorrect date calculations.
    *   **Mitigation:** For the prototype, we will consistently use JavaScript `Date` objects and simple subtractions to get time differences in milliseconds. This avoids most timezone complexities. All mock data will use relative-to-now timestamps to ensure it's always relevant during a demo.
2.  **Risk:** The entry point for supplemental checks might not be discoverable.
    *   **Mitigation:** We will use a prominent, universally understood icon (like `+` or `note_add`) in the header and provide it with a clear tooltip ("Add Supplemental Check"). Its placement next to the primary sorting control keeps related actions grouped together.

### 9. Definition of Done

*   [ ] The `SafetyCheck` type and mock data now include all statuses (`late`, `missed`, `supplemental`).
*   [ ] The `CheckCard` component visually distinguishes between `Late`, `Missed`, and other statuses.
*   [ ] Each pending `CheckCard` displays a live, ticking countdown timer.
*   [ ] A toast notification is automatically triggered when a check becomes "Due Soon."
*   [ ] A new "Add Supplemental Check" button is present in the header of the main schedule view.
*   [ ] Clicking this button opens a modal to select a room.
*   [ ] Completing the flow from this modal successfully adds a new check with the status "supplemental" to the data store.
*   [ ] The global timer and alert logic are implemented efficiently within `AppShell.tsx`.