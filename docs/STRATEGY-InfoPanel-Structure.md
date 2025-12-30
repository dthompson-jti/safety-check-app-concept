# STRATEGY: Info Panel & Data Organization v2
**Version:** 2.0 (Deep Dive)
**Status:** Approved for Implementation
**Scope:** Info Panel (`DetailPanel.tsx`), Global State, & Visual System

## 1. Executive Summary & Core Philosophy
The Info Panel is the **narrative counterpart** to the Data Table's **metric density**.
*   **Table**: "What is happening *right now*?" (Operational velocity).
*   **Panel**: "Why is this happening?" (Contextual depth).

**Key Directive:** The Panel must be **Visually Rich**. It breaks the tabular grid with large typography, clear spacing, and "human" elements (names, comments) to reduce cognitive load during investigation.

---

## 2. Visual Specification: "The Flight Log"

### 2.1 Layout Architecture
The panel uses a **Stacked Card** layout within a fixed-width drawer (`400px` standard, `45%` on wide monitors).

```
[ Header: Identity & Context (Sticky) ]
   |-- Large Name (32px)
   |-- Location Pill (e.g., "Unit 4A")
   |-- Status Lozenge (Status-Colored Background)

[ Section: The Metric Grid ]
   |-- [ Scheduled 14:00 ] [ Actual 14:03 ]
   |-- [ Variance +3m    ] [ Officer Smith ]

[ Section: Field Notes (The "Log") ]
   |-- "Resident appeared agitated..." (Yellow/Gray block)
   |-- Officer Signature / Timestamp

[ Section: Supervisor Review ]
   |-- "Verified per check-in..." (Outlined Input/Read)

[ Section: History (Context) ]
   |-- [ Missed ] [ OK ] [ OK ] (Sparkline)
```

### 2.2 Typography & Tokens
*   **Name**: `text-xl` / `font-semibold` / `text-neutral-900`.
*   **Labels**: `text-xs` / `uppercase` / `tracking-wider` / `text-neutral-500`.
*   **Values**: `text-base` / `font-mono` (for times) / `text-neutral-700`.
*   **Note Text**: `text-sm` / `leading-relaxed` / `font-serif` (optional, or distinct sans) to denote narrative.

### 2.3 Motion Design
*   **Entrance**: `slide-in-right` (Spring physics: stiffness 300, damping 30).
*   **Backdrop**: `fade-in` (opacity 0 -> 0.4).
*   **Row Link**: When a row is clicked, the specific cell clicked (e.g., Status) should visually "connect" to the panel if possible, but standard drawer slide is MVP.

---

## 3. Data Architecture: Solved & Unified

### 3.1 The "Ghost Data" Fix
We must consolidate selection state to prevent View A's data bleeding into View B's panel.

**New Atom Structure (`src/desktop/atoms.ts`)**:

```typescript
// 1. The Single Source of Truth for selection
export type SelectedItem = {
  id: string;
  source: 'live' | 'historical';
};

export const activeDetailItemAtom = atom<SelectedItem | null>(null);

// 2. The Hydrator (Polymorphic Resolver)
export const activeDetailDataAtom = atom((get) => {
  const selection = get(activeDetailItemAtom);
  if (!selection) return null;

  if (selection.source === 'live') {
    // Search live mock/real data
    // *Critical*: Find row in `loadedLiveRows` (need to export this atom if not existing)
    // Fallback: Fetch by ID (async in future, synchronous mock for now)
  } else {
    // Search historical data
  }
});
```

### 3.2 Field Mapping
Since `LiveCheckRow` and `HistoricalCheck` differ, we normalize them for the panel:

```typescript
interface PanelData {
  residentName: string;
  location: string;
  status: 'missed' | 'due' | ...;
  timeScheduled: string;
  timeActual: string | null;
  officerName: string;
  officerComments: string; // The "Deep Dive" request
  supervisorComments: string;
  historyVariance: number[]; // For sparkline
}
```

---

## 4. Advanced Feature: "Officer Comments"
The user specifically requested looking at Officer Comments.
*   **Visual Treatment**: Displayed as a "Quote" block.
*   **Empty State**: If no comment, show "No field notes recorded" in low contrast italic.
*   **Action**: If the user is a Supervisor, they see an "Add Note" button (which opens the *Supervisor* note logic, keeping Officer notes immutable).

---

## 5. Interaction Model
1.  **Open**: Click anywhere on a row (except Checkbox/Actions).
2.  **Edit Supervisor Note**: Click the "Edit" pencil icon in the Supervisor section of the *Panel*. This opens the modal (reusing `SupervisorNoteModal`).
3.  **Close**: `Esc` key, specific "X" button, or clicking outside (backdrop).

---

## 6. Implementation Plan
1.  **Refactor Atoms**: Create `activeDetailItemAtom` in `atoms.ts`.
2.  **Update Views**:
    *   `LiveMonitorView`: On row click -> `set(activeDetailItemAtom, { id, source: 'live' })`.
    *   `HistoricalReviewView`: On row click -> `set(activeDetailItemAtom, { id, source: 'history' })`.
3.  **Refactor Panel**:
    *   Read from `activeDetailDataAtom` (derived).
    *   Implement new "Visual Specification" layout.
4.  **Verify**: Ensure no "Ghost Data" (clicking Live doesn't show old History check).
