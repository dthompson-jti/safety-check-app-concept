# PRD-007: Mark Multiple Workflow Evolution

## 1. Overview
The "Mark Multiple" feature in the Check Entry workflow will be evolved from an in-line segmented control to a two-step workflow using a modal sheet. This change accommodates a flexible number of status options (up to 7) and provides a better touch target experience. Additionally, developer tools will be updated to configure the number of statuses and their layout (list vs. grid).

## 2. Problem & Goals

### Problem
The current "Mark Multiple" implementation uses a segmented control which becomes cramped and unusable as the number of status options increases. We need to support up to 7 distinct statuses for different facility types, which cannot fit in a single row on mobile screens.

### User Stories
- **As a User**, I want to quickly mark all residents in a room with a single status so that I can complete checks faster when everyone has the same status.
- **As a User**, I want a clear interface to select from many status options without accidental taps.
- **As a Developer**, I want to configure the number of available statuses (2-7) and their layout logic to stress-test the UI.

### Success Metrics
- **Efficiency**: Users can mark all residents with 2 taps (Open Sheet -> Select Status).
- **Usability**: Zero UI breakage or overflow when 7 statuses are enabled in grid mode.
- **Error Rate**: Reduction in accidental status selection compared to a crowded segmented control.

## 3. Scope & Key Initiatives

### In Scope
- **Check Entry View**: Replace in-line "Mark all" control with a "Mark All" secondary button.
- **Modal Sheet**: Create a new `StatusSelectionSheet` component (or genericize existing) to display status options.
- **Developer Tools**:
    - Update "Resident status options" to support range 2-7.
    - Add "Status Layout" setting (Column vs. Grid).
    - Implement "dead-cell" logic for grid layout with odd numbers.

### Out of Scope
- Changes to the individual `ResidentCheckControl` logic (other than receiving the bulk update).
- Persisting these developer settings across sessions (already handled by local storage/atoms, but not a new requirement to build persistence infrastructure).

## 4. UX/UI Specification

### Mark All Button
- **Placement**: Replaces the current "Mark all residents" segmented control.
- **Style**: Secondary Button (`variant="secondary"`).
- **Label**: "Mark All"
- **Icon**: Optional, but standard "checklist" or "done_all" icon could work.
- **Action**: Opens the Status Selection Sheet.

### Status Selection Sheet
- **Behavior**: Standard bottom modal sheet, similar to Facility Selector.
- **Content**: List or Grid of status buttons.
- **Interaction**: Single tap on a status:
    1.  Updates all residents in the current check to that status.
    2.  Closes the sheet.
    3.  Returns to `CheckEntryView`.

### Layout Configurations (Dev Tools)
1.  **Column (List)**: Vertical stack of buttons.
2.  **Grid**: 2-column grid.
    - **Odd Number Handling**: If the number of items is odd (e.g., 3, 5, 7), the last cell in the row (or a specific cell) is a "dead-cell" to maintain grid structure (or just fill the space).
    - **Visual**: Dead cells use `bg-tertiary` and are not interactive.

## 5. Architecture & Implementation

### Components
- **`CheckEntryView.tsx`**:
    - Remove `SegmentedControl` for mark multiple.
    - Add "Mark All" button.
    - Add state/logic to show/hide `StatusSelectionSheet`.
- **`StatusSelectionSheet.tsx` (New)**:
    - Props: `options`, `layout` ('column' | 'grid'), `onSelect`, `onClose`.
    - Renders buttons based on layout.
    - Handles "dead-cell" rendering for grid layout.
- **Dev Tools (`DeveloperModal.tsx`)**:
    - Update `Resident status options` to generic slider/stepper (2-7).
    - Add `Status Layout` toggle (Column/Grid).

### Data Flow
1.  User clicks "Mark All".
2.  `CheckEntryView` keeps local state `showStatusSheet`.
3.  Sheet renders using `markMultipleOptions` from `appConfig`.
4.  User selects status.
5.  `handleApplyAll(status)` is called.
6.  Sheet closes.

### State Management
- `appConfigAtom`:
    - Update type of `residentStatusSet` to allow numerical sets or keys for 2-7.
    - Add `markMultipleLayout`: 'column' | 'grid'.

## 6. File Manifest

### New Files
- `src/features/Workflow/StatusSelectionSheet.tsx` [NEW]
- `src/features/Workflow/StatusSelectionSheet.module.css` [NEW]

### Modified Files
- `src/features/Workflow/CheckEntryView.tsx` [MODIFIED]
- `src/features/Workflow/CheckEntryView.module.css` [MODIFIED]
- `src/features/Overlays/DeveloperModal.tsx` [MODIFIED]
- `src/data/types.ts` [MODIFIED]

## 7. Unintended Consequences
- **Accessibility**: Ensure the modal focuses correctly and announces itself.
- **Mobile Viewport**: Ensure the sheet doesn't conflict with the address bar or bottom nav gestures (safe area).

## 8. Risks & Mitigations
- **Risk**: "Dead cell" logic might be confusing if not visually distinct.
    - **Mitigation**: Use `bg-tertiary` and clearly disable interaction.

## 9. Definition of Done
- [ ] "Mark All" button replaces segmented control.
- [ ] Clicking "Mark All" opens sheet.
- [ ] Sheet displays correct options based on Dev Config.
- [ ] Developer Tools allow selecting 2-7 statuses.
- [ ] Developer Tools allow toggling Column/Grid.
- [ ] Grid layout shows "dead cell" for empty slots.
- [ ] Selecting a status updates all, closes sheet.
