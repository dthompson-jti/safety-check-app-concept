# PRD-002: Compliance Logic & Visualization

## Overview

Implement strict legal timing requirements for safety checks, simplified header status indicators for a cleaner "at-a-glance" view, and introduce configurable high-density input methods for resident statuses.

## Goals

1.  **Legal Compliance**: Enforce precise checking windows with a simplified 3-state model.
2.  **Cognitive Load Reduction**: Simplify the header to show only Missed and Due counts.3.  **Flexible Input**: Support configurable resident status options (2, 3, or 4 choices) to accommodate different facility protocols.
4.  **Visual Clarity**: Differentiate Upcoming / Due / Missed clearly in the schedule list.

---

## UX/UI Specification

### 1. Compliance Timing Windows (Simplified 3-State Model)

Safety checks follow a strict timeline based on the 15-minute interval:

| Window Name | Time Range (Elapsed) | Header Visibility | UI Representation |
| :--- | :--- | :--- | :--- |
| **Early** | 0 - 7 mins | Hidden | No Badge (Internal status for form warning) |
| **Pending** | 7 - 13 mins | Hidden | No Badge ("Upcoming" group) |
| **Due** | 13 - 15 mins | Visible (Yellow) | Yellow Badge + Timer (10fps) |
| **Missed** | 15+ mins | Visible (Red) | Red "X Missed" Badge (dynamic) |

> **Note**: The "Early" status is internal only - it shows a warning in the check form if completing before 7 minutes. Checks automatically transition to "Missed" at 15m (no grace period).

### 2. Header Status Bar

*   **Missed Pill** (First position):
    *   Displays count of **Missed** checks in Red/Alert.
    *   Icon: `notifications_active`
*   **Due Pill**:
    *   Displays count of **Due** checks in Yellow/Warning.
    *   Icon: `schedule`
*   **Interaction**:
    *   Tapping each pill opens a **Popover** with natural language (e.g., "3 Missed", "2 Due").

### 3. Schedule List Grouping

The schedule view is divided into three distinct priority sections:
1.  **Missed** (Top priority - red alert)
2.  **Due** (Warning status - yellow)
3.  **Upcoming** (Includes Early and Pending)

### 4. Dynamic Missed Badge Labels

The badge label reflects how many 15-minute cycles have been missed:

| Time Since Due | Badge Label |
| :--- | :--- |
| 0-15 min | "Missed" |
| 15-30 min | "2 Missed" |
| 30-45 min | "3 Missed" |
| 45-60 min | "4 Missed" |

### 5. Configurable Resident Input

The resident status input in the check form (`CheckEntryView`) is configurable via `AppConfig`.

*   **Configuration**: `residentStatusSet` ('set-2', 'set-3', 'set-4').
*   **Developer Toggle**: Added to Developer Modal for testing.
*   **Visual Layouts**:
    *   **2 or 3 Options**: Rendered as a standard horizontal segmented control.
    *   **4 Options**: Rendered as a **2x2 Grid** for high density.

### 6. Badge Styling

*   **Due Badge**: Yellow/Warning semantic (`--surface-fg-warning-primary`)
*   **Missed Badge**: Red/Alert semantic (`--surface-fg-alert-primary`)
*   **No badge for Upcoming**: Early/Pending checks don't display badges

---

## Technical Implementation

### Data Model (`src/types.ts`)
*   `SafetyCheckStatus`: `'early'`, `'pending'`, `'due'`, `'missed'`, `'completing'`, `'complete'`, `'queued'`
*   Removed: `'late'`, `'due-soon'`

### State Management (`src/data/appDataAtoms.ts`)
*   **Timing Logic**: 0-7m → early, 7-13m → pending, 13-15m → due
*   **Missed Trigger**: At exactly 15m via `useCheckLifecycle.ts`

### Components
*   **`StatusBar.tsx`**: 2 pills (Missed + Due)
*   **`StatusBadge.tsx`**: Dynamic "X Missed" labels based on elapsed cycles
*   **`CheckCard.module.css`**: Warning (yellow) for due, alert (red) for missed

---

## Definition of Done

*   [x] Simplified 3-state model (Upcoming/Due/Missed) implemented
*   [x] Header shows only Missed (red) and Due (yellow) pills
*   [x] Dynamic "X Missed" badges based on 15-minute cycles
*   [x] Schedule list groups by Missed / Due / Upcoming
*   [x] Resident input supports 4-option 2x2 grid layout
*   [x] Early warning preserved in check form view
