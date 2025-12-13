Of course. Here is the detailed breakdown for PRD-01, following your specified format and incorporating the provided layout options.

---

## PRD-01: Application Foundation & Shell

### 1. Overview

This Product Requirements Document outlines the foundational work required to build the main "shell" of the Safety Check PWA. The primary goal is to establish the core application structure, including a header, a main content area, and a flexible navigation system. A key deliverable for this phase is a developer-controlled mechanism to toggle between four distinct, high-level layout and navigation patterns. This will enable rapid prototyping and user experience testing for the home screen before committing to a single design. This phase will also establish the basic data types and mock data stores needed to populate the UI in subsequent phases.

### 2. Problem & Goals

**Problem:** The current application scaffold is a generic placeholder. It lacks a defined structure for navigation, content display, and primary actions. Before building specific features like the check schedule or scanning workflow, we must create a robust and flexible application container. We also need an efficient way to evaluate different fundamental navigation paradigms (e.g., FAB vs. Bottom Bar) without costly refactoring.

**Goals:**

1.  **Implement the Core App Shell:** Create the main application container with distinct regions for a header, a dynamic content view, and a bottom navigation area.
2.  **Enable Layout Prototyping:** Implement a developer-facing menu to switch the entire application's layout between the four specified patterns (Classic, Notched, Overlapping, Minimalist).
3.  **Establish Data Foundation:** Define the core TypeScript types for application data (e.g., `SafetyCheck`, `Resident`) and create a mock data store using Jotai atoms to simulate a live schedule.
4.  **Integrate Global Services:** Ensure the global toast notification system is wired up and available for providing user feedback throughout the app.

### 3. Scope & Key Initiatives

**In Scope:**

*   **App Shell Implementation:** A top-level component that manages the overall screen structure.
*   **Layout Components:** Four new, distinct layout components, each corresponding to a specified design pattern.
*   **Layout Switcher:** A developer-only `DevMenu` component (likely a popover) to change the active layout.
*   **State Management:**
    *   A new Jotai atom (`layoutModeAtom`) to manage the currently active layout.
    *   Modification of `appDataAtoms.ts` to include a list of mock `SafetyCheck` items.
*   **Data Types:** Creation of a `src/types.ts` file defining core interfaces.
*   **Basic Content Display:** The `DashboardView` will be updated to render a simple, unstyled list of the mock data to verify the data flow.

**Out of Scope:**

*   **Real Data or API Integration:** All data will be static and mocked within the application.
*   **Authentication:** The login/logout flow is deferred to PRD-02.
*   **Detailed Card Design:** The list items in `DashboardView` will be simple placeholders. The detailed design of check cards is a separate PRD.
*   **Scanning Functionality:** The Scan FAB will be visually present but will not trigger any camera functionality yet.

### 4. UX/UI Specification & Wireframes

The core interaction involves a persistent structure (header, content, nav) that adapts its form based on the selected layout mode.

*   **App Shell:** A vertical flex container (`flex-direction: column`) that fills the viewport (`100vh`).
    *   **Header:** A simple, static header containing the application title and a developer menu trigger icon.
    *   **Main Content:** A flexible-growth area (`flex: 1`) with vertical scrolling (`overflow-y: auto`) that will render the active view (e.g., `DashboardView`).
    *   **Navigation Area:** The bottom portion of the screen, which will be occupied by the navigation components of the active layout.

*   **Developer Menu:** A `DevMenu` will be triggered by a "settings" icon in the main header. It will use the existing `Popover` and `Select` (or a similar menu) component to present the layout options.

    **ASCII Wireframe: `DevMenu` Popover**
    ```
          +----------------------------------+
          |  Developer Options               |
          |----------------------------------|
          | (o) Classic (FAB Bottom Right)   |  <-- Uses .menu-item styles
          | ( ) Notched Bar                  |
          | ( ) Overlapping Bar              |
          | ( ) Minimalist Bar               |
          +----------------------------------+
          Container uses `.menu-popover` styles
          with `padding: var(--spacing-1)`
    ```

*   **Layout Implementations:** The four specified layouts will be implemented as self-contained components. The FAB, where present, will be a `Button` component with `variant="primary"` and `size="m"`.

### 5. Architecture & Implementation Plan

1.  **State Management (Jotai):**
    *   In `src/data/atoms.ts`, create a new atom:
        ```typescript
        export type LayoutMode = 'classic' | 'notched' | 'overlapping' | 'minimalist';
        export const layoutModeAtom = atom<LayoutMode>('classic');
        ```
    *   Modify `src/data/appDataAtoms.ts` to include a list of mock `SafetyCheck` objects, adhering to the `SafetyCheck` interface.
    *   Modify `src/types.ts` to define the `SafetyCheck` and `Resident` interfaces based on the PRD.

2.  **Component Structure:**
    *   Create a new directory: `src/layouts`.
    *   Inside `src/layouts`, create four new components: `ClassicLayout.tsx`, `NotchedLayout.tsx`, `OverlappingLayout.tsx`, and `MinimalistLayout.tsx`. Each will be responsible for its unique HTML structure and styling (using CSS Modules). They will all render `{children}` inside their main content area.
    *   Modify `src/App.tsx` to read the `layoutModeAtom`. It will use a `switch` statement to render the appropriate layout component, passing the main view content as a child.
        ```tsx
        // src/App.tsx (logic sketch)
        const layoutMode = useAtomValue(layoutModeAtom);
        const mainContent = <DashboardView />;

        switch (layoutMode) {
          case 'classic': return <ClassicLayout>{mainContent}</ClassicLayout>;
          case 'notched': return <NotchedLayout>{mainContent}</NotchedLayout>;
          // ...etc.
        }
        ```
    *   Create a new component `src/components/DevMenu.tsx`. This will use our `Popover` and contain a control (like `Select` or a custom radio group) to update the `layoutModeAtom`.
    *   Modify `DashboardView.tsx` to consume `safetyChecksAtom` and render a basic `<ul>` of the check names.
    *   The existing `NavBar.tsx` will be reused by the layouts that feature a bottom navigation bar.

### 6. File Manifest

*   **src/layouts/ `[NEW DIRECTORY]`**
    *   `ClassicLayout.tsx` `[NEW]`
    *   `ClassicLayout.module.css` `[NEW]`
    *   `NotchedLayout.tsx` `[NEW]`
    *   `NotchedLayout.module.css` `[NEW]`
    *   `OverlappingLayout.tsx` `[NEW]`
    *   `OverlappingLayout.module.css` `[NEW]`
    *   `MinimalistLayout.tsx` `[NEW]`
    *   `MinimalistLayout.module.css` `[NEW]`
*   **src/components/**
    *   `DevMenu.tsx` `[NEW]`
    *   `DevMenu.module.css` `[NEW]`
    *   `Button.tsx` `[REFERENCE]`
    *   `Popover.tsx` `[REFERENCE]`
*   **src/features/Dashboard/**
    *   `DashboardView.tsx` `[MODIFIED]`
*   **src/features/NavBar/**
    *   `NavBar.tsx` `[REFERENCE]`
*   **src/data/**
    *   `atoms.ts` `[MODIFIED]` (Add `layoutModeAtom`)
    *   `appDataAtoms.ts` `[MODIFIED]` (Add mock `SafetyCheck` data)
*   **src/**
    *   `App.tsx` `[MODIFIED]`
    *   `types.ts` `[MODIFIED]` (Add `SafetyCheck`, `Resident` types)
*   **Root/**
    *   `README.md` `[REFERENCE]`
    *   `CSS-PRINCIPLES.md` `[REFERENCE]`

### 7. Unintended Consequences Check

*   **Global Styles (`index.css`):** The new layout components should be self-contained and rely on CSS Modules. However, we must ensure their root elements do not conflict with global `body` or `div` styles. The flexbox structure of `App.tsx` should be robust enough to contain them.
*   **Shared Components (`NavBar.tsx`, `Button.tsx`):** The `NavBar` component may need minor style adjustments to accommodate the "notch" or "overlap" in layouts 2 and 3. The FAB implementation will rely on the `Button` component; we must verify it can be styled effectively with `position: fixed` and appropriate z-indexing.
*   **Mobile Viewport Behavior:** Special attention must be paid to CSS safe areas (`env(safe-area-inset-bottom)`) for all bottom-aligned elements (nav bars, FABs) to prevent them from being obscured by the home indicator on iOS devices.

### 8. Risks & Mitigations

1.  **Risk:** CSS for notched and overlapping navigation bars can be complex and brittle, especially across different device sizes.
    *   **Mitigation:** Each layout will have its own dedicated CSS Module to prevent style leakage. We will use modern CSS techniques like `clip-path` for the notch and carefully manage `z-index` for the overlap, testing thoroughly on mobile aspect ratios.
2.  **Risk:** The Floating Action Button (FAB) can obscure the last item in a list on small screens.
    *   **Mitigation:** The main scrollable content area will have `padding-bottom` applied that is equal to or greater than the height of the FAB and any bottom navigation bar, ensuring there is always space to scroll the last item into view.
3.  **Risk:** The developer menu, if not implemented carefully, could interfere with the main application UI.
    *   **Mitigation:** The menu will be built using the existing high-craft `Popover` component, which already handles stacking context (`z-index`) and dismissal logic properly. It will only be included in development builds (though for this prototype, it will be always on).

### 9. Definition of Done

*   [ ] The `layoutModeAtom` and mock `SafetyCheck` data are defined and available in the Jotai store.
*   [ ] The `App.tsx` component correctly renders one of four new layout components based on the `layoutModeAtom`.
*   [ ] The four layout components (`Classic`, `Notched`, `Overlapping`, `Minimalist`) are created and visually match their respective wireframes.
*   [ ] A `DevMenu` component is present in the main header, allowing the user to select and switch between the four layouts in real-time.
*   [ ] The `DashboardView` successfully subscribes to the mock data and displays a basic list of safety checks.
*   [ ] All bottom-aligned UI elements (FABs, Nav Bars) correctly respect mobile safe areas.
*   [ ] The global `ToastContainer` is present in the app root and ready for use.