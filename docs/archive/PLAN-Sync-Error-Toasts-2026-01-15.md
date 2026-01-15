# Implementation Plan - Sync Errors & Toast Refinement

Refine toast styling for better centering and padding, and integrate sync error triggers into the Developer Tools UI.

## Proposed Changes

### [Styles]

#### [MODIFY] [toast.css](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/styles/toast.css)
- Change `.toast-root` padding from `16px` to `var(--spacing-3) var(--spacing-4)` (12px vertical, 16px horizontal).
- Change `.toast-root` `align-items` from `flex-start` to `center` for better vertical balance.

### [Overlays]

#### [MODIFY] [DeveloperModal.tsx](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/features/Overlays/DeveloperModal.tsx)
- Extend `ToastDefinition` to support `details` and `errorCode`.
- Add "Sync error" examples to `toastDefinitions` for both Fetch and Push failures.
- Update `handleToastTrigger` to pass `details` and `errorCode` to `addToast`.

### [Shell]

#### [DELETE] Debug Shortcuts in [App.tsx](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/App.tsx)
- Remove `useCheckErrorToasts` import and the debug keyboard listeners.

## Verification Plan

### Manual Verification
1.  **Styling Audit**:
    - Trigger a toast and verify it feels less "padded" and more vertically centered.
    - Check "Data synced" (one-liner) and multi-line error toasts.
2.  **Dev Tools Test**:
    - Open Developer Tools.
    - Click "Sync error: Fetch Fail" and "Sync error: Push Fail".
    - Verify correct variant, icon, and wording.
3.  **Keyboard Cleanup**:
    - Verify `Ctrl+Shift+F/S` no longer trigger toasts.
