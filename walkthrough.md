# Walkthrough - Disabling Live View (Read-Only Mode) by Default

The application default mode has been updated to be interactive upon first load, effectively "turning off" the default Read-Only (Monitor) state.

## Changes

### 1. Configuration Update
Modified `src/data/atoms.ts` to set the default value of `isViewOnlyMode` to `false` in the `appConfigAtom`. This ensures that new users (or users with cleared storage) will land in the interactive "Action Mode" where they can perform safety checks.

### 2. Version Bomb Increment
To ensure these changes apply to current active sessions and local development environments, I've incremented the internal `APP_VERSION` from `v5` to `v6` in `src/main.tsx`. This triggers a one-time `localStorage.clear()` upon the next application load, forcing the app to pick up the new configuration defaults.

### 3. Visual Version Update
Updated the visual version in `src/config.ts` from `v4.42` to `v4.43` for consistency and tracking.

## Verification Results

- **Linting**: Passed successfully (`npm run lint`).
- **Logic**: 
    - `isViewOnlyMode: false` correctly enables the "Scan" action in the footer.
    - `APP_VERSION: v6` ensures existing states are reset to the new default.

The application should now load in interactive mode by default.
