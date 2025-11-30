# Safety Check Lifecycle Specification

This document defines the lifecycle states and transition logic for safety checks within the eProbation Safety Check application.

## Core Parameters

*   **Base Interval (`baseInterval`):** The standard duration between checks (e.g., 15 minutes).
*   **Due Date (`dueDate`):** The target completion time for a check. It marks the end of the "On Time" window and the start of the "Late" window.
*   **Cycle Start (`windowStartTime`):** `DueDate - BaseInterval`. The moment the previous check was completed (or the cycle began).
*   **Missed Buffer:** A fixed grace period (e.g., 7 minutes) after the Due Date before a check is considered "Missed".

## Lifecycle States

The status of a check is derived dynamically based on the current time relative to its `windowStartTime`.

| Status | Time Window (relative to Cycle Start) | Description | Badge / UI |
| :--- | :--- | :--- | :--- |
| **Early** | `0m` to `7m` | The check has just been generated. It is actionable but considered ahead of schedule. | **Badge:** "Early" (Grey/Neutral) |
| **Pending** | `7m` to `13m` | The standard checking window. | **Badge:** None (Standard UI) |
| **Due Soon** | `13m` to `15m` | The check is approaching its deadline. | **Badge:** "Due Soon" (Blue/Info) |
| **Late** | `15m` to `22m` | The check is past its Due Date but within the grace period. | **Badge:** "Late" (Orange/Warning) |
| **Missed** | `> 22m` | The grace period has expired. The check is auto-resolved as missed. | **Badge:** "Missed" (Grey/History) |

## Transition Logic

### 1. Completion Rollover
When a user completes a check (in any state):
1.  The current check is marked `complete`.
2.  A **new check** is immediately generated.
3.  **New Due Date Calculation:** `Completion Time + Base Interval`.
4.  **Result:** The new check starts at `T=0` of its own cycle, placing it in the **Early** state.

### 2. Missed Rollover
When the system detects a check has exceeded the Missed Buffer (`Due Date + 7m`):
1.  The current check is marked `missed`.
2.  A **new check** is immediately generated.
3.  **New Due Date Calculation:** `Missed Time (Now) + Base Interval`.
4.  **Result:** The new check starts at `T=0` of its own cycle, placing it in the **Early** state. This ensures the guard has a full 15-minute interval for the next round, rather than falling permanently behind schedule.

---

# Developer Verification Plan

Use this plan to verify the implementation of the new lifecycle logic and troubleshoot the loading issue.

## 1. Loading Issue Investigation (Non-Incognito)
The app failing to load outside of incognito strongly suggests a **Persistence/Storage conflict**. The `atomWithStorage` logic might be trying to load old, incompatible state schema from `localStorage`.

*   **File:** `src/main.tsx`
    *   **Action:** Verify the "Version Bomb" logic. Ensure `APP_VERSION` is incremented (e.g., to `'v3'`) to force a storage wipe on the next reload.
    *   **Action:** Check the console for `Zod` or JSON parsing errors during hydration.

## 2. Lifecycle Logic Verification
*   **File:** `src/types.ts`
    *   **Check:** Verify `SafetyCheckStatus` union type includes `'early'`.
*   **File:** `src/data/appDataAtoms.ts`
    *   **Check:** `generateNextCheck` function: Ensure `dueDate` is calculated based on `originTime` (passed argument), NOT the old `dueDate`.
    *   **Check:** `safetyChecksAtom` (Derived Atom): Verify the `if/else` logic for status derivation matches the spec (0-7, 7-13, 13-15, 15-22).
    *   **Check:** `CHECK_MISSED` reducer case: Ensure it passes `action.payload.missedTime` to `generateNextCheck`.
*   **File:** `src/data/useCheckLifecycle.ts`
    *   **Check:** `missedThreshold` calculation: Should be `dueDate + 7 minutes`.
    *   **Check:** `dispatch` payload: Ensure `missedTime` is set to `new Date(now).toISOString()`.

## 3. UI Representation Verification
*   **File:** `src/features/Schedule/StatusBadge.tsx` & `.module.css`
    *   **Check:** Verify the `'early'` case is handled and returns the correct label/style.
*   **File:** `src/data/mock/checkData.ts`
    *   **Check:** Verify the mock data generation logic (`offsetMinutes`) aligns with the new window definitions. (e.g., Early = `due in 13-15m`).

## 4. Simulation Testing (Manual)
1.  **Clear Storage:** Open DevTools -> Application -> Local Storage -> Clear All. Reload.
2.  **Early Check:** Complete a check. Observe the new check appearing immediately with an "Early" badge.
3.  **Missed Rollover:**
    *   Use the "Developer Tools" modal (if available) or modify `mock/checkData.ts` to spawn a check that is 1 second away from missing.
    *   Wait for the toast.
    *   Verify the old check moves to history (Missed).
    *   Verify the new check appears with "Early" status and a Due Date 15 minutes from *now*.