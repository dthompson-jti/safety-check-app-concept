Of course. Based on our detailed discussion and your clarifications, I have performed a deeper architectural analysis and created a final, comprehensive Product Requirements Document. This document evaluates multiple options where appropriate and presents a definitive, high-craft path forward.

---

## **PRD: Gesture-Driven UI & Navigation Overhaul (v2 Final)**

### 1. Overview

This initiative will fundamentally enhance the application's user experience by replacing static, tap-based navigation with a fluid, gesture-driven model. We will refactor the core application shell into a **"Workspace Carousel,"** a superior architectural pattern that unifies the side menu and dashboard views into a single, cohesive navigation paradigm. Users will swipe horizontally to pan between these primary workspaces. Concurrently, we will overhaul the toast notification system to be more robust, context-aware, and interactive, featuring a high-craft **"drag-to-dismiss"** gesture and dynamic positioning that respects the main application footer.

### 2. Problem & Goals

**Problem Statement:**
1.  **Fragmented Navigation:** The current app uses two distinct navigation models: a tap-based overlay for the main side menu and a tap-based toggle for dashboard sorting. This is architecturally dissonant and creates a less-than-seamless user flow.
2.  **Static Interactions:** The UI relies exclusively on taps, feeling static and underutilizing the capabilities of modern mobile devices. This detracts from the project's "High-Craft UI" principle.
3.  **Passive & Obstructive Notifications:** Toasts cannot be manually dismissed and their fixed position can be obscured by the main footer. The system can also be "noisy," showing redundant messages during the scanning workflow.
4.  **Codebase Clutter:** The project contains vestigial, unused components from previous layout explorations (`CardView`, `PriorityView`), increasing maintenance overhead.

**Goals:**
*   **Architectural Unification:** Implement the Workspace Carousel model to create a single, intuitive, gesture-based navigation paradigm for the entire application.
*   **Improve UX Fluidity:** Reduce the number of taps required for primary navigation by 75% (from tap-menu -> tap-view to a single swipe).
*   **Enhance "High-Craft" Feel:** Introduce smooth, physics-based animations for all gesture interactions, ensuring a premium user experience.
*   **Increase User Control & Awareness:** Empower users to dismiss notifications instantly and ensure toasts never obstruct critical UI elements like the main action footer.
*   **Improve State Management & Code Health:** Simplify the global state by consolidating multiple UI atoms into a single source of truth and eliminate dead code.

### 3. Scope & Key Initiatives

**In Scope:**
*   **Initiative 1: Workspace Carousel Architecture:**
    *   Implement a three-panel horizontal carousel: Side Menu (Panel 1), Time-Sorted Dashboard (Panel 2), and Route-Sorted Dashboard (Panel 3).
    *   The carousel will be navigable via a horizontal swipe/drag gesture.
    *   The main app header and footer will persist when navigating between Panels 2 and 3 but will animate out of view when Panel 1 (Side Menu) is active.
*   **Initiative 2: Intelligent & Draggable Toasts:**
    *   Refactor the toast system to use a single, centralized `Toast.Provider`.
    *   Implement a "drag-right-to-dismiss" gesture for all toast notifications using physics-based animations.
    *   Implement a dynamic positioning system where toasts appear above the `FloatingFooter` if it's visible, or at the bottom of the screen if it's not.
    *   Add logic to prevent duplicate "failure" toasts from appearing in rapid succession.
*   **Initiative 3: Code & State Simplification:**
    *   Remove the obsolete `CardView.tsx` and `PriorityView.tsx` components.
    *   Deprecate and remove the `isSideMenuOpenAtom` and `scheduleViewAtom`, consolidating their logic into a new, single `activeViewIndexAtom`.

**Out of Scope:**
*   Adding new functionality or content to the `SideMenu` itself.
*   Implementing gestures other than horizontal dragging.
*   A "reduced motion" accessibility setting.

### 4. UX/UI Specification & Wireframes

#### **Workspace Carousel**

The main app view is a viewport over a three-panel "film strip." Swiping pans between views. The `PillToggle` becomes a passive indicator, not an active controller.

**ASCII Wireframe: Carousel Interaction & Layout**

```
// CONCEPT: A three-panel film strip slides within a fixed viewport.

   [Panel 1: Side Menu]   [Panel 2: Dashboard/Time]   [Panel 3: Dashboard/Route]
+------------------------+---------------------------+--------------------------+
|                        |                           |                          |
| Nav Items...           | Check List (Time Sort)    | Check List (Route Sort)  |
|                        |                           |                          |
+------------------------+---------------------------+--------------------------+
       ^
       |
// The user's screen is a viewport looking at one panel at a time.
// Swiping left on Panel 2 reveals Panel 3.

// UI STATE: Viewing Dashboard/Time (Panel 2)
+------------------------------------------+
| [Btn]   (Time)  Route          [+ Btn]   |  <-- FloatingHeader
|------------------------------------------|
|  +----------------------+                |
|  | Check Card (Time 1)  |  <-- SWIPE L/R |
|  +----------------------+                |
+------------------------------------------+
|    [      Scan Button      ]             |  <-- FloatingFooter
+------------------------------------------+
```
*   **Interaction:** A firm horizontal swipe "snaps" the carousel. A slow drag pans the view 1:1, with the `PillToggle`'s active indicator moving in sync.
*   **Styling:** Side Menu panel uses `background-color: var(--surface-bg-primary)`. Dashboard panels use `background-color: var(--surface-bg-secondary)`.

#### **Dynamically Positioned Draggable Toast**

Toasts appear above the footer (if present) and are dismissible.

**ASCII Wireframe: Toast Positioning & Dismissal**

```
// CASE 1: Footer is visible.
+------------------------------------------+
|                                          |
|   +----------------------------------+   | <-- Toast uses `calc(var(--footer-height) + var(--spacing-4))`
|   | [icon] Room 101 Scan successful. |   |
|   +----------------------------------+   |
|                                          |
|    [      Scan Button      ]             | <-- Footer sets `--footer-height`
+------------------------------------------+

     --- User Drags Right on Toast --->

// STATE: During Dismissal Drag
+------------------------------------------+
|                                          |
|        +---------------------------+     | <-- Opacity: var(--opacity-50)
|        | [icon] Room 101 Scan succ |     |     Transform: translateX(80px)
|        +---------------------------+     |
+------------------------------------------+
```
*   **Animation:** Dismissal uses a `spring` animation from Framer Motion for a fluid feel.

### 5. Architecture & Implementation Plan

#### **Architectural Decisions & Rationale**

1.  **Navigation Model: Workspace Carousel (Chosen)**
    *   **Evaluation:** We evaluated three models: a standard bottom Tab Bar, retaining the current hybrid Overlay Menu + Toggle, and the Workspace Carousel.
    *   **Rationale:** The Tab Bar conflicts with the primary "Scan" button's ergonomic position. The hybrid model is architecturally inconsistent. The **Workspace Carousel** was chosen because it unifies all primary navigation into a single, cohesive, gesture-driven paradigm. It elegantly solves the "push-aside" side menu requirement by treating the menu as just another workspace panel, which is a significant architectural simplification.

2.  **State Management: Single Source of Truth (Chosen)**
    *   **Evaluation:** The previous state involved multiple atoms (`isSideMenuOpenAtom`, `scheduleViewAtom`) to manage different parts of the UI.
    *   **Rationale:** We will refactor to a **single `activeViewIndexAtom` (value: 0, 1, or 2)**. This atom becomes the sole source of truth for the application's primary navigation state. The dashboard's sort order and the side menu's visibility will be *derived* from this atom's value. This eliminates redundant state, prevents sync issues, and simplifies the data flow.

3.  **Component Communication: CSS Custom Property Contract (Chosen)**
    *   **Evaluation:** To solve the toast positioning problem, we considered React Context, a Jotai atom, or a CSS-based solution.
    *   **Rationale:** Both Context and Jotai would introduce unnecessary re-renders of the `ToastContainer` every time the footer's state changed. The **CSS Custom Property Contract** is architecturally superior. The `FloatingFooter` broadcasts its height via a CSS variable (`--footer-height`), and the `ToastContainer`'s CSS consumes it. This is a fully decoupled, highly performant solution that leverages the browser's rendering engine and has zero impact on the React component lifecycle.

#### **Technical Implementation Plan**

*   **Technology:** We will exclusively use the existing **Framer Motion** library for all gesture recognition and animation.
*   **Component Refactoring:**
    *   **`AppShell.tsx` / `MainLayout.tsx`:** Implement the carousel structure using a `motion.div` "film strip" wrapper. Its `animate={{ x: ... }}` property will be driven by `activeViewIndexAtom`, and it will handle the core drag logic.
    *   **`SideMenu.tsx`:** Strip all overlay logic (`position: fixed`, backdrop) to become a standard layout component.
    *   **`FloatingHeader.tsx` / `FloatingFooter.tsx`:** Wrap in `<AnimatePresence>` for conditional rendering based on `activeViewIndexAtom > 0`. `FloatingFooter` will gain a `useLayoutEffect` to set the `--footer-height` CSS variable.
    *   **`PillToggle.tsx`**: Refactor to be a passive indicator, reflecting the state of `activeViewIndexAtom` rather than controlling it.
    *   **`ToastContainer.tsx`:** Remove the nested `Toast.Provider`. It will now only render the list of toasts and the viewport.
    *   **`Toast.tsx`:** The `ToastMessage` component will be wrapped with a `motion.div` to implement the drag gesture, animation, and `onDragEnd` dismissal logic.
*   **State Management (`atoms.ts`):**
    *   Add `activeViewIndexAtom = atom(1)`.
    *   Remove `isSideMenuOpenAtom` and `scheduleViewAtom`.
    *   Update any downstream atoms (e.g., `sortedChecksAtom`) to read from the new `activeViewIndexAtom`.

### 6. File Manifest

*   **`[MODIFIED]` `src/App.tsx`**: Ensure single, top-level `Toast.Provider` with correct props.
*   **`[MODIFIED]` `src/AppShell.tsx`**: Orchestrate the new Workspace Carousel layout.
*   **`[MODIFIED]` `src/layouts/MainLayout.tsx`**: Implement the `motion.div` "film strip" and its drag logic.
*   **`[MODIFIED]` `src/components/PillToggle.tsx`**: Refactor to be a passive indicator driven by a new shared atom.
*   **`[MODIFIED]` `src/components/Toast.tsx`**: Integrate Framer Motion for drag-to-dismiss gesture.
*   **`[MODIFIED]` `src/components/ToastContainer.tsx`**: Remove nested provider; its CSS will be updated for dynamic positioning.
*   **`[MODIFIED]` `src/data/atoms.ts`**: Add `activeViewIndexAtom`; remove `isSideMenuOpenAtom` and `scheduleViewAtom`.
*   **`[MODIFIED]` `src/data/appDataAtoms.ts`**: Update `sortedChecksAtom` to read from `activeViewIndexAtom`.
*   **`[MODIFIED]` `src/features/Dashboard/DashboardView.tsx`**: Remove internal state logic, will be rendered twice with different props by the carousel.
*   **`[MODIFIED]` `src/features/Header/FloatingHeader.tsx`**: Add `<AnimatePresence>` for conditional rendering.
*   **`[MODIFIED]` `src/features/Footer/FloatingFooter.tsx`**: Add `<AnimatePresence>` and the `useLayoutEffect` to set `--footer-height`.
*   **`[MODIFIED]` `src/features/NavBar/SideMenu.tsx`**: Remove all overlay logic and styles.
*   **`[MODIFIED]` `src/features/Scanning/ScanView.tsx`**: Update toast generation logic to prevent duplicates.
*   **`[MODIFIED]` `src/features/SafetyCheckSchedule/ListView.tsx`**: Wrap list items in `motion.div` for layout animations.
*   **`[DELETED]` `src/features/SafetyCheckSchedule/CardView.tsx`**: Vestigial code.
*   **`[DELETED]` `src/features/SafetyCheckSchedule/PriorityView.tsx`**: Vestigial code.
*   **`[REFERENCE]` `package.json`**: To confirm Framer Motion version.
*   **`[REFERENCE]` `CSS-PRINCIPLES.md`**: For consistency with the "Fixed Header & Spacer Contract."

### 7. Unintended Consequences Check

*   **`src/styles/index.css`**: Verify that global `overflow-x: hidden` styles on `html` or `body` do not interfere with the carousel's drag mechanics.
*   **Jotai State Consumers**: A global search for `isSideMenuOpenAtom` and `scheduleViewAtom` must be performed to ensure all consumers are migrated to the new `activeViewIndexAtom`.
*   **Mobile Viewport Behavior**: Test thoroughly on mobile Safari and Chrome to check for conflicts between the browser's native "swipe to go back/forward" gestures and the app's carousel gesture.

### 8. Risks & Mitigations

*   **Risk 1: Gesture Conflicts:** Vertical scroll on the dashboard could be misread as a horizontal swipe.
    *   **Mitigation:** Use Framer Motion's `dragDirectionLock` and set a higher activation threshold for the horizontal drag (`dragSnapToOrigin`) to require a more deliberate gesture.
*   **Risk 2: User Discoverability:** The swipe-based navigation may not be immediately obvious.
    *   **Mitigation:** The `PillToggle`'s synchronized animation during a drag provides a strong visual affordance that teaches the interaction. This is sufficient for the prototype stage.
*   **Risk 3: Performance on Low-End Devices:** The simultaneous animation of the carousel, header/footer, and list re-sorting is computationally intensive.
    *   **Mitigation:** Leverage hardware-accelerated CSS properties (`transform`, `opacity`) exclusively. Framer Motion is highly optimized for this. Perform rigorous testing using browser performance profiling tools.

### 9. Definition of Done

1.  [ ] The user can swipe horizontally to transition between all three workspaces (Side Menu, Time View, Route View).
2.  [ ] The `PillToggle` in the header correctly reflects the active dashboard view (Time or Route) and is hidden when the Side Menu is active.
3.  [ ] The `FloatingHeader` and `FloatingFooter` smoothly animate out of view when the Side Menu is active and animate back in for the dashboard views.
4.  [ ] All toast notifications can be dismissed via a fluid, rightward swipe gesture.
5.  [ ] Toast notifications are correctly positioned above the `FloatingFooter` when it is visible, and near the screen bottom when it is not.
6.  [ ] The `ToastContainer` is rendered only once, at the top level of `App.tsx`.
7.  [ ] The `CardView.tsx` and `PriorityView.tsx` files have been deleted.
8.  [ ] The `isSideMenuOpenAtom` and `scheduleViewAtom` have been removed from the codebase and replaced by `activeViewIndexAtom`.
9.  [ ] The application maintains a fluid 60fps during all gesture interactions on a target mobile device.