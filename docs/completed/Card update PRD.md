Excellent. I have ingested the official Product Requirements Document and your additional high-craft requirements. This new context provides critical business logic and terminology that will be integrated into the plan.

Based on this comprehensive input, here is the revised and finalized PRD for the Check Card Redesign.

---

## **PRD: Check Card Redesign & List Grouping**

### 1. Overview

This document outlines the requirements for a complete redesign of the `CheckCard` component and the introduction of structural grouping within the schedule list view. The goal is to evolve the user interface from a simple, flat list into a more structured, information-rich display. This redesign will significantly improve at-a-glance readability and operational efficiency by creating a clearer visual hierarchy for critical information, aligning directly with the core requirements outlined in the eSupervision Mobile App PRD (v0.1).

### 2. Problem & Goals

**Problem:** The current `CheckCard` design lacks a strong visual hierarchy, making it difficult for users to quickly differentiate a check's location from its status and urgency. Furthermore, the schedule itself is a single, undifferentiated list, lacking the context of which facility unit or urgency group the checks belong to.

**Goals:**

*   **Improve Scannability:** Restructure the card into a two-row layout to logically separate location/status from resident/time information.
*   **Enhance Status Clarity:** Replace simple text with a distinct, color-coded `StatusBadge` component, using terminology from the official PRD (`Late`, `Due Soon`, `Completed`, etc.).
*   **Increase Information Density:** Natively support a "special classification" icon for high-risk residents (e.g., Suicide Watch) that provides details via a tooltip.
*   **Eliminate UI Jitter:** Ensure the countdown timer uses tabular (monospaced) numerals to prevent layout shifting as numbers change.
*   **Introduce Structural Hierarchy:** Add H1-level headers for facility units and H2-level headers for status groups (e.g., Late, Due Soon) within the `PriorityView` to give the schedule clear, scannable sections.
*   **Elevate Visual Craft:** Implement a more refined visual design with precise padding, subtle shadows, and a new status indicator style to align with a high-craft aesthetic.

### 3. Scope & Key Initiatives

**Key Initiatives:**

1.  **Refactor `CheckCard` Component:** The component's JSX structure and CSS will be rewritten to implement the new two-row layout.
2.  **Develop `StatusBadge` Component:** A new, reusable `StatusBadge` will display the check's status, with variants aligned to the official PRD terminology.
3.  **Implement Granular Time Formatting:** The time display logic will be updated for precise relative times and will use tabular numerals.
4.  **Add Special Classification Indicator:** A material symbols icon (`warning`) will be displayed for checks with a `specialClassification`, linked to a tooltip.
5.  **Refine "Due Soon" Data State:** The data layer will be updated to provide a distinct `due-soon` status for the UI, as required by the business logic (Page 6, OG-PRD).
6.  **Implement List Grouping:** The `PriorityView` will be enhanced to display H1 Unit headers and H2 status group headers.
7.  **Define Interaction States:** Simple, high-craft hover and active states will be implemented.

**Out of Scope:**

*   Adding grouping headers to `ListView` or `CardView`, which are designed for continuous sorting. This feature is scoped to `PriorityView` only.
*   Project-wide migration of spacing units to `rem`. The project's established `var(--spacing-...)` token system (pixel-based) will be used for consistency.

### 4. UX/UI Specification & Wireframes

The user interface will be updated in two key areas: the list container and the card itself.

**Interaction Design:**

*   **Hover/Click:** Hovering an actionable card will deepen its `box-shadow` and apply `var(--surface-bg-primary_hover)`. Clicking initiates the check workflow.
*   **Special Classification:** The `warning` icon will trigger a `Tooltip` on hover (desktop) or tap (mobile).
*   **Time Display:** The countdown timer will use `font-variant-numeric: tabular-nums` to ensure stable character widths and prevent jitter.
*   **Spacing:** All new CSS will adhere to the project's existing `var(--spacing-...)` system to maintain architectural consistency.

#### ASCII Wireframes

**1. List Grouping (`PriorityView`)**

```
+----------------------------------------------------------------------+
| = Unit G =========================================================== |  <-- H1 Unit Header (.unitHeader)
+----------------------------------------------------------------------+

  -- Late ------------------------------------------------------------   <-- H2 Status Header (.priorityGroupHeader)

+----------------------------------------------------------------------+
| [I]                                                                  |
|    +-------------------------------------------+  +---------------+  |
|    |  ⚠️ RM 101                              |  | [    Late     ] |  |
|    +-------------------------------------------+  +---------------+  |
|    |  Eleanor Vance                            |  |  Overdue 1m   |  |
|    +-------------------------------------------+  +---------------+  |
+----------------------------------------------------------------------+

  -- Due Soon --------------------------------------------------------

+----------------------------------------------------------------------+
| [I]                                                                  |
|    +-------------------------------------------+  +---------------+  |
|    |    RM 102                                 |  | [  Due Soon   ] |  |
|    +-------------------------------------------+  +---------------+  |
|    |  Marcus Holloway                          |  |     1m 11s    |  |
|    +-------------------------------------------+  +---------------+  |
+----------------------------------------------------------------------+
```

**2. `CheckCard` Component Structure**

*Card states have been updated to reflect the official PRD terminology.*

```
+----------------------------------------------------------------------+
| [I]                                                                  |  <-- [I] .statusIndicator (absolute positioned)
|    +-------------------------------------------+  +---------------+  |
|    |  <S> RM 531                             |  | [ StatusBadge ] |  |  <-- .topRow (flex, space-between)
|    +-------------------------------------------+  +---------------+  |      <S> .specialClassification (optional icon)
|                                                                      |
|    +-------------------------------------------+  +---------------+  |
|    |  James Holden                             |  |     1m 11s    |  |  <-- .bottomRow (flex, space-between)
|    +-------------------------------------------+  +---------------+  |
|                                                                      |
+----------------------------------------------------------------------+

Styling Contract:
- Root Container:
  - background: var(--surface-bg-primary)
  - border-radius: var(--radius-md, 8px)
  - box-shadow: var(--surface-shadow-xs)
- .timeDisplay:
  - font-variant-numeric: tabular-nums;
```

**3. `StatusBadge` Component Variants (Aligned with OG-PRD)**

```
// Variant: Late
+-------------------+
|  🟠 Late          |  <-- bg: var(--surface-bg-warning), color: var(--surface-fg-warning-primary)
+-------------------+

// Variant: Due Soon
+-------------------+
|  🔵 Due Soon      |  <-- bg: var(--surface-bg-info), color: var(--surface-fg-info-primary)
+-------------------+

// Variant: Completed / Supplemental
+-------------------+
|  🟢 Completed     |  <-- bg: var(--surface-bg-success), color: var(--surface-fg-success-primary)
+-------------------+

// Variant: Due / Pending (Default)
+-------------------+
|  ⚪ Due            |  <-- bg: var(--utility-gray-50), border: var(--utility-gray-200)
+-------------------+
```

### 5. Architecture & Implementation Plan

1.  **Component: `CheckCard.tsx` [MODIFIED]**
    *   JSX rewritten for the two-row structure. The `specialClassification` icon will render conditionally, wrapped in a `Tooltip`.
    *   A new `formatCheckTime` utility will be created.
    *   The time display element will receive a new class to apply `tabular-nums`.

2.  **Component: `StatusBadge.tsx` [NEW]**
    *   A new component that accepts a `status` prop (`SafetyCheckStatus`).
    *   It will map status values (`late`, `due-soon`, etc.) to the correct display text and `data-status` attribute for styling.

3.  **Data Flow: `appDataAtoms.ts` [MODIFIED]**
    *   The `safetyChecksAtom` will be updated to produce a new `'due-soon'` status when a check enters the "Due Soon alert" window (e.g., within 2 minutes of the due time, as per Page 6 of OG-PRD).
    *   The `SafetyCheckStatus` type in `src/types.ts` will be updated to include `'due-soon'`.

4.  **View: `PriorityView.tsx` [MODIFIED]**
    *   This component, which uses `GroupedVirtuoso`, will be updated. A new, non-scrolling H1-level header will be added at the top to display the current Unit name.
    *   The existing `groupContent` prop will continue to render the H2-level status headers.
    *   The grouping logic will be verified to correctly handle the new `due-soon` status.

### 6. File Manifest

*   **/src/features/SafetyCheckSchedule/**
    *   `CheckCard.tsx` **[MODIFIED]** - Core component rewrite.
    *   `CheckCard.module.css` **[MODIFIED]** - Styles rewritten for new structure and tabular numbers.
    *   `StatusBadge.tsx` **[NEW]** - New component for status display.
    *   `StatusBadge.module.css` **[NEW]** - Styles for the new badge.
    *   `PriorityView.tsx` **[MODIFIED]** - Add H1 Unit header and ensure H2 grouping is correct.
    *   `layouts.module.css` **[MODIFIED]** - Add styles for the new H1 `.unitHeader`.
    *   `ListView.tsx` `[REFERENCE]`
    *   `CardView.tsx` `[REFERENCE]`
*   **/src/data/**
    *   `appDataAtoms.ts` **[MODIFIED]** - Update derived atom logic for `due-soon` status.
*   **/src/types.ts**
    *   `index.ts` (or equivalent) **[MODIFIED]** - Add `'due-soon'` to `SafetyCheckStatus` type.
*   **/src/components/**
    *   `Tooltip.tsx` `[REFERENCE]`

### 7. Unintended Consequences Check

*   **`PriorityView.tsx`**: The grouping logic is now more critical. The `groupOrder` array must be updated to correctly sequence the new `due-soon` status relative to `late` and `pending`.
*   **`types.ts`**: Changing `SafetyCheckStatus` requires a global check for any `switch` statements or object maps that use this type to ensure the `'due-soon'` case is handled.

### 8. Risks & Mitigations

*   **Risk:** Performance degradation from more complex rendering.
    *   **Mitigation:** `react-virtuoso` remains the primary safeguard. All derived calculations will be memoized with `useMemo`. The grouping logic will be kept efficient.
*   **Risk:** Visual inconsistency if the hardcoded "Unit G" header is not eventually replaced with dynamic data.
    *   **Mitigation:** The implementation will use a placeholder but will be structured to easily accept a dynamic unit name prop once the underlying data model supports it. This is an acceptable intermediate step.

### 9. Definition of Done

*   [ ] The `CheckCard` component's visual layout and styling match the ASCII wireframes.
*   [ ] All status variants (`Late`, `Due Soon`, `Completed`, etc.) render correctly via the new `StatusBadge` component.
*   [ ] The time display uses `tabular-nums` and does not jitter during countdowns.
*   [ ] The "special classification" icon (`warning`) appears and triggers a tooltip with details.
*   [ ] The `PriorityView` correctly displays a static H1 "Unit" header above the list.
*   [ ] The `PriorityView` correctly groups checks under H2 status headers, including the new "Due Soon" group.
*   [ ] The `SafetyCheckStatus` type is updated, and all consuming logic is verified.
*   [ ] The solution remains architecturally consistent, using the project's established `var(--spacing-...)` token system.