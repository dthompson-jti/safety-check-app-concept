# PRD-002: Compliance Logic & Visualization

## Overview

Implement strict legal timing requirements for safety checks, aggregate header status indicators for a cleaner "at-a-glance" view, and introduce configurable high-density input methods for resident statuses.

## Goals

1.  **Legal Compliance**: Enforce precise 7/11/13/15 minute checking windows.
2.  **Cognitive Load Reduction**: Simplify the header status bar by aggregating "Due" and "Due Soon" items and moving details to a popover.
3.  **Flexible Input**: Support configurable resident status options (2, 3, or 4 choices) to accommodate different facility protocols.
4.  **Visual Clarity**: Differentiate "Due" vs "Due Soon" vs "Late" clearly in the schedule list.

---

## UX/UI Specification

### 1. Compliance Timing Windows

Safety checks follow a strict timeline based on the 15-minute interval:

| Window Name | Time Range (Elapsed) | Header Visibility | UI Representation |
| :--- | :--- | :--- | :--- |
| **Early** | 0 - 7 mins | Hidden | Grey Badge (Faint) |
| **Pending** | 7 - 11 mins | Hidden | No Badge (Standard Text) |
| **Due Soon** | 11 - 13 mins | Visible (Blue) | Blue Badge + Timer (10fps) |
| **Due** | 13 - 15 mins | Visible (Blue) | Blue Badge + Timer (10fps) |
| **Late** | 15+ mins | Visible (Orange) | Orange Badge + Timer (10fps) |

> **Note**: "Missed" checks (>20m) are handled via a separate lifecycle hook and are terminal states.

### 2. Header Status Bar

*   **Aggregated "Actionable" Pill**:
    *   Combines **Due** and **Due Soon** counts into a single Blue pill.
    *   *Example*: If 2 checks are Due and 3 are Due Soon, the pill displays `5`.
*   **Late Pill**:
    *   Displays count of **Late** checks in Orange.
*   **Interaction**:
    *   Tapping the Blue "Actionable" pill opens a **Popover**.
    *   **Popover Content**: Natural language breakdown (e.g., "2 Due Now", "3 Due Soon").
    *   **Styling**: Dark background (`primary-solid`), white text, sentence case.

### 3. Schedule List Grouping

The schedule view is divided into distinct priority sections:
1.  **Late** (Top priority)
2.  **Due**
3.  **Due Soon**
4.  **Upcoming** (Includes Early and Pending)

### 4. Configurable Resident Input

The resident status input in the check form (`CheckEntryView`) is configurable via `AppConfig`.

*   **Configuration**: `residentStatusSet` ('set-2', 'set-3', 'set-4').
*   **Developer Toggle**: Added to Developer Modal for testing.
*   **Visual Layouts**:
    *   **2 or 3 Options**: Rendered as a standard horizontal segmented control.
    *   **4 Options**: Rendered as a **2x2 Grid** for high density.
*   **Styling**:
    *   Minimum touch target: 48px.
    *   Border collapsing handled via negative margins.
    *   Title case text (e.g., "Awake", "Sleeping", "Refused", "Out").

### 5. Badge Styling Update

*   **Early Badge**: Clean separate style using `grey-30` background and `grey-200` border to reduce visual noise compared to "Info" badges.
*   **Due Badge**: New distinct badge for the 13-15m window.
*   **Text Casing**: All badges use **Title Case** (e.g., "Due Soon", "Early") instead of uppercase.

---

## Technical Implementation

### Data Model (`src/types.ts`)
*   Updated `SafetyCheckStatus` to include `'due'`.
*   Updated `ScheduleFilter` logic to support new grouping.

### State Management (`src/data/appDataAtoms.ts`)
*   **Timing Logic**: `safetyChecksAtom` derived atom updated to implement the 7/11/13/15 minute thresholds.
*   **Mock Data Generation**: Converted `initialChecks` to a factory function `generateInitialChecks()` to ensuring fresh timestamps on "Reset Application Data".

### Developer Tools
*   **Reset Data**: Now triggers a complete regeneration of mock data anchored to the exact moment of reset, resolving stale timeline issues during testing.

### Components
*   **`StatusBar.tsx`**: Implemented `Popover` for details.
*   **`CheckCard.tsx`**: Added `'due'` styling and animation support.
*   **`ResidentCheckControl.tsx`**: Dynamic rendering based on `residentStatusSet`.

---

## Definition of Done

*   [x] Timing windows (7/11/13/15) strictly enforced in logic.
*   [x] Header Blue pill aggregates "Due" + "Due Soon".
*   [x] Header Popover shows breakdown (e.g., "2 Due Now").
*   [x] Schedule list groups items by Late / Due / Due Soon / Upcoming.
*   [x] Resident input supports 4-option 2x2 grid layout.
*   [x] "Reset Data" in Developer Modal fixes stale check times.
*   [x] Early badges styled as faint grey.
*   [x] All badges use Title Case.
