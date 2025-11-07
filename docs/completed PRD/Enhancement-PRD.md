### **Project Brief: Workflow & Fidelity Enhancement (Phase 2)**

This initiative will enhance the realism and usability of the Safety Check PWA prototype by expanding the mock dataset and performing a high-craft UX overhaul of the core scan-and-record workflow. The primary focus is on improving caregiver awareness of critical resident information through a "progressive elaboration" design pattern and refining the scanner UI for a more focused, immersive experience.

---

### **Product Requirements Document (PRD)**

#### **1. Goals**
*   Increase the realism of the prototype by expanding the data set.
*   Improve the clarity, focus, and ergonomics of the Scan screen.
*   Critically enhance caregiver awareness of special resident classifications throughout the check workflow.
*   Streamline the application's primary navigation by removing redundant views.

#### **2. User Stories**
*   **Data Fidelity:** "As a developer, I want a larger and more varied set of mock data so I can robustly test the performance of virtualized lists, UI edge cases (e.g., long names), and multi-resident scenarios."
*   **Scan UI/UX:** "As a caregiver, I want the scanning experience to feel focused and immersive, with clear, high-contrast controls that guide me through the task without distraction."
*   **Critical Information Awareness (Progressive Elaboration):** "As a caregiver, I need to be made aware of a resident's special classification (e.g., Suicide Watch) at every step of the check process, with information becoming more specific as I get closer to the final record form."
*   **Navigation Simplification:** "As a user, I want a streamlined navigation menu that only presents essential, non-redundant views to reduce cognitive load."

#### **3. Out of Scope**
*   Applying the "Action Mode" dark theme to any screen other than the QR Scanner.
*   Implementing a mock API or dynamic data generation tools. The static mock data file will remain the single source of truth.

---

### **User Experience (UX) Specification**

#### **1. Theme & Styling: The "Action Mode" Scanner**

The Scan screen will be redesigned to create a focused, immersive state.

*   **Background:** The entire `ScanView` container, including the header and footer, will use a solid dark background (`--surface-bg-primary-solid`).
*   **Controls:** All interactive elements (buttons, text) will use high-contrast "on-solid" variants.
    *   The **"Close"** button will be a `variant="on-solid"` icon button.
    *   The **"Select Manually"** button will be a `variant="on-solid"` button.
    *   A new text prompt, **"Can't scan?"**, will be placed above the manual selection button, styled with `--surface-fg-on-solid-faint` for a subtle appearance.
*   **Developer Controls:**
    *   The two "Simulate" buttons will be grouped in a distinct container with a slightly lighter dark background (`--surface-bg-secondary-solid`).
    *   This container will use a two-column layout, with each button filling half the width.
    *   The buttons will use `variant="tertiary"` (on a dark background) and include icons for clarity (`check_circle` for success, `error` for fail).

#### **2. UX Flow: Progressive Elaboration for Special Classifications**

This is the core UX enhancement, ensuring critical information is presented contextually.

*   **Step 1: On the Schedule (`CheckCard`)**
    *   A resident with a special classification will be indicated by a prominent, filled `warning` or `shield_person` icon on their `CheckCard`. This is the first, at-a-glance hint.

*   **Step 2: Post-Scan Confirmation (`Toast`)**
    *   Upon a successful scan of a room containing a classified resident, the confirmation toast message will be enhanced to include this critical context.
    *   **New Toast Message Format:** `Room [Name] found. Contains resident with [Type] classification.` (e.g., "Room 101 found. Contains resident with SW classification.").
    *   The toast will use an appropriate icon, such as `shield_person`.

*   **Step 3: On the Record Form (`CheckFormView`)**
    *   **Global Header:** The main form header will contain a general status badge (e.g., "Special Classification Present") to immediately reinforce the alert upon entering the form.
    *   **Per-Resident Indicator (The Elaboration):** In the resident list, a small, icon-only badge (`shield_person`) will be displayed directly next to the name of the specific resident who has the classification. This pinpoints the information in multi-resident scenarios. The badge will be wrapped in a `Tooltip` providing the full classification details on hover/long-press.

#### **3. Navigation Streamlining**

*   The "Checks" item will be permanently removed from the `SideMenu` navigation, as its functionality is fully covered by the "Dashboard" view.

---

### **Architecture & Development Plan**

#### **1. Data Layer (`src/data/appDataAtoms.ts`)**
*   **Action:** Expand the `mockResidents` and `mockChecks` arrays.
*   **Implementation:**
    *   Add 10-15 new residents, including some with multi-word last names or complex room identifiers.
    *   Add 10-15 new checks, ensuring at least three new multi-resident rooms are created.
    *   Distribute `dueDate`s across a wider range (e.g., from -240 minutes to +240 minutes).
    *   Assign `specialClassification` to at least 4 new checks, including one in a multi-resident room where other residents are unclassified.

#### **2. Component & Feature Layer**

*   **File:** `src/features/Scanning/ScanView.tsx`
    *   **Action:** Implement the "Action Mode" UI.
    *   **Implementation:**
        *   Modify the `header` and `footer` elements' styling in `ScanView.module.css` to use solid dark backgrounds.
        *   Change the `variant` prop on all `<Button>` components to `"on-solid"` or `"tertiary"` as specified in the UX spec.
        *   Add the new `<p>` element for the "Can't scan?" prompt.
        *   Restructure the dev controls JSX into the new flexbox wrapper and update button props.

*   **File:** `src/features/Scanning/ScanView.tsx` (Logic)
    *   **Action:** Update toast message logic.
    *   **Implementation:** In the `handleDecode` function, after finding a valid `check`, add a condition: `if (check.specialClassification) { ... }` to construct and dispatch the new, more detailed toast message.

*   **File:** `src/features/CheckForm/CheckFormView.tsx`
    *   **Action:** Display special classification badges.
    *   **Implementation:**
        *   Create and import a new reusable component: `StatusBadge`.
        *   In the `residentInfo` header section, conditionally render a `<StatusBadge variant="info" ...>` if `checkData.specialClassification` exists.
        *   Inside the `.map()` function that renders the `residentRow`, conditionally render a smaller `<StatusBadge>` next to the `resident.name` if that specific `resident` has the classification. (This will require modifying the data structure slightly to pass this info or cross-referencing it). *Correction:* The `SafetyCheck` object already contains the residents and the classification. The logic will be: check if `checkData.specialClassification` exists, and then associate it with the correct resident in the list for display.

*   **NEW COMPONENT:** `src/components/StatusBadge.tsx` and `.module.css`
    *   **Action:** Create a versatile, reusable badge component.
    *   **Props:** `icon: string`, `tooltip: string`, `variant: 'info' | 'warning' | etc.`.
    *   **Implementation:** This will be a simple component that renders a styled `div` with an icon, wrapped in the `Tooltip` component. It will use data attributes for styling variants.

#### **3. Navigation & State**

*   **File:** `src/features/NavBar/SideMenu.tsx`
    *   **Action:** Remove the "Checks" navigation item.
    *   **Implementation:** Delete the `{ id: 'checks', ... }` object from the `navItems` array.

*   **File:** `src/layouts/MainLayout.tsx`
    *   **Action:** Remove the "Checks" view rendering logic.
    *   **Implementation:** Delete the `case 'checks':` block from the `renderActiveView` switch statement.

*   **File:** `src/data/atoms.ts`
    *   **Action:** Update the core navigation type definition.
    *   **Implementation:** Remove `'checks'` from the `AppView` type union. This will enforce the change at the TypeScript level.