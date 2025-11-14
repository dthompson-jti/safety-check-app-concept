Of course. I have analyzed your feedback and the initial PRD. The original plan, while comprehensive, combined foundational setup, a major new feature, and significant workflow refactoring. This can be difficult to manage in a single sprint.

I have split the work into three logically-grouped and "hardened" PRDs. This creates focused, sequential sprints that build upon each other, reducing risk and improving clarity.

1.  **PRD 1: Foundational Workflow & Context:** Establishes the mandatory operational context (Facility/Unit selection) and implements app-wide terminology and configuration changes. This is the new baseline.
2.  **PRD 2: Schedule Efficiency & Search:** Focuses entirely on enhancing the main schedule view with a high-craft search feature and improved loading states.
3.  **PRD 3: Core Check Workflow & Usability Overhaul:** Concentrates on refactoring the data capture process (the Check Form) and polishing the end-to-end user flow from selection to save.

All feedback you provided has been integrated into these new documents.

---

### **PRD 1: Foundational Workflow & Context**

#### **1. Overview**

This document outlines the requirements for the first major iteration of the Safety Check PWA. The primary goal is to establish the application's foundational workflow, ensuring users operate within a mandatory, explicit context (Facility and Unit). This sprint also includes key terminology updates and a refactoring of settings to align with their intended purpose (User vs. Developer).

#### **2. Problem & Goals**

The current prototype lacks the mandatory pre-workflow step of selecting a facility and unit, which is fundamental to the user's operational context. Additionally, several component labels and settings are misaligned with clear, user-centric language and logical grouping.

**Goals:**

1.  **Align with Operational Reality:** Implement the facility/unit selection workflow to ensure users are always operating within the correct context.
2.  **Improve UI/UX Consistency:** Create a clear, hierarchical selection process and a persistent, intuitive way for users to switch context from the main menu.
3.  **Enhance Clarity & Maintainability:** Update application terminology for simplicity and refactor settings into logical user-facing and developer-only groups.

#### **3. Scope & Key Initiatives**

**In Scope:**

*   **Initiative 1: Mandatory Facility & Unit Selection**
    *   Implement a full-screen modal that appears immediately after login, requiring the user to select their active Facility Group and then their Unit.
    *   The Unit selector will remain disabled until a Facility Group is chosen to enforce the data hierarchy.
*   **Initiative 2: Side Menu Context Switcher**
    *   Replace the static list of units in the side menu with a new, card-styled component.
    *   This card will display the user's currently selected Facility Group and Unit.
    *   Tapping this card will open the same full-screen selection modal to allow for context switching.
*   **Initiative 3: Terminology & Settings Refactor**
    *   Rename "Supplemental check" to "Manual check" throughout the application.
    *   Rename "Provision NFC tag" to "Write NFC tag" for simpler language.
    *   Relocate the "Scan Mode" (QR/NFC) toggle from the main `Settings` overlay to the `Developer` overlay.

**Out of Scope for this Iteration:**

*   Schedule search and filtering.
*   The Check Form overhaul.

#### **4. UX/UI Specification & Wireframes**

**4.1. Facility Selection Modal**

*   **Interaction:** After a successful login, this full-screen modal appears. The `Facility Unit` select is disabled. Selecting a `Facility Group` enables the `Facility Unit` select. The `[ Continue ]` button is disabled until both are selected.
*   **Styling:** Uses existing `<FullScreenModal>` and `<Select>` components.

```plaintext
+--------------------------------------------------+
| Select Your Unit                                 |
|--------------------------------------------------|
| Please select your facility group and unit to    |
| begin your shift.                                |
|                                                  |
|  Facility Group                                  |
| +----------------------------------------------+ |
| | Star Wars: Death Star                  [v]   | |
| +----------------------------------------------+ |
|                                                  |
|  Facility Unit                                   |
| +----------------------------------------------+ |
| | (Select a group first)                 [v]   | | // Disabled state
| +----------------------------------------------+ |
|                                                  |
|                      [ Continue ] (disabled)     |
+--------------------------------------------------+
```

**4.2. Side Menu Context Switcher Card**

*   **Interaction:** This card appears in the side menu. The entire card is a single button. Tapping it opens the Facility Selection Modal.
*   **Styling:** A new card component styled with `var(--surface-bg-primary)`, `var(--surface-shadow-xs)`, and a `var(--radius-lg)` border-radius to feel distinct.

```plaintext
| [CONTENT OF AppSideMenu.tsx]                     |
|                                                  |
| <div class="separator"></div>                    |
|                                                  |
| +--[Context Switcher Card Button]--------------+ |
| |                                              | |
| |  <div class="context-info">                  | |
| |    <span class="context-label">GROUP</span>  | |
| |    <span class="context-value">Death Star</span>| |
| |    <span class="context-label">UNIT</span>    | |
| |    <span class="context-value">AA-23</span>   | |
| |  </div>                                      | |
| |                                              | |
| |  <span class="material-symbols-rounded">     | |
| |    swap_horiz                                | |
| |  </span>                                     | |
| |                                              | |
| +----------------------------------------------+ |
|                                                  |
| [ Rest of menu... ]                              |
```

#### **5. Architecture & Implementation Plan**

*   **State Management (Jotai):**
    *   A new atom, `isFacilitySelectionRequiredAtom = atom(true)`, will control the initial modal. It will be set to `false` on successful selection.
    *   New atoms, `selectedFacilityGroupAtom` and `selectedFacilityUnitAtom`, will store the user's context.
    *   The `isWriteNfcModalOpenAtom` will be renamed `isManualCheckModalOpenAtom`.
*   **Component Architecture:**
    *   **[NEW] `<FacilitySelectionModal>`:** New component in `/src/features/Overlays`.
    *   **[MODIFIED] `App.tsx`:** Will conditionally render `<FacilitySelectionModal>`.
    *   **[MODIFIED] `AppSideMenu.tsx`:** The static list will be removed and replaced with the new context switcher card component. All labels will be updated.
    *   **[MODIFIED] `SettingsOverlay.tsx`:** The "Scan Mode" toggle group will be removed.
    *   **[MODIFIED] `DeveloperOverlay.tsx`:** The "Scan Mode" toggle group will be added.

#### **6. File Manifest**

*   **/src/features/Overlays**
    *   `[NEW]` FacilitySelectionModal.tsx
    *   `[MODIFIED]` SettingsOverlay.tsx *(Remove scan mode toggle)*
    *   `[MODIFIED]` DeveloperOverlay.tsx *(Add scan mode toggle)*
*   **/src/features/Shell**
    *   `[MODIFIED]` AppSideMenu.tsx *(Implement context card, update terminology)*
*   **/src/data**
    *   `[MODIFIED]` atoms.ts *(Add facility selection atoms, rename manual check atom)*

#### **7. Unintended Consequences Check**

*   **`appDataAtoms.ts`:** The derived atoms for the schedule list (`timeSortedChecksAtom`, etc.) will need to be updated in a future PRD to filter based on the new `selectedFacilityUnitAtom`. They must be designed to handle a `null` initial state gracefully.

#### **8. Risks & Mitigations**

*   **Risk:** A user could potentially close the initial selection modal without making a choice, leaving the app in an invalid state.
    *   **Mitigation:** The modal's "close" or "back" button will be configured to log the user out, ensuring they cannot proceed without establishing context.

#### **9. Definition of Done**

*   [ ] A full-screen Facility/Unit selection modal is presented to the user after login.
*   [ ] The modal correctly enforces the selection hierarchy (Group then Unit).
*   [ ] The side menu displays the current context in a dedicated card.
*   [ ] Tapping the side menu card re-opens the selection modal.
*   [ ] All instances of "Supplemental check" are changed to "Manual check".
*   [ ] All instances of "Provision NFC tag" are changed to "Write NFC tag".
*   [ ] The "Scan Mode" toggle is moved from Settings to Developer settings.

