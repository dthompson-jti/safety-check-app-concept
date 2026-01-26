# VPN Error Simulation Implementation Plan (v2)

Show the VPN "Access Denied" error on the login screen using a toast notification instead of a full-screen blocking page.

## Proposed Changes

### Session Feature

#### [MODIFY] [LoginView.tsx](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/features/Session/LoginView.tsx)
- Inject `addToastAtom`.
- Update `jsiemens` / `VPN` login logic:
    - Remove the trigger for `blockingErrorTypeAtom`.
    - Dispatch an `alert` variant toast with the `vpn_lock` icon.
    - Message: `Access Denied`
    - Details: `VPN connection required. Please ensure you are connected to the clinical network and try again.`
    - Use a `stableId` (e.g., `vpn-error`) to prevent duplicate toasts if clicked repeatedly.
    - Set `persistent: true` to ensure the user has time to read it.

## Verification Plan

### Manual Verification
1.  **Trigger Error**:
    - Enter Username: `jsiemens`
    - Enter Password: `VPN`
    - Click "Log In".
    - **Expected**: A red toast appearing at the bottom of the screen with the "Access Denied" message and VPN icon. The login card should remain visible and interactive.
2.  **Normal Login**:
    - Verify that normal login (e.g., `dthompson` / `test`) still works correctly and doesn't trigger a toast error.
