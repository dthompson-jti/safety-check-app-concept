# TICKET-InfoPanel-DevGuide: Info Panel "Flight Log" Implementation

**Priority:** High  
**Role:** Frontend Developer (Junior/Mid)  
**Status:** In Progress (Handover)  
**Feature:** Detail Panel / Info Panel

## 1. Objective
Refine the "Info Panel" (also known as the "Flight Log") to be a production-ready, interactive component. It currently exists as a static visual implementation. The goal is to add **smooth entry/exit animations**, **robust data hydration**, and **supervisor interaction** capabilities.

## 2. Context & Design Philosophy
The Info Panel is not just a data dump; it is a **narrative document** of the safety check.
-   **Visual Metaphor:** "Flight Log" or "Medical Chart". It should feel authoritative and structured.
-   **Key Elements:** High-contrast header, structured metrics grid, and a distinct "Field Note" section for officer comments.
-   **Interaction:** It lives as a slide-over panel on the right side of the screen, creating a dedicated context without leaving the table view.

## 3. Current Implementation Status
*   **Component:** `src/desktop/components/DetailPanel.tsx`
*   **Styles:** `src/desktop/components/DetailPanel.module.css`
*   **State:** Controlled by `activeDetailRecordAtom` in `src/desktop/atoms.ts`.

**What Works:**
*   [x] Basic visual layout ("Flight Log" design).
*   [x] Unified selection state (resolves "Ghost Data" issue).
*   [x] CSS Modules implementation with some design tokens.

**What is Missing (Your Tasks):**
*   [ ] **Animation:** No entry/exit transitions. The panel jumps in/out.
*   [ ] **Data Hydration:** Currently relies on the table pushing data. Needs to self-refresh or handle "stale" data.
*   [ ] **Supervisor Interactions:** The "Edit Note" button is visually present but unchecked/unwired.
*   [ ] **Token Audit:** Some colors might be hardcoded or using non-semantic tokens.

---

## 4. Technical Specifications & Guidelines

### A. State Management
We use **Jotai** for global state.
-   **`activeDetailRecordAtom`**: Holds `PanelData | null`.
    -   If `null`: Panel is closed.
    -   If `object`: Panel is open with that data.
-   **Action:** When a user clicks a row in `DataTable`, it sets this atom.

### B. Styling & Design Tokens
You **MUST** adhere to `docs/STRATEGY-CSS-Principles.md`.
-   **Typography:** Use variables like `var(--font-size-md)`, `var(--font-weight-medium)`.
-   **Colors:** Use semantic tokens only.
    -   Background: `var(--surface-bg-primary)`
    -   Border: `var(--surface-border-secondary)`
    -   Text: `var(--surface-fg-primary)` / `secondary` / `tertiary`
-   **Shadows:** Use `var(--surface-shadow-xl)` for the panel elevation.

### C. Motion (Framer Motion)
We use `framer-motion` for all UI animations.
-   **Entry:** Slide from right (`x: '100%'` -> `x: 0`).
-   **Curve:** `cubic-bezier(0.16, 1, 0.3, 1)` (The "Standard Fast Curve").
-   **Duration:** ~0.3s.

---

## 5. Implementation Tasks (Step-by-Step)

### Task 1: animation-integration
**Goal:** Make the panel slide in smoothly without shifting layout.
1.  Wrap the `DetailPanel` return logic in `<AnimatePresence>`.
2.  Convert the outer `div` to `motion.div`.
3.  Define variants:
    ```typescript
    const panelVariants = {
      closed: { x: "100%", opacity: 0 },
      open: { x: 0, opacity: 1 }
    };
    ```
4.  **Critical:** Ensure the clickable overlay (backdrop) is optional/handled. Currently, we might strictly use a slide-over without a backdrop, or a transparent one to capture "click outside" to close. *Recommendation: Implement a click-outside listener to set atom to null.*

### Task 2: data-hydration-logic
**Goal:** Ensure the panel always shows the latest data.
1.  Currently, `DataTable` pushes the *row data* into the atom.
2.  **Upgrade:** The atom should probably just store the `ID`. The Panel should use a custom hook (e.g., `useResidentDetail(id)`) to fetch the latest `PanelData`.
    *   *Interim Step:* If fetching not ready, ensure the `PanelData` types fully match the real data shape from `src/types.ts`.

### Task 3: supervisor-note-wiring
**Goal:** Allow supervisors to edit notes specific to that check.
1.  Locate the "Supervisor Review" section in `DetailPanel.tsx`.
2.  Wire the `onClick` of the "Edit Note" / "Add Note" button.
3.  Action: It should trigger the `supervisorNoteModalAtom` (already imported).
    ```typescript
    const setModal = useSetAtom(supervisorNoteModalAtom);
    // ...
    setModal({ isOpen: true, selectedIds: [record.id] });
    ```
4.  Verify that saving the note in the modal updates the view (this might require the Data Table to refresh).

### Task 4: visual-qa
**Goal:** Polish the specs.
1.  **Check Typography:** Are we using `var(--font-primary)`?
2.  **Check Spacing:** Are margins using `var(--spacing-4)` etc?
3.  **Check Dark Mode:** Toggle the theme. Does the panel background `var(--surface-bg-primary)` correctly switch to dark? Do the text colors invert properly?

## 6. Resources
-   `docs/STRATEGY-CSS-Principles.md`: **Read this first.**
-   `src/desktop/components/DetailPanel.module.css`: Existing styles.
-   `src/desktop/components/DataTable.tsx`: How the panel is triggered (search `onRowClick`).

## 7. Definition of Done
-   [ ] Panel slides in/out smoothly.
-   [ ] Clicking "Edit Note" opens the Supervisor Modal for the correct resident.
-   [ ] Dark mode styling is broken in 0 places.
-   [ ] Code is linted (`npm run lint`).
