# Safety Check Lifecycle Specification

This document defines the lifecycle states and transition logic for safety checks within the eProbation Safety Check application.

## Core Parameters

*   **Base Interval (`baseInterval`):** The standard duration between checks (e.g., 15 minutes).
*   **Due Date (`dueDate`):** The target completion time for a check. It marks the end of the "On Time" window.
*   **Cycle Start (`windowStartTime`):** `DueDate - BaseInterval`. The moment the previous check was completed (or the cycle began).

## Lifecycle States (Simplified 3-State Model)

The status of a check is derived dynamically based on the current time relative to its `windowStartTime`.

| Status | Time Window | Description | Badge / UI |
| :--- | :--- | :--- | :--- |
| **Early** | `0m` to `7m` | Internal state. Triggers "early check" warning in form. | No badge (UI shows "Upcoming") |
| **Pending** | `7m` to `13m` | The standard checking window. | No badge (UI shows "Upcoming") |
| **Due** | `13m` to `15m` | The check is approaching its deadline (2-min warning). | **Badge:** "Due" (Yellow/Warning) |
| **Missed** | `≥ 15m` | The check was not completed in time. | **Badge:** "X Missed" (Red/Alert) |
| **Completing** | N/A (Transient) | User saved, success animation plays (0-2s). | **Badge:** "Completed" (Green/Success) |

## UI Groups

| Group | Statuses | Description |
| :--- | :--- | :--- |
| **Missed** | `missed` | Checks that require immediate attention |
| **Due** | `due` | Checks in the 2-minute warning window |
| **Upcoming** | `early`, `pending` | Future checks |

## Dynamic Missed Badge Labels

The badge label reflects how many 15-minute cycles have been missed:

| Time Since Due | Badge Label |
| :--- | :--- |
| 0-15 min | "Missed" |
| 15-30 min | "2 Missed" |
| 30-45 min | "3 Missed" |
| 45-60 min | "4 Missed" |
| ... | Pattern continues |

## Transition Logic

### 1. Completion Rollover
When a user completes a check (in any state):
1.  **Transient Phase:** Status becomes `completing`. Card visual updates, but data remains active (2s animation).
2.  **Commit:** After animation, check is marked `complete`.
3.  A **new check** is immediately generated.
4.  **Legal Compliance Anchor:** 
    *   If completed **before or at Max Time** (≤15m): `Next Due Date = Completion Time + Base Interval`
    *   If completed **after Max Time** (>15m): `Next Due Date = Max Time (Previous Due Date) + Base Interval`
5.  **Result:** The new check starts at `T=0` of its own cycle, placing it in the **Early** state.

### 2. Missed Trigger
When the system detects a check has passed its Due Date (15m mark):
1.  The current check is marked `missed`.
2.  A **new check** is immediately generated.
3.  **Legal Compliance Anchor:** `Next Due Date = Original Due Date + Base Interval`
4.  **Result:** The new check starts at `T=0` of its own cycle.