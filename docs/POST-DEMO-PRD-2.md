### **PRD 2: Schedule Efficiency & Search**

#### **1. Overview**

This document outlines requirements to drastically improve user efficiency on the main schedule view. This will be achieved by implementing a powerful, high-craft search and filtering feature integrated directly into the main header. This sprint also introduces a skeleton loading state to improve the perceived performance of the initial data load.

#### **2. Problem & Goals**

The primary schedule view lacks efficient methods for finding specific rooms or residents, forcing users to scroll through potentially long lists. The initial load can also feel abrupt.

**Goals:**

1.  **Increase User Efficiency:** Reduce time-on-task by introducing a fast, real-time schedule search.
2.  **Improve Perceived Performance:** Implement a skeleton loading state to provide immediate feedback on app launch.
3.  **Maintain Context:** Ensure the header's status overview bar dynamically updates to reflect the results of the current search query.

#### **3. Scope & Key Initiatives**

**In Scope:**

*   **Initiative 1: Integrated Schedule Search**
    *   Add a search icon to the main header that, when tapped, animates the header to reveal a search input field.
    *   The Status Overview Bar will animate out, and the search input will animate in.
    *   Implement real-time filtering of the schedule list based on the search query.
*   **Initiative 2: Dynamic Status Overview**
    *   Modify the header's Status Overview Bar to display counts for "Late", "Due Soon", "Completed", and "Queued" (for offline mode).
    *   Ensure these counts dynamically update to reflect the currently visible (filtered) list of checks.
*   **Initiative 3: Skeleton Loading State**
    *   Implement a skeleton UI that mimics the layout of the schedule cards/list items, which will be displayed while the initial schedule data is being fetched.

**Out of Scope for this Iteration:**

*   The ability to search across all units (search is scoped to the selected unit).
*   Saving recent searches.

#### **4. UX/UI Specification & Wireframes**

**4.1. Schedule Search Bar Animation**

*   **Interaction:** User taps `search` icon. The `StatusOverviewBar` slides up and fades out. The header container expands vertically. The search input and its container fade/slide in from the top. Tapping `close` reverses the animation.
*   **Styling:** Header expansion will use `Framer Motion`'s `layout` property. Fades will use `AnimatePresence`.

*   **State 1: Before Search**
    ```plaintext
    +--------------------------------------------------+
    | [menu]    (Time | Route)    [+] [search]         |
    |--------------------------------------------------|
    | [Status Overview Bar]                            | // Slides up and out
    +--------------------------------------------------+
    ```
*   **State 2: After Tapping Search Icon**
    ```plaintext
    +--------------------------------------------------+
    | [menu]    (Time | Route)    [+] [close]          |
    |--------------------------------------------------|
    | [ PADDING: var(--spacing-2) ]                    |
    |  +--------------------------------------------+  | // Slides down and in
    |  | [search_icon] Search rooms or residents... |  |
    |  +--------------------------------------------+  |
    | [ PADDING: var(--spacing-4) ]                    |
    +--------------------------------------------------+
    ```

#### **5. Architecture & Implementation Plan**

*   **State Management (Jotai):**
    *   A new atom, `scheduleSearchQueryAtom = atom('')`, will store the search input value.
    *   A new atom, `isScheduleLoadingAtom = atom(true)`, will control the skeleton state.
    *   The primary derived atoms (`timeSortedChecksAtom`, `routeSortedChecksAtom`) will be modified to filter the master list based on both the selected unit (from PRD 1) and the `scheduleSearchQueryAtom`.
    *   `statusCountsAtom` will be modified to derive its counts from this newly filtered list.
*   **Component Architecture:**
    *   **[NEW] `<ScheduleSearchBar>`:** A new component rendered inside `FloatingHeader` containing the search UI.
    *   **[NEW] `<CheckCardSkeleton>` / `<CheckListItemSkeleton>`:** New components for the loading state.
    *   **[MODIFIED] `FloatingHeader.tsx`:** Will be updated to include the search icon and orchestrate the animation between the status bar and search bar.
    *   **[MODIFIED] `ScheduleListView.tsx`:** Will be updated to conditionally render the skeleton UI based on `isScheduleLoadingAtom`.

#### **6. File Manifest**

*   **/src/features/Shell**
    *   `[MODIFIED]` FloatingHeader.tsx
    *   `[NEW]` ScheduleSearchBar.tsx
*   **/src/features/Schedule**
    *   `[MODIFIED]` ScheduleListView.tsx
    *   `[NEW]` CheckCardSkeleton.tsx
*   **/src/data**
    *   `[MODIFIED]` atoms.ts *(Add search and loading atoms)*
    *   `[MODIFIED]` appDataAtoms.ts *(Modify derived atoms for filtering)*
*   **/doc**
    *   `[REFERENCE]` README.md, CSS-PRINCIPLES.md

#### **7. Unintended Consequences Check**

*   **`AppShell.tsx`:** The `useLayoutEffect` that sets `--header-height` must correctly handle the animated height change of the `FloatingHeader` to prevent content from being obscured during the search animation.

#### **8. Risks & Mitigations**

*   **Risk:** The animated expansion of the header could cause layout shifts.
    *   **Mitigation:** We will use `Framer Motion`'s `layout` property on the header container, which is specifically designed to handle this smoothly.

#### **9. Definition of Done**

*   [ ] A search icon in the header toggles the visibility of a search bar.
*   [ ] The transition between the status bar and search bar is a smooth slide/fade animation.
*   [ ] The schedule list filters in real-time as the user types.
*   [ ] The Status Overview Bar correctly reflects counts for the filtered results.
*   [ ] A skeleton loading UI is displayed while the initial schedule is being fetched.

---

