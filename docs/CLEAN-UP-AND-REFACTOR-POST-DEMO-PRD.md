Of course. Here is a fully-defined Product Requirements Document (PRD) based on the comprehensive analysis and your specific feedback. This document is designed to be the single source of truth for a developer to reliably execute this "Project Health & Craftsmanship" initiative in one shot.

---

## **PRD: Project Health & Craftsmanship Refactor**

**Version:** 1.0
**Date:** 2023-10-27
**Author:** AI Agent

### 1. Overview

This document outlines a comprehensive refactoring initiative for the Safety Check PWA Prototype. The primary objective is to pay down technical debt, enforce established architectural principles, and elevate the overall UI craft and consistency. This initiative does not introduce new user-facing features but instead focuses on improving the codebase's health, maintainability, and adherence to its own high standards, ensuring a more robust foundation for future development.

### 2. Problem & Goals

The prototype has accumulated minor architectural inconsistencies and vestigial code during its rapid development. This creates maintenance overhead and deviates from the project's core principles.

**Problems:**
*   **Architectural Drift:** The distinction between generic `components` and feature-specific code has blurred.
*   **Redundant Code:** The application contains two separate, functionally identical components for manual check selection.
*   **Vestigial Code:** The codebase includes an entire unused feature (`Navigator`) and several obsolete CSS modules.
*   **Inconsistent UX:** The animation language is not unified, and key UI affordances (like scroll indicators) are not fully robust.
*   **Code Clarity:** File names and internal code comments are sometimes inaccurate or outdated.

**Goals:**
*   **Enforce Architectural Purity:** Strictly align the project structure with the "Component vs. Feature" rules in `README.md`.
*   **Consolidate to a Single Source of Truth:** Eliminate the duplicate manual selection UI, adhering to the DRY (Don't Repeat Yourself) principle.
*   **Reduce Codebase Clutter:** Purge all unused files and CSS related to the `Navigator` feature and other obsolete components.
*   **Establish a Unified Animation Principle:** Mandate the use of `tween`-based animations for a consistent, high-craft feel, and remove all `spring`-based animations.
*   **Elevate UI Craft:** Implement robust, bug-free UI affordances and ensure all interactions are polished and predictable.
*   **Improve Developer Experience:** Ensure all file names and path comments are accurate and logical.

### 3. Scope & Key Initiatives

**Key Initiatives:**
1.  **Consolidate Manual Selection Modals:** Refactor the two manual selection UIs (`SelectRoomModal` and `ManualSelectionView`) into a single, reusable, and correctly named component.
2.  **Eradicate `Navigator` Feature:** Completely remove all traces of the unused `Navigator` feature, including its CSS and any references.
3.  **Enforce Component vs. Feature Architecture:** Relocate feature-specific components (`PillToggle`, `FilterIndicatorChip`) from the generic `/components` directory to their appropriate `/features` slices.
4.  **Standardize Animation Language:** Replace all `spring` animations with the application's canonical `tween` animation to ensure a consistent, "rock-solid" feel.
5.  **Fix High-Craft UI Bugs:**
    *   Implement a robust scroll affordance shadow for the `CheckFormView` footer.
    *   Add a loading state to the schedule view when the facility context is changed post-login.
6.  **General Code & Naming Cleanup:** Correct all inaccurate file names and outdated file-path comments. Remove all other identified vestigial files and CSS rules.

**Out of Scope:**
*   Introducing any new user-facing features or workflows.
*   Making any significant changes to the core data model or state management logic in `appDataAtoms.ts`.
*   Performing a visual redesign of any component beyond what is necessary for consistency and bug fixing.

### 4. UX/UI Specification & Wireframes

#### 4.1. [CONSOLIDATED] Manual Check Selection Modal

The new `ManualCheckSelectionModal` will be the single UI for this workflow. It is a bottom-sheet modal that provides a searchable list of actionable checks.

*   **Interaction:**
    *   The modal is triggered from the "Manual Check" button in the App Side Menu and the "Select Manually" button in the Scan View.
    *   The user can type in the search input to filter the list by room or resident name.
    *   Tapping a room item immediately transitions the application to the `CheckFormView` for that check.
    *   Closing the modal returns the user to their previous context.

*   **ASCII Wireframe (`ManualCheckSelectionModal.tsx`):**
    ```
    +-------------------------------------------------+
    |                ( Bottom Sheet Handle )          |
    |                                                 |
    |                  Manual Check                   |
    |      Select a room or search by resident name.  |
    |      <-- margin-bottom: var(--spacing-3) -->    |
    |   +-------------------------------------------+ |
    |   | [Icon] [ SearchInput (integrated)       ] | |
    |   +-------------------------------------------+ |
    |      <-- margin-bottom: var(--spacing-3) -->    |
    |   +-------------------------------------------+ |
    |   | [ Room Item (uses .menu-item) ]           | |
    |   | [ Room Item (uses .menu-item) ]           | |
    |   | [ Room Item (uses .menu-item) ]           | |
    |   |               ...                         | |
    |   +-------------------------------------------+ |
    +-------------------------------------------------+
    Container uses `.bottom-sheet-content` styles.
    List has `gap: 2px` per `.menu.css`.
    ```

#### 4.2. Animation Principle: No Springs, Only Tweens

To ensure a consistently fast, fluid, and "rock-solid" UI, this project will no longer use `spring`-based physics for layout animations.

*   **The Contract:** All layout and transition animations driven by Framer Motion **must** use a `tween`. The canonical transition object, which provides the application's signature high-craft curve, is:
    ```typescript
    const viewTransition = {
      type: 'tween',
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    } as const;
    ```
*   **Implementation:** The `ScheduleListView` and `Toast` components will be refactored to use this `tween` pattern, removing all `spring` definitions.

### 5. Architecture & Implementation Plan

1.  **Modal Consolidation Strategy:**
    *   `SelectRoomModal.tsx` will be renamed to `ManualCheckSelectionModal.tsx` and will serve as the single source of truth.
    *   The global atom `isManualCheckModalOpenAtom` will control its visibility.
    *   The call site in `AppSideMenu.tsx` will be updated to use the new component name and atom.
    *   The call site in `ScanView.tsx` will be refactored to set the global `isManualCheckModalOpenAtom` to `true` instead of managing its own local state.
    *   `ManualSelectionView.tsx` will be deleted.

2.  **File Reorganization:**
    *   `PillToggle` and `FilterIndicatorChip` will be moved to their respective feature directories (`/features/Shell` and `/features/Schedule`). All import paths will be updated. This enforces the rule from `README.md` that `/components` is for *truly generic* primitives only.

3.  **Scroll Affordance Architecture (`CheckFormView.tsx`):**
    *   The footer shadow logic will be reimplemented using a `useLayoutEffect` hook.
    *   Inside the hook, a `ResizeObserver` will be attached to the form's main content element (`.formContent`).
    *   A single handler function, `checkShadowState`, will be created. It will calculate if the element's `scrollHeight` exceeds its `clientHeight`. This function will be called by the `ResizeObserver` and by an `onScroll` event listener.
    *   This robustly ensures the shadow state is correct on initial render, on content resize (e.g., keyboard opening on mobile), and on user scroll.

### 6. File Manifest

#### /src/
*   `App.tsx` `[MODIFIED]` (Update `SelectRoomModal` import to `ManualCheckSelectionModal`)
*   `AppShell.tsx` `[MODIFIED]` (Update `SelectRoomModal` import to `ManualCheckSelectionModal`)
*   `README.md` `[REFERENCE]`
*   `main.tsx` `[REFERENCE]`

#### /src/components/
*   `ActionMenu.tsx` `[DELETED]`
*   `FilterIndicatorChip.tsx` `[MOVED]`
*   `FilterIndicatorChip.module.css` `[MOVED]`
*   `PanelHeader.tsx` `[DELETED]`
*   `PillToggle.tsx` `[MOVED]`
*   `PillToggle.module.css` `[MOVED]`
*   `TextInput.module.css` `[DELETED]`
*   `Toast.tsx` `[MODIFIED]` (Replace spring animation with tween)
*   `ToastContainer.module.css` `[DELETED]`

#### /src/data/
*   `atoms.ts` `[MODIFIED]` (Update comments and potentially rename `isManualCheckModalOpenAtom` if desired for clarity, though current name is fine)
*   `AGENTS.md` `[MODIFIED]` (Update animation principle example)

#### /src/features/Overlays/
*   `FacilitySelectionModal.tsx` `[MODIFIED]` (Implement loading state on context change)
*   `ManualCheckSelectionModal.tsx` `[RENAMED]` (from `SelectRoomModal.tsx`)
*   `ManualCheckSelectionModal.module.css` `[RENAMED]` (from `SelectRoomModal.module.css`)
*   `ManualSelectionView.tsx` `[DELETED]`
*   `ManualSelectionView.module.css` `[DELETED]`
*   `SettingsOverlay.module.css` `[MODIFIED]` (Correct path comment)
*   `WriteNfcTagModal.module.css` `[MODIFIED]` (Correct path comment)

#### /src/features/Schedule/
*   `FilterIndicatorChip.tsx` `[MOVED]`
*   `FilterIndicatorChip.module.css` `[MOVED]`
*   `ScheduleLayouts.module.css` `[RENAMED]` (from `layouts.module.css`)
*   `ScheduleListView.tsx` `[MODIFIED]` (Update CSS import, replace spring animation)

#### /src/features/Session/
*   `LoginView.tsx` `[MODIFIED]` (Use global utility class for shortcut icon)
*   `LoginView.module.css` `[MODIFIED]` (Remove redundant CSS rule)

#### /src/features/Shell/
*   `AppSideMenu.tsx` `[MODIFIED]` (Update atom used to open manual check modal)
*   `PillToggle.tsx` `[MOVED]`
*   `PillToggle.module.css` `[MOVED]`

#### /src/features/Workflow/
*   `CheckFormView.tsx` `[MODIFIED]` (Implement robust scroll affordance logic)
*   `ScanView.tsx` `[MODIFIED]` (Refactor to use global atom for manual selection modal)

#### /src/styles/
*   `CSS-PRINCIPLES.md` `[REFERENCE]`
*   `index.css` `[MODIFIED]` (Remove import for `navigator.css`)
*   `navigator.css` `[DELETED]`

### 7. Unintended Consequences Check

*   **Global State:** The move from a local state in `ScanView` to the global `isManualCheckModalOpenAtom` centralizes control, which is an improvement. There are no other call sites for this atom, so the risk of conflict is negligible.
*   **Global Styles:** Removing `navigator.css` from the cascade layer in `index.css` will have no effect on existing components, as its classes were not in use. The consolidated `ManualCheckSelectionModal` will continue to use the robust global `.menu-item` styles, ensuring visual consistency.
*   **Component Composition:** The moved components (`PillToggle`, `FilterIndicatorChip`) are used in simple, isolated contexts. Relocating them poses no risk to component composition.

### 8. Risks & Mitigations

1.  **Risk:** The animation refactor from `spring` to `tween` could introduce visual artifacts or feel less fluid on certain devices.
    *   **Mitigation:** The specified `tween` curve is the project's established high-craft standard. The developer must perform targeted testing of the Schedule List and Toast notifications on both desktop and mobile (emulated) to confirm the animation is smooth and performant.

2.  **Risk:** Consolidating the manual selection modals might break the user flow originating from the `ScanView`.
    *   **Mitigation:** The developer must perform an end-to-end regression test of the "Can't Scan -> Select Manually" workflow to ensure it correctly opens the modal and transitions to the `CheckFormView` upon selection.

3.  **Risk:** Deleting numerous files could inadvertently remove a dependency that was missed during static analysis.
    *   **Mitigation:** After completing all changes, the developer must run the application and perform a full smoke test of all primary workflows (Login, Context Selection, Schedule Interaction, Scan-to-Save, Offline/Sync) to ensure no regressions have occurred.

### 9. Definition of Done

*   [ ] All code related to the `Navigator` feature has been removed from the codebase.
*   [ ] The `ManualSelectionView` component is deleted, and a single `ManualCheckSelectionModal` serves all manual selection workflows.
*   [ ] `PillToggle` and `FilterIndicatorChip` have been successfully moved to their respective `/features` directories.
*   [ ] No `spring` animations remain in the codebase; `ScheduleListView` and `Toast` use the standard `tween`.
*   [ ] The `CheckFormView` footer shadow correctly appears and disappears based on scrollability, not just scroll events.
*   [ ] The schedule view displays a loading state when the facility/unit is changed via the Context Switcher.
*   [ ] All specified files have been deleted, renamed, or moved, and all file-path comments are accurate.
*   [ ] The application builds and runs without any new errors or warnings.
*   [ ] All primary user workflows have been tested and are free of regressions.