# Implementation Plan - View Only Mode

## User Story
As a Supervisor, I want to view the status of all checks without being able to modify them, so I can monitor progress without interfering with operations.

## Technical Tasks

### 1. State Management
- [ ] Add `isViewOnlyMode` boolean to `appConfigAtom` in `src/data/atoms.ts`. Default to `true`.

### 2. Footer Updates (Mode Bar)
- [ ] Update `AppFooter.module.css` with `.viewOnlyBar`:
    ```css
    .viewOnlyBar {
      width: 100%;
      height: var(--footer-action-height);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      border-radius: var(--spacing-3);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      background-color: var(--surface-bg-tertiary);
      color: var(--surface-fg-secondary);
      border: 1px solid var(--surface-border-secondary);
      user-select: none;
      cursor: default;
    }
    ```
- [ ] Update `AppFooter.tsx` to conditionally render this bar when `isViewOnlyMode` is true.

### 3. Schedule List Updates
- [ ] Update `CheckCard.tsx`:
    -   Add `isReadOnly` prop.
    -   Disable `onClick` and `whileTap` when true.
    -   Ensure `cursor` is reset.
- [ ] Update `ScheduleView.tsx`:
    -   Pass `isReadOnly={isViewOnlyMode}` to all `CheckCard` instances.

## Verification
-   **Layout**: Verify Mode Bar is exactly aligned with where the button would be.
-   **Semantics**: Confirm "Visibility" icon is used.
-   **Tokens**: specific usage of `surface-bg-tertiary` (Grey 40).
