Of course. Here is the updated, concise specification for Phase 1 and Phase 2, incorporating your feedback to use a popover menu for the primary action button.

---

### Phase 1: Core Experience & Information Architecture

This phase focuses on foundational enhancements to the primary schedule view, improving usability, information clarity, and user feedback.

*   **1. Interactive Header with Status Filters**
    *   **Requirement:** The main header will be replaced with a persistent status filter bar. It must display chips for **Late**, **Due Soon**, **Due**, and **Completed** checks, each with a live count. Tapping a chip filters the schedule list accordingly.
    *   **Implementation Spec:**
        *   A new `scheduleFilterAtom` will manage the currently active filter state.
        *   Derived Jotai atoms will be created to efficiently calculate status counts and provide the filtered list of checks.
        *   A new `StatusFilterChips.tsx` component will be created and integrated into `FloatingHeader.tsx`.
        *   The count numbers within the chips will use `Framer Motion` to animate changes, providing clear visual feedback.

*   **2. In-Place & Haptic Feedback System**
    *   **Requirement:** Replace the primary reliance on success toasts with immediate, in-place visual feedback. Introduce optional haptic feedback for key events.
    *   **Implementation Spec:**
        *   **In-Place Feedback:** A new `recentlyCompletedCheckIdAtom` will be created. When a check is saved, the corresponding `CheckCard.tsx` will read this atom and display a transient success state (e.g., "Completed" badge with icon) for 2 seconds before the list re-sorts.
        *   **Haptic Feedback:** A new `useHaptics.ts` hook will be created to provide standardized vibration patterns. A new `hapticsEnabledAtom` will make this feature configurable via a setting (to be built in Phase 3). The hook will be triggered by key events, such as a check's status changing to 'due-soon'.

*   **3. Check Card Layout Refinement**
    *   **Requirement:** The layout of the `CheckCard` component will be polished for better visual consistency.
    *   **Implementation Spec:**
        *   The time/countdown display will be vertically anchored to the bottom of the card using Flexbox properties in `CheckCard.module.css`.
        *   The time display's font color for cards in the default "Due" (`pending`) state will be updated to `var(--surface-fg-tertiary)` for a more subtle appearance.

*   **4. Mock Data Curation**
    *   **Requirement:** The application's seed data must be curated to use a standardized set of fictional references.
    *   **Implementation Spec:**
        *   The `mockResidents` and `mockChecks` arrays in `src/data/appDataAtoms.ts` will be modified.
        *   **Keep:** *Aliens*, *The Expanse*, *The Witcher*, *John Wick*, *Terminator*, *Dune*.
        *   **Add:** *Harry Potter*, *Star Wars*.
        *   **Add Names:** The provided list of new character names will be added and distributed among the approved themes.

---

### Phase 2: Workflow Enhancements & User Customization

This phase builds upon the refined core experience by adding powerful new workflow actions and user customization options.

*   **1. Primary Action Button: Popover Menu**
    *   **Requirement:** The main Floating Action Button (FAB) will be changed to a `+` icon. Tapping it will open a popover menu presenting two distinct actions.
    *   **Implementation Spec:**
        *   The `FloatingFooter.tsx` component will be refactored. The main button will become an icon-only button with a `+` symbol.
        *   This button will be wrapped in the existing `Popover.tsx` component.
        *   The popover's content will be an `ActionMenu.tsx` component configured with two items: **"Add Supplemental Check"** and **"Write NFC Tag"**.

*   **2. High-Visibility Offline Banner**
    *   **Requirement:** Implement a top-most application banner to clearly communicate network connection status, including "retrying" states and a manual retry option.
    *   **Implementation Spec:**
        *   A new `OfflineBanner.tsx` component will be created.
        *   It will be rendered in `AppShell.tsx` above the `MainLayout` to ensure it is always visible at the top, pushing other content down.
        *   The banner's visibility and content will be driven by the `connectionStatusAtom`. It will use `Framer Motion` to slide into view.
        *   A `'syncing'` state will be added to the `ConnectionStatus` type to handle the visual state during a retry attempt.

*   **3. Reactivate List/Card View Toggle**
    *   **Requirement:** Re-implement the user setting to switch between the default "Card View" and a more compact "List View" for the main schedule.
    *   **Implementation Spec:**
        *   A new `scheduleViewModeAtom` (`'card' | 'list'`) will be created.
        *   `ScheduleListView.tsx` will be refactored to read this atom and conditionally render either the existing `CheckCard.tsx` or a new, more compact `CheckListItem.tsx` component.
        *   The setting toggle to control this atom will be implemented in the deferred Phase 3 Settings Panel.