# Walkthrough - Offline Check Time Estimation Display

Implemented a visual indicator for safety checks that are generated and scheduled while the application is in an offline state. These checks are now clearly marked as "Estimated" to reflect that their timing is based on local calculations rather than server-side confirmation.

## Changes

### 1. Data Model
Added an `isEstimated` boolean flag to the `SafetyCheck` interface in `src/types.ts`. This allows us to persist the "estimated" status of a check throughout its lifecycle, ensuring the label remains even if the app returns to an online state.

### 2. Data Layer Logic
Updated the `appDataAtom` reducer and the `generateNextCheck` utility in `src/data/appDataAtoms.ts` to subscribe to the current `connectionStatusAtom`. When a new check is generated (after a completion or a missed event) while the app is `offline`, the `isEstimated` flag is now automatically set to `true`.

### 3. Countdown Loop
Modified the `useCountdown` hook in `src/data/useCountdown.ts` to recognize `queued` checks as "actionable." This ensures that checks sitting in the offline sync queue still show a dynamically updating relative time display.

### 4. UI Rendering
Refined the `CheckCard` component in `src/features/Schedule/CheckCard.tsx` and its associated CSS module:
- Checks flagged with `isEstimated: true` now display the prefix **"Estimated in"** before the relative time.
- The entire time display for estimated checks is styled with **italics** for distinct visual separation.
- Ensured a clean layout by removing unnecessary icons and relying on clear text and typography.

## Verification Results

- **Technical Build**: Passed successfully (`npm run build`).
- **Functional Testing**:
    - Triggered offline mode via `OfflineToggleFab`.
    - Performed checks and verified that the next generated checks were correctly flagged as estimated.
    - Verified that "Queued" items in the schedule show the italicized "Estimated in" time.
    - Verified that the status remains consistent even after toggling back to online mode until the check is formally completed.
- **Linting**: Passed with no new errors introduced.
