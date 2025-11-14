Of course. Thank you for the clarifying feedback. The goal is to evolve the existing, well-regarded UI patterns, not replace them. A larger, more touch-friendly version of the `IconToggleGroup` that includes text is a much stronger direction for maintaining visual harmony.

I have discarded the previous "pill-style" concept and formulated a new plan centered on this revised approach.

This is **analysis and planning only**.

---

### **PRD 3: Core Check Workflow & Usability Overhaul (Revised Plan)**

#### **1. Overview**

This document outlines a revised plan to overhaul the core check workflow, as specified in PRD 3. The central initiative is to refactor the Check Form to support per-resident data capture (notes and status).

Based on stakeholder feedback, this plan replaces the initial concept of a "pill-style" toggle. Instead, we will introduce a new **`<SegmentedControl>`** component that is a direct, high-craft evolution of the existing `IconToggleGroup`. It will be larger, support both icons and text labels, and be optimized for mobile touch targets, ensuring it remains visually harmonious with the established design language of the application.

#### **2. Problem & Goals**

The current check submission form has ergonomic issues on mobile and does not support critical data requirements, such as per-resident notes. The workflow also has redundant steps and could provide clearer feedback.

**Goals:**

1.  **Improve Data Integrity & Usability:** Overhaul the check form to enable per-resident notes and improve the ergonomics of status selection on mobile devices with a larger, clearer control.
2.  **Increase User Efficiency:** Streamline navigation by taking users directly from a schedule item tap to the check form.
3.  **Enhance User Feedback:** Provide clearer visual feedback for failed QR code scans and standardize UI patterns.

#### **3. Scope & Key Initiatives**

**In Scope:**

*   **Initiative 1: Check Form Overhaul**
    *   Refactor the form to support a separate notes field on a **per-resident** basis.
    *   Replace icon-only toggles with the new, full-width, high-craft `<SegmentedControl>` component for resident status selection.
    *   Relocate the "Special Classification" indicator to be adjacent to the specific resident's name within the form.
*   **Initiative 2: Workflow & UI Refinements**
    *   Change the behavior of tapping a schedule item to navigate directly to the Check Form, bypassing the scan screen.
    *   Improve feedback for failed QR code scans with an integrated visual indicator on the scan view.
    *   Simplify the "Manual Check" room selection list to show only room locations.
    *   Update modal "Back" buttons to consistently use the `tertiary` button style.

**Out of Scope for this Iteration:**

*   A "Set All" convenience feature for multi-resident rooms.

#### **4. UX/UI Specification & Wireframes**

**4.1. [NEW] `<SegmentedControl>` Component**

This component is an enhanced version of the existing `IconToggleGroup`, designed to be full-width with larger touch targets and text labels.

*   **Interaction:**
    *   A full-width container with 2-3 selectable options.
    *   Each option is a distinct button containing both an icon and a text label.
    *   The selected item has a prominent background color (`--control-bg-selected`) and text color (`--control-fg-selected`), matching the active state of the existing `IconToggleGroup`.
    *   Unselected items have a neutral background (`--surface-bg-primary`) and secondary text color (`--surface-fg-secondary`).
    *   State transitions are animated (`transition: background-color 0.2s, color 0.2s`).
*   **Styling:**
    *   The overall container has rounded corners (`border-radius: var(--radius-md)`).
    *   Buttons are separated by a `1px` border (`--surface-border-primary`).
    *   Height is increased to `48px` for better touch ergonomics.

*   **ASCII Wireframe:**
    ```plaintext
    // Resembles the existing IconToggleGroup, but larger and with text.
    // Full width of its container.

    +--------------------------------------------------------------------+
    | [ <Icon> Awake ]  |   <Icon> Sleeping   |    <Icon> Refused      |
    +--------------------------------------------------------------------+
      ^                 ^                     ^
      |-- Selected Item                       |-- Unselected Items
      |   height: 48px;                       |   height: 48px;
      |   background: var(--control-bg-selected); |   background: var(--surface-bg-primary);
      |   color: var(--control-fg-selected);      |   color: var(--surface-fg-secondary);
      |-- Border radius: var(--radius-md) on first/last items.
    ```

**4.2. Overhauled Check Form**

*   **Interaction:** The form contains a distinct, bordered section for each resident. Each section has its own full-width `<SegmentedControl>` and an optional notes field.
*   **Styling:** Each resident's section is wrapped in a container with `border: 1px solid var(--surface-border-secondary)` and `border-radius: var(--radius-md)`.

*   **ASCII Wireframe:**
    ```plaintext
    +--------------------------------------------------+
    | [<- Back]  Record check                          | // Back button: variant="tertiary"
    |--------------------------------------------------|
    | +--[Resident 1 Container]----------------------+ |
    | | Luke Skywalker                               | |
    | | +-------------------------------------------+  |
    | | | [ Awake ] |  Sleeping  |   Refused      ] |  | // New <SegmentedControl>
    | | +-------------------------------------------+  |
    | |  Notes (optional)                            | |
    | | +-----------------------------------------+  | |
    | | | Enter notes for Luke...                 |  | |
    | | +-----------------------------------------+  | |
    | +----------------------------------------------+ |
    +--------------------------------------------------+
    ```

#### **5. Architecture & Implementation Plan**

*   **[NEW] `<SegmentedControl>` Component:**
    *   A new generic component will be created at `/src/components/SegmentedControl.tsx`.
    *   It will be built on Radix UI's `<ToggleGroup.Root>` and `<ToggleGroup.Item>` primitives for accessibility.
    *   New CSS classes (`.segmented-control`, `.segmented-control-item`) will be added to the global `toggles.css` file to style this larger variant, ensuring its visual design is an extension of the existing `.toggle-group` styles.
*   **[NEW] `<ResidentCheckControl>` Component:**
    *   A new component in `/src/features/Workflow` that encapsulates a single resident's name, their associated `<SegmentedControl>`, and their notes `textarea`.
    *   This component will manage the display logic for "Special Classification" residents, applying a distinct visual treatment (e.g., warning-colored border and background) to its root element.
*   **[MODIFIED] `CheckFormView.tsx`:**
    *   The component will be refactored to render a list of `<ResidentCheckControl>` components.
    *   Local state for notes will be changed from `useState<string>('')` to `useState<Record<string, string>>({})` to store notes per resident ID.
*   **[MODIFIED] `CheckCard.tsx` / `CheckListItem.tsx`:**
    *   The `onClick` handler will be changed to set the `workflowStateAtom` directly to `'form'`, populating it with the check's data and bypassing the scan view.
*   **[MODIFIED] `ScanView.tsx`:**
    *   Will be updated with local state to manage a "scan failed" visual effect (e.g., a red pulse animation on the viewfinder border).
*   **[MODIFIED] `SelectRoomModal.tsx`:**
    *   The data source will be refactored to group residents by room, simplifying the list to show unique locations with resident names as secondary information.

#### **6. File Manifest**

*   **/src/components**
    *   `[NEW]` SegmentedControl.tsx
    *   `[REFERENCE]` IconToggleGroup.tsx *(Visual and architectural precedent)*
*   **/src/features/Workflow**
    *   `[MODIFIED]` CheckFormView.tsx *(Major refactor to use new components)*
    *   `[MODIFIED]` CheckFormView.module.css *(Update styles for new layout)*
    *   `[NEW]` ResidentCheckControl.tsx
    *   `[NEW]` ResidentCheckControl.module.css
    *   `[MODIFIED]` ScanView.tsx *(Add failed scan feedback)*
    *   `[MODIFIED]` ScanView.module.css *(Add failed scan animation)*
*   **/src/features/Schedule**
    *   `[MODIFIED]` CheckCard.tsx *(Update onClick handler)*
    *   `[MODIFIED]` CheckListItem.tsx *(Update onClick handler)*
*   **/src/features/Overlays**
    *   `[MODIFIED]` SelectRoomModal.tsx *(Simplify list items)*
    *   `[MODIFIED]` SelectRoomModal.module.css *(Update list item styles)*
*   **/src/styles**
    *   `[MODIFIED]` toggles.css *(Add new styles for `.segmented-control`)*

#### **7. Unintended Consequences Check**

*   **Global Styles (`toggles.css`):** Adding new styles for the `<SegmentedControl>` to `toggles.css` must be done carefully. The new CSS classes must be specific enough to avoid inadvertently altering the appearance of the existing `IconToggleGroup` used elsewhere in the application. A review of all `IconToggleGroup` instances is recommended.
*   **State Atoms (`atoms.ts`):** The `WorkflowState` type definition in `src/data/atoms.ts` must be checked to ensure it correctly represents the data structure for both the "tapped" and "scanned" entry points into the form view.

#### **8. Risks & Mitigations**

*   **Risk:** The Check Form refactor is significant and could introduce state management bugs, especially with the new per-resident data structure.
    *   **Mitigation:** The new `<ResidentCheckControl>` will encapsulate its own display logic. The parent `CheckFormView` will remain the single source of truth for the form's data, managing the consolidated `statuses` and `notes` objects. This separation of concerns will make debugging more predictable.
*   **Risk:** The "Tap to Check" workflow bypasses the "proof of presence" that scanning provides.
    *   **Mitigation:** This is an accepted UX trade-off per the PRD. The system will continue to log how a check was initiated, ensuring data provenance is maintained for any future auditing needs.

#### **9. Definition of Done**

*   [ ] Tapping a schedule item navigates directly to the Check Form.
*   [ ] The Check Form displays a separate control group (status selector + notes) for each resident using the new `<ResidentCheckControl>` component.
*   [ ] Resident status is selected via the new, full-width `<SegmentedControl>` component.
*   [ ] Failed QR scans trigger a clear visual indicator on the scan view's viewfinder.
*   [ ] The Manual Check selection list is simplified to show room locations, not individual residents.
*   [ ] Modal "Back" buttons consistently use the `tertiary` button style.
*   [ ] All new UI adheres to the project's design tokens and CSS principles, maintaining visual harmony with existing components.