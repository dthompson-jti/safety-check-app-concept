Of course. Based on your feedback and our deep analysis, here is the formal Product Requirements Document (PRD) to guide the development of this high-craft feature enhancement.

---

## **PRD: Progressive Discovery Search & Unified List Component**

**Version:** 1.0
**Date:** 2025-11-14
**Author:** Gemini Agent

### 1. Overview

This document outlines a high-craft refactoring initiative focused on two key areas: the user experience of in-app search and the architectural consistency of our list-based UI. We will introduce a "Progressive Discovery" search pattern to eliminate frustrating user dead ends. Simultaneously, we will create a new, reusable `ListItem` component to unify the presentation of complex list data, resolving UI inconsistencies and establishing a robust blueprint for all future list-based interfaces.

### 2. Problem & Goals

The application currently suffers from two distinct but related issues that detract from a high-craft user experience.

**Problems:**
*   **Search Dead Ends:** When a user's search within a bottom sheet (e.g., `ManualSelectionView`) yields no results in their current operational context (their assigned unit), the UI presents a hard "No results" message. This is a frustrating dead end if the desired item exists elsewhere in the facility.
*   **UI Inconsistency:** The list items within the `ManualCheckSelectionModal` feel "wonky" and "janky" because they use a custom, one-off structure forced inside a generic `.menu-item` style. This creates visual disharmony and makes it a poor architectural blueprint for other components like the `WriteNfcTagModal`.

**Goals:**
*   **Eliminate Search Friction:** Replace search dead ends with a helpful, context-aware continuation flow.
*   **Establish a Superior Search Pattern:** Implement "Progressive Discovery" as the standard for all contextual search operations.
*   **Enforce Architectural Consistency:** Create a single, robust, and reusable `ListItem` component to serve as the single source of truth for complex list item presentation.
*   **Harmonize Core Components:** Ensure the `ManualCheckSelectionModal` and `WriteNfcTagModal` are visually and architecturally aligned, sharing the exact same high-craft components and UX patterns.

### 3. Scope & Key Initiatives

**Key Initiatives:**
1.  **Implement Progressive Discovery Search:** Refactor the search logic in contextual bottom sheets to perform a secondary, global search if the primary contextual search fails, and present the user with an option to expand their results.
2.  **Create a Reusable `ListItem` Component:** Develop a new, flexible `ListItem.tsx` component designed to handle titles, subtitles, and icons with a consistent, polished appearance.
3.  **Refactor Core Modals:** Update both `ManualCheckSelectionModal` and `WriteNfcTagModal` to use the new `ListItem` component for their selection lists, ensuring they are perfectly harmonized.

**Out of Scope:**
*   Auditing or refactoring any other search instances outside of the specified bottom sheets.
*   Implementing server-side logging or special business logic for cross-unit selections at this time.
*   Changing the core data source or the `react-virtuoso` implementation.

### 4. UX/UI Specification & Wireframes

#### **Progressive Discovery in `NoSearchResults` Component**

*   **Interaction:** When a contextual search yields no results but a global search does, the `NoSearchResults` component will render a button offering to show the global results. Tapping this button will replace the empty state with the list of global results.

*   **ASCII Wireframe (`NoSearchResults.tsx` - New State):**
    ```
    +-------------------------------------------------+
    |                                                 |
    |         [ Large Feature Icon: search_off ]      |
    |                                                 |
    |    No results for "Gryffindor" in this unit     |
    |      <-- margin-top: var(--spacing-4) -->       |
    |                                                 |
    |   +-----------------------------------------+   |
    |   | [Icon] Show 3 results in all other units|   | <--- Button (variant: tertiary)
    |   +-----------------------------------------+   |
    |                                                 |
    +-------------------------------------------------+
    Container uses flexbox for center alignment.
    Text uses var(--surface-fg-secondary) for color.
    ```

#### **New `ListItem` Component**

*   **Anatomy:** A flexible component designed to replace the inconsistent use of `.menu-item`. It will have a base style (`.list-item`) that handles hover, active, and focus states consistently.

*   **ASCII Wireframe (`ListItem.tsx` - Variants):**
    ```
    // Variant 1: Simple (for WriteNfcTagModal)
    +------------------------------------------------------------------+
    | [Icon (optional)]    Room 101                                    |  <-- Title (font-weight: 600)
    +------------------------------------------------------------------+
    Uses `.list-item` class for background, padding, and interaction states.

    // Variant 2: With Subtitle (for ManualCheckSelectionModal)
    +------------------------------------------------------------------+
    | [Icon (optional)]    Gryffindor Tower                            |  <-- Title
    |                      Harry Potter, Hermione Granger              |  <-- Subtitle (color: var(--surface-fg-secondary))
    +------------------------------------------------------------------+
    Container is a flex column with a gap of var(--spacing-1).
    ```

### 5. Architecture & Implementation Plan

1.  **Data Flow Refactor (Jotai):**
    *   The `filteredChecks` atom in `ManualSelectionView` will be enhanced. If its primary filter (against `contextFilteredChecksAtom`) returns an empty array, it will trigger a secondary filter against the global `safetyChecksAtom`.
    *   A new derived atom, `globalSearchResultsAtom`, will be created to store the results and count of this secondary search.
    *   The `NoSearchResults` component will be modified to accept props from this new atom and conditionally render the "Progressive Discovery" button.

2.  **Component Architecture (`ListItem`):**
    *   Create two new files: `src/components/ListItem.tsx` and `src/components/ListItem.module.css`.
    *   The component will accept props such as `title: string`, `subtitle?: string`, `icon?: string`, `onClick: () => void`, and `isActive?: boolean`.
    *   The styling in `ListItem.module.css` will define the base layout, typography, and interaction states, ensuring it aligns visually with the existing `.menu-item` hover/active feedback.

3.  **Integration:**
    *   In `ManualCheckSelectionModal.tsx`, the `<Virtuoso>` `itemContent` will be updated to render `<ListItem>` instead of a raw `<button>`. The `title` will be the location, and `subtitle` will be the joined resident names.
    *   In `WriteNfcTagModal.tsx`, the `.map()` function rendering the list will also be updated to use `<ListItem>`, passing only the `title` prop (the location name).

### 6. File Manifest

*   `/src/components/ListItem.tsx` `[NEW]`
*   `/src/components/ListItem.module.css` `[NEW]`
*   `/src/components/EmptyStateMessage.tsx` `[MODIFIED]` (To accept new props and render the discovery button)
*   `/src/features/Overlays/ManualSelectionView.tsx` `[MODIFIED]` (Integrate `ListItem` and new search atoms)
*   `/src/features/Overlays/ManualSelectionView.module.css` `[MODIFIED]` (Remove old custom room item styles)
*   `/src/features/Overlays/WriteNfcTagModal.tsx` `[MODIFIED]` (Integrate `ListItem`)
*   `/src/data/appDataAtoms.ts` `[MODIFIED]` (Update/add derived atoms for dual-phase search logic)
*   `/src/data/atoms.ts` `[REFERENCE]` (Context for state management)
*   `/src/styles/menu.css` `[REFERENCE]` (Visual style guide for interaction states)

### 7. Unintended Consequences Check

*   **Global State:** The changes involve creating new derived Jotai atoms, which is a safe pattern. We are only *reading* from the base `safetyChecksAtom`, not writing to it, so the risk of data corruption is zero.
*   **Global CSS:** The new `.list-item` class in `ListItem.module.css` will be locally scoped via CSS Modules, preventing any risk of collision with global styles.
*   **Component Contracts:** The `NoSearchResults` component's props will change. We must ensure any other places it's used are updated or provided with default values to prevent breaking changes.

### 8. Risks & Mitigations

1.  **Risk:** The dual-phase search (contextual then global) could introduce a slight performance lag on very large datasets or slow devices.
    *   **Mitigation:** The global search is only triggered *after* the primary, scoped search fails, meaning it doesn't run on every keystroke. For a production environment, this logic could be further optimized with debouncing.
2.  **Risk:** The new `ListItem` component could have subtle visual inconsistencies with the existing `.menu-item`.
    *   **Mitigation:** The developer must perform a thorough visual review, placing the new `ListItem` and an existing `.menu-item` (from a dropdown) side-by-side to ensure perfect alignment of colors, fonts, padding, and interaction feedback.

### 9. Definition of Done

*   [ ] The new, reusable `<ListItem>` component is created and fully functional.
*   [ ] Both `ManualCheckSelectionModal` and `WriteNfcTagModal` exclusively use the new `<ListItem>` component for their lists.
*   [ ] The "janky" appearance of the list in `ManualCheckSelectionModal` is eliminated.
*   [ ] When searching in `ManualCheckSelectionModal`, if no results are found in the current unit but exist globally, the "Show results in other units" button appears.
*   [ ] Tapping this button correctly populates the list with the global search results.
*   [ ] The entire feature is visually polished, architecturally sound, and introduces no regressions.