Here are the 4 PRDs designed to address your feedback, organized by logical domain: **UI Polish**, **Core Workflow**, **Connectivity**, and **Performance Architecture**.

---

## PRD 1: Visual Polish & Standardization
**Focus:** Implementing specific UI requests (Logout, Search, Login, Typography) and standardizing interactions.

### 1. Overview
This initiative focuses on refining the visual execution of the application to align with high-craft standards. It addresses specific feedback regarding component placement (Logout), internal layout (Search Input), state feedback (Login Error), and global button consistency.

### 2. Problem & Goals
**Problem:** Current UI elements have inconsistent ordering (buttons), suboptimal accessibility (Logout placement), and non-standard iconography styling (Search input).
**Goals:**
*   Improve accessibility of the Logout action.
*   Standardize button ordering (Primary on Left) across the application.
*   Enhance the visual hierarchy of the Search Input and Login Error states.
*   Enforce Title Case on all headers.

### 3. Scope & Key Initiatives
*   **Side Menu Refactor:** Move Logout to the footer, style as secondary button.
*   **Button Reordering:** Update all button groups to place Primary actions on the Left.
*   **Search Input Refactor:** Move icon to the right, style as quinary.
*   **Login Error Redesign:** Implement the specific "Credentials incorrect" design with icon and borders.
*   **Typography Update:** Enforce Title Case on `CheckFormView`, `AppSideMenu`, and `ScanView` headers.
*   **Transition Standardization:** Apply the canonical `tween` to `MainLayout` (remove spring if present) and fix loading skeleton crossfade.

### 4. UX/UI Specification & Wireframes

**A. Login Error Banner (`LoginView.tsx`)**
```text
+-------------------------------------------------------+
| [!] Credentials incorrect                             |  <-- bg: var(--surface-bg-primary)
+-------------------------------------------------------+      border: 1px solid var(--surface-border-alert)
 ^ Icon: 'dangerous'                                           shadow: var(--surface-shadow-md)
   color: var(--surface-fg-alert-primary)                      text: var(--surface-fg-secondary)
```

**B. Search Input (`SearchInput.tsx`)**
```text
+-------------------------------------------------------+
| Search...                                         [Q] |
+-------------------------------------------------------+
                                                     ^ Icon: 'search'
                                                       color: var(--surface-fg-quinary)
                                                       order: flex-end
```

**C. App Side Menu Footer (`AppSideMenu.tsx`)**
```text
+---------------------------------------------+
|  [Log Out] (Secondary Button Style)         | <-- Full width, above user tile
+---------------------------------------------+
|  [User Profile Card]                        |
+---------------------------------------------+
```

### 5. Architecture & Implementation Plan
*   **SearchInput:** Update flex direction or DOM order. Ensure the clear button ('x') appears to the *left* of the search icon when active.
*   **Global CSS:** Verify `flex-direction: row-reverse` isn't needed for button groups; manually reorder JSX in `CheckFormView`, `ScanView`, `NfcWritingSheet`.
*   **Skeletons:** Implement a CSS grid overlay technique for `ScheduleListView` where the list fades in *over* the skeletons (opacity transition) rather than unmounting skeletons immediately, preventing layout thrashing.

### 6. File Manifest
*   `src/features/Session/LoginView.tsx` `[MODIFIED]` (Error styling, logic)
*   `src/features/Shell/AppSideMenu.tsx` `[MODIFIED]` (Logout placement)
*   `src/features/Shell/AppSideMenu.module.css` `[MODIFIED]`
*   `src/components/SearchInput.tsx` `[MODIFIED]` (Icon placement)
*   `src/components/SearchInput.module.css` `[MODIFIED]`
*   `src/features/Workflow/CheckFormView.tsx` `[MODIFIED]` (Button order, Title Case)
*   `src/features/Workflow/ScanView.tsx` `[MODIFIED]` (Button order, Title Case)
*   `src/layouts/MainLayout.tsx` `[MODIFIED]` (Animation physics)

### 7. Unintended Consequences Check
*   **Search Input:** Check if moving the icon affects the "Integrated" variant used in Popovers (if any).
*   **Button Order:** Ensure `tabindex` flow follows the visual order (Primary First).

### 8. Risks & Mitigations
*   **Risk:** Changing button order might confuse existing users of the prototype.
*   **Mitigation:** This is a prototype; standardizing now prevents debt.

### 9. Definition of Done
*   Logout is a secondary button in the side menu footer.
*   All "Save/Cancel" or "Confirm/Retry" groups show the Primary action on the left.
*   Search icon is on the right (quinary color).
*   Login error matches the specific border/shadow/icon requirements.
*   All headers use Title Case.

