### **PRD 5: UI Polish, History Filtering & Offline Sync**

#### **1. Overview**

This document outlines the requirements for the next major iteration, incorporating feedback from the latest review. This sprint is focused on UI polish, enhancing interactivity, and implementing the full UI logic for the offline workflow. Key initiatives include adding touch-compliant tooltips, refining visual components like status badges and check cards, correcting layout issues in the Settings view, transforming the History view into a dynamic filtering interface, and simulating the complete offline "queued and sync" workflow.

#### **2. Problem & Goals**

While core workflows are functional, several areas require refinement to meet the project's high-craft standards. Key components lack discoverability (tooltips) and visual clarity (status icons). The Settings layout is broken due to a code/style mismatch. The History view is static, and the offline mode lacks clear user feedback.

**Goals:**

1.  **Refine UI Components for Clarity & Consistency:** Improve the visual design of core components to provide more information at a glance and ensure all views adhere to a consistent layout language.
2.  **Enhance Data Discovery:** Make the History view a powerful, interactive tool by turning its category pills into a dynamic filtering system.
3.  **Provide Robust Offline Feedback:** Implement the complete UI lifecycle for offline checks, showing users when items are queued and when they are actively syncing.
4.  **Improve UI Cohesion & Perceived Performance:** Align the Check Form's design with the main app's floating UI patterns and implement a configurable "slow load" mode to test skeleton states.

#### **3. Scope & Key Initiatives**

**In Scope:**

*   **Initiative 1: Interactive History Filtering & Empty States**
    *   Refactor the History view's category pills to function as toggleable filters.
    *   Implement a new empty state for when a filter returns no results, which must include a "Clear filter" call-to-action button.
*   **Initiative 2: Offline Queuing & Sync Simulation**
    *   Implement the full UI logic for queuing checks while offline and simulating the sync process when the connection is restored, including a minimum 2-second animated sync state in the header.
*   **Initiative 3: Component Polish & Layout Correction**
    *   Add touch-compliant tooltips to the main header's action icons (`Menu`, `Add`).
    *   Add small, status-appropriate icons inside the `<StatusBadge>` component.
    *   Relocate the "Special Classification" warning icon on `CheckCard` and `CheckListItem` from the room level to be directly adjacent to the specific resident's name.
    *   Fix the `SettingsOverlay` layout by refactoring its JSX structure to correctly use the classes defined in its CSS module, adopting a standard grouped-list pattern.
*   **Initiative 4: UI Polish & Bug Fixes**
    *   Refactor the `CheckFormView` **footer** (only) to use the floating, translucent style from the main app shell.
    *   Implement all pending bug fixes from the previous analysis (terminology refactor, modal back button variant).
    *   Add a developer setting to simulate a 3-second slow load to test skeleton states.

**Out of Scope for this Iteration:**

*   Real backend API integration for syncing.
*   Multi-filter selection in the History view.

#### **4. UX/UI Specification & Wireframes**

**4.1. Status Badge with Icon**

*   **Interaction:** No change in behavior.
*   **Styling:** A `12px` icon will be prepended to the text. Uses `display: inline-flex`, `align-items: center`, and `gap: var(--spacing-1)`.

```plaintext
// Example: Late status
+-------------------+
| [!] Late          |
+-------------------+
  ^
  |-- icon size: 12px; font-variation-settings: 'opsz' 12;
```

**4.2. Check Card with Resident-Specific Icon**

*   **Interaction:** No change in behavior.
*   **Styling:** The `warning` icon is moved from the top row (next to the room name) to the bottom row, inside the `<li>` of the specific resident.

```plaintext
+----------------------------------------------+
| <div class="top-row">                        |
|   <span class="location">Tatooine</span>     |
|   [ (icon) Due Soon ] (StatusBadge)          |
| </div>                                       |
| <div class="bottom-row">                     |
|   <ul>                                       |
|     <li>Luke Skywalker</li>                  |
|     <li>[!] Obi-Wan Kenobi</li> <!-- Icon here -->
|   </ul>                                      |
|   <span class="time">2m 30s</span>            |
| </div>                                       |
+----------------------------------------------+
```

**4.3. Corrected Settings Overlay Layout**

*   **Interaction:** Settings are now grouped into visually distinct, bordered cards.
*   **Styling:** Uses a flex layout with `.settingsGroup` for the card and `.settingsItem` for each row, as defined in `SettingsOverlay.module.css`.

```plaintext
+--------------------------------------------------+
| <div class="settingsSection">                    |
|   <h3 class="sectionTitle">PREFERENCES</h3>      |
|   +--[div.settingsGroup]-----------------------+ |
|   | <div class="settingsItem">                 | |
|   |   <label>Schedule View</label>             | |
|   |   [ IconToggleGroup ]                      | |
|   | </div>                                     | |
|   |--------------------------------------------| | // border-bottom
|   | <div class="settingsItem">                 | |
|   |   <label>Haptic Feedback</label>            | |
|   |   [ Switch ]                               | |
|   | </div>                                     | |
|   +--------------------------------------------+ |
| </div>                                           |
+--------------------------------------------------+
```

#### **5. Architecture & Implementation Plan**

*   **Component Architecture:**
    *   **[MODIFIED] `FloatingHeader.tsx`:** The `Menu` and `Add` buttons will be wrapped with the `<Tooltip>` component.
    *   **[MODIFIED] `StatusBadge.tsx`:** Will be updated with a mapping from `SafetyCheckStatus` to an icon name. The JSX will be modified to render a `<span>` for the icon.
    *   **[MODIFIED] `StatusBadge.module.css`:** A new class will be added to style the icon's size (`font-size: 12px`) and optical size (`'opsz' 12`).
    *   **[MODIFIED] `CheckCard.tsx` & `CheckListItem.tsx`:** The JSX for rendering the resident list will be updated to check if a resident's ID matches the `specialClassification.residentId` and conditionally render the `warning` icon.
    *   **[MODIFIED] `SettingsOverlay.tsx`:** The component's JSX will be completely refactored to use `divs` with `.settingsSection`, `.settingsGroup`, and `.settingsItem` classes, aligning it with the structure defined in its CSS module.
    *   **All other modifications from PRD 4 remain the same.**

#### **6. File Manifest**

*   **/src/features/Shell**
    *   `[MODIFIED]` FloatingHeader.tsx
    *   `[MODIFIED]` StatusOverviewBar.tsx
    *   `[MODIFIED]` OfflineBanner.tsx
*   **/src/features/Schedule**
    *   `[MODIFIED]` StatusBadge.tsx
    *   `[MODIFIED]` StatusBadge.module.css
    *   `[MODIFIED]` CheckCard.tsx
    *   `[MODIFIED]` CheckListItem.tsx
    *   `[MODIFIED]` ScheduleListView.tsx
*   **/src/features/Workflow**
    *   `[MODIFIED]` CheckFormView.tsx
    *   `[MODIFIED]` CheckFormView.module.css
*   **/src/features/Overlays**
    *   `[MODIFIED]` SettingsOverlay.tsx
    *   `[MODIFIED]` DeveloperOverlay.tsx
*   **/src/features/History**
    *   `[MODIFIED]` HistoryView.tsx
*   **/src/components**
    *   `[MODIFIED]` EmptyStateMessage.tsx
    *   `[MODIFIED]` FullScreenModal.tsx
    *   `[REFERENCE]` Tooltip.tsx
*   **/src/data**
    *   `[MODIFIED]` atoms.ts
    *   `[MODIFIED]` appDataAtoms.ts
*   **/src/types.ts**
    *   `[MODIFIED]` types.ts
*   **/doc**
    *   `[REFERENCE]` CSS-PRINCIPLES.md

#### **7. Unintended Consequences Check**

*   **`StatusBadge.tsx`:** Modifying this shared component will affect its appearance in both `CheckCard` and `CheckListItem`. The new layout (icon + text) must be tested to ensure it doesn't cause text wrapping or overflow issues within the confines of those parent components. Using flexbox should make this robust.
*   **`appDataAtoms.ts`:** All derived atoms (`timeSortedChecksAtom`, etc.) must be re-verified to correctly handle the new `queued` status to prevent items from being sorted incorrectly or disappearing from lists.

#### **8. Risks & Mitigations**

*   **Risk:** The state logic for the sync simulation involves multiple atoms and timers, which could lead to race conditions.
    *   **Mitigation:** The entire sync process will be encapsulated and triggered by a single event. This centralized control flow will prevent disparate parts of the app from initiating conflicting state changes.
*   **Risk:** The layout refactor of `SettingsOverlay` is a significant visual change.
    *   **Mitigation:** The new structure is based on the *existing* CSS, which was designed for a standard, robust list layout. By making the code conform to the styles, we are actually reducing risk and adopting a more maintainable pattern.

#### **9. Definition of Done**

*   [ ] All terminology and component fixes from the previous analysis are implemented.
*   [ ] The main header's `Menu` and `Add` icon buttons have touch-compliant tooltips.
*   [ ] The `StatusBadge` component now includes a small, context-appropriate icon.
*   [ ] The special classification icon now appears next to the specific resident's name in `CheckCard` and `CheckListItem`.
*   [ ] The `SettingsOverlay` layout is fixed and presents settings in clean, bordered groups.
*   [ ] The `CheckFormView` footer is a floating, translucent element.
*   [ ] The History view's category pills function as toggleable filters with a functional empty state.
*   [ ] The full offline "queue and sync" UI simulation is implemented and functions correctly.
*   [ ] A "Simulate Slow Loading" toggle in Developer Settings successfully forces a 3-second skeleton loader state.