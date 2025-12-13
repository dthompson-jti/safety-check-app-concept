Of course. Here is the detailed breakdown for PRD-03, focusing on bringing the core schedule screen to life with multiple, high-fidelity layouts.

---

## PRD-03: Home Screen & Schedule Layouts

### 1. Overview

This document outlines the requirements for transforming the placeholder dashboard into a functional, high-fidelity Safety Check Schedule. The core initiative is to design and build the primary UI component—the `CheckCard`—which displays all critical information for a single safety check. This card will then be used to construct three distinct, developer-toggleable layouts: a dense "List View," a spacious "Card View," and a status-driven "Priority View." This phase also introduces essential interactivity, such as sorting, and addresses performance concerns for long lists by integrating a virtualization library.

### 2. Problem & Goals

**Problem:** The current dashboard is a simple, unstyled list that does not meet the operational needs of an officer. It lacks crucial information like status, due times, and special classifications. Officers cannot sort the list to match their workflow, and a long list of checks would cause significant performance degradation on mobile devices. We need to build a robust and performant UI that presents this complex information in a clear, scannable, and actionable format.

**Goals:**

1.  **Build the `CheckCard` Component:** Create a reusable, high-fidelity component that serves as the single source of truth for displaying all information related to a single safety check, including room, resident, status, time until due, and special classifications (Req 20).
2.  **Implement Multiple Layouts:** Develop three distinct, toggleable layouts (`List`, `Card`, `Priority`) to explore different information densities and presentational styles.
3.  **Introduce Sorting:** Implement a user-facing control to sort the schedule by "Due Time" or a pre-configured "Walking Order" to support operational flexibility (Req 20).
4.  **Ensure Performance at Scale:** Integrate the `react-virtuoso` library to ensure the schedule list remains highly performant and responsive, even with hundreds of rooms.

### 3. Scope & Key Initiatives

**In Scope:**

*   **`CheckCard` Component:** A new, fully-styled component with variants for different states (e.g., Late, Due Soon).
*   **Layout Components:** Three new container components (`ListView`, `CardView`, `PriorityView`) that render lists of `CheckCard`s.
*   **List Virtualization:** Integration of `react-virtuoso` within each layout component.
*   **Sorting Logic:**
    *   A new `sortModeAtom` in the Jotai store.
    *   A derived `sortedChecksAtom` that computes the list order based on the current mode.
    *   A UI control (e.g., a `Select` component) in the header to change the `sortModeAtom`.
*   **Data Model Expansion:** The mock data in `appDataAtoms.ts` will be updated to include all necessary fields for the `CheckCard` (e.g., `dueDate`, `status`, `specialClassification`, `walkingOrderIndex`).
*   **Developer Toggles:** The `DevMenu` will be updated to allow switching between the three new layouts.

**Out of Scope:**

*   **Card Interactivity:** Tapping on a `CheckCard` will have no effect in this phase. The scanning workflow is deferred to PRD-04.
*   **Real-time Timers:** Initial implementation will display static due times. Live countdowns are a stretch goal for this PRD.
*   **API Integration:** All data remains mocked.

### 4. UX/UI Specification & Wireframes

The core of this PRD is the `CheckCard` component, which will be the building block for all layouts.

*   **`CheckCard` Component:** A self-contained card with a clear visual hierarchy.

    **ASCII Wireframe: `CheckCard.tsx`**
    ```
          +-------------------------------------------------+
          | | [ Room 104 ] - [ A. Jones ]               (SR)|  <-- Special Classification Icon
          | |                                               |
          | | DUE SOON - Due in 1:30                        |
          +-------------------------------------------------+
            ^
            Status Indicator (e.g., var(--surface-fg-warning-primary))
            Card BG: var(--surface-bg-primary)
            Border: 1px solid var(--surface-border-secondary)
    ```
    *   **Status Indicator:** A vertical bar on the left, color-coded by status (Red for Late, Yellow for Due Soon, Grey for Upcoming).
    *   **Primary Info:** Room and Resident name, in a heavier font weight.
    *   **Secondary Info:** Status text and time, in a smaller font size and secondary color.
    *   **Special Classification:** A distinct icon (e.g., `shield` or `priority_high`) in the top-right corner for at-risk residents.

*   **Layouts:**
    1.  **List View:** A dense, single-column list of `CheckCard`s with minimal vertical spacing between them. Optimized for maximum information density.
    2.  **Card View:** Adds more `padding` around the container and increased `gap` between each `CheckCard`, giving each item more breathing room.
    3.  **Priority View:** Groups the `CheckCard`s under distinct headers (`<h2>Overdue`, `<h2>Due Soon`, `<h2>Upcoming`).

*   **Sort Control:** A `Select` component placed in the application header.

    **ASCII Wireframe: Header with Sort Control**
    ```
          +-------------------------------------------------+
          | ≡  Schedule              Sort by: [Due Time ▼]  | <-- Select.tsx component
          +-------------------------------------------------+
    ```

### 5. Architecture & Implementation Plan

1.  **Data Flow & State (Jotai):**
    *   In `src/data/atoms.ts`, create the sorting atom:
        ```typescript
        export type SortMode = 'dueTime' | 'walkingOrder';
        export const sortModeAtom = atom<SortMode>('dueTime');
        ```
    *   In `src/data/appDataAtoms.ts`, create a derived atom for sorting:
        ```typescript
        export const sortedChecksAtom = atom((get) => {
          const checks = get(safetyChecksAtom);
          const mode = get(sortModeAtom);
          // Return a new, sorted array based on the mode
          // e.g., [...checks].sort(...)
        });
        ```
    *   For `PriorityView`, create another derived atom that groups the sorted checks into an object: `{ overdue: [], dueSoon: [], upcoming: [] }`.

2.  **Component Structure:**
    *   Create a new feature directory: `src/features/SafetyCheckSchedule`.
    *   Inside, create `CheckCard.tsx` and `CheckCard.module.css`. This component will receive a single `check` object as a prop.
    *   Create `ListView.tsx`, `CardView.tsx`, and `PriorityView.tsx`. Each will:
        *   Import the `Virtuoso` component from `react-virtuoso`.
        *   Use `useAtomValue` to get the `sortedChecksAtom` (or `groupedChecksAtom`).
        *   Pass the data to `<Virtuoso />`.
        *   Use the `itemContent` prop of `Virtuoso` to render a `<CheckCard />` for each item.
    *   Refactor `DashboardView.tsx` to be the "layout switcher" for this feature. It will read the developer layout toggle atom and render the appropriate layout component (`ListView`, `CardView`, or `PriorityView`).
    *   The header component (part of the layouts from PRD-01) will be modified to include the `Select` component for sorting, which will write to the `sortModeAtom`.

3.  **Package Installation:**
    *   Add `react-virtuoso` to the project: `npm install react-virtuoso`.

### 6. File Manifest

*   **src/features/SafetyCheckSchedule/ `[NEW DIRECTORY]`**
    *   `CheckCard.tsx` `[NEW]`
    *   `CheckCard.module.css` `[NEW]`
    *   `ListView.tsx` `[NEW]`
    *   `CardView.tsx` `[NEW]`
    *   `PriorityView.tsx` `[NEW]`
    *   `layouts.module.css` `[NEW]` (Shared styles for the layout containers)
*   **src/features/Dashboard/**
    *   `DashboardView.tsx` `[MODIFIED]` (Will now render one of the new layout components)
*   **src/layouts/** `[MODIFIED]`
    *   `ClassicLayout.tsx` (and others) will be modified to include the Sort `Select` in their header section.
*   **src/data/**
    *   `atoms.ts` `[MODIFIED]` (Add `sortModeAtom`)
    *   `appDataAtoms.ts` `[MODIFIED]` (Expand mock data, add `sortedChecksAtom`, `groupedChecksAtom`)
*   **src/components/**
    *   `DevMenu.tsx` `[MODIFIED]` (Add controls to switch between List, Card, and Priority views)
*   **package.json** `[MODIFIED]` (Add `react-virtuoso` dependency)

### 7. Unintended Consequences Check

*   **Data Model:** The mock data in `appDataAtoms.ts` must be thoroughly updated with realistic `dueDate` timestamps, `walkingOrderIndex` numbers, and `specialClassification` flags. Any missing data will cause the `CheckCard` to render incorrectly.
*   **Performance:** While `react-virtuoso` solves the rendering bottleneck, the sorting and grouping logic in the derived Jotai atoms will re-run whenever their dependencies change. For this prototype with mock data, it will be instant. In a real app, we would ensure this logic is efficient and does not perform heavy computations.
*   **CSS Specificity:** The new `CheckCard.module.css` styles should be well-encapsulated. We must ensure they don't unintentionally override styles on other components or get overridden by global styles.

### 8. Risks & Mitigations

1.  **Risk:** The grouped `PriorityView` might be complex to implement with `react-virtuoso`.
    *   **Mitigation:** The `react-virtuoso` library provides a `GroupedVirtuoso` component specifically for this use case. We will follow the official documentation. If this proves too time-consuming for the prototype, we will implement it as three separate `Virtuoso` lists, one for each status group.
2.  **Risk:** The `CheckCard` could become visually cluttered with too much information.
    *   **Mitigation:** We will adhere strictly to the visual hierarchy defined in the wireframe, using font size, weight, and color to guide the user's eye. The `Card View` layout is a direct mitigation, offering a less dense alternative if the `List View` feels too crowded during testing.
3.  **Risk:** Implementing live countdown timers could introduce performance issues if not managed correctly (i.e., creating a timer for every card).
    *   **Mitigation:** We will implement timers using a single, global "tick" atom. A single `setInterval` will update a `currentTimeAtom` every second. Each `CheckCard` will read this atom and derive its own "time remaining" display. This ensures only one timer is running for the entire application, not one per card.

### 9. Definition of Done

*   [ ] The `react-virtuoso` package has been added to the project.
*   [ ] The `CheckCard` component is built and styled, correctly displaying all required data fields (room, resident, status, time, special classification).
*   [ ] The three layout components (`ListView`, `CardView`, `PriorityView`) are created and render the check schedule.
*   [ ] The developer menu is updated with an option to switch between the three new schedule layouts.
*   [ ] A "Sort by" `Select` control is present in the header and correctly re-orders the list between "Due Time" and "Walking Order".
*   [ ] The schedule list scrolls smoothly with no performance degradation, confirming `react-virtuoso` is correctly implemented.
*   [ ] The mock data in `appDataAtoms.ts` has been expanded to support all `CheckCard` requirements.