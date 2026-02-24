# Implementation Plan: Offline Check Time Estimation

Add an "Estimated" time display for checks completed while offline (queued status). The time will be shown in italics with a `cloud_off` icon that provides a tooltip explanation.

## User Review Required

> [!IMPORTANT]
> The text **"Estimated in"** will be used preceding the relative time for offline checks. The `share_eta` icon will also be present, providing a tooltip explanation when tapped/hovered.

### Type System

#### [MODIFY] [types.ts](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/types.ts)
- Add `isEstimated?: boolean` to the `SafetyCheck` interface.

### Data & Atoms

#### [MODIFY] [appDataAtoms.ts](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/data/appDataAtoms.ts)
- Pass current connection status to `generateNextCheck`.
- Set `isEstimated: true` on the generated check if the app is currently `offline`.

### Schedule Feature

#### [MODIFY] [CheckCard.tsx](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/features/Schedule/CheckCard.tsx)
- Allow the time display to show for checks with `queued` status.
- Add logic to render the `share_eta` icon within a `Tooltip` if the check is `isEstimated`.
- Prefix the time display with **"Estimated in "** when `isEstimated`.
- Apply a `isEstimated` class to the time display when `isEstimated`.

#### [MODIFY] [CheckCard.module.css](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/features/Schedule/CheckCard.module.css)
- Add styles for the `isEstimated` state (italic text).
- Style the `share_eta` icon alignment within the time display.
- Ensure the italic style is applied specifically to the countdown text when `isEstimated`.

#### [MODIFY] [useCountdown.ts](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/data/useCountdown.ts)
- Update `isActionable` to include the `queued` status so it returns a formatted relative time for these checks.

---

## Verification Plan

### Manual Verification
1. **Trigger Offline State**: Use the `OfflineToggleFab` to put the app in offline mode.
2. **Complete a Check**: Scan a tag or manually complete a check.
3. **Verify Queue Position**: The completed check should move to the "queued" section (usually at the bottom or end of the list depending on sorting).
4. **Inspect Time Display**:
   - Verify the time is shown in **italics**.
   - Verify the `share_eta` icon appears to the left of the time.
5. **Test Tooltip**:
   - Hover (on desktop) or Tap (on mobile simulation) the `cloud_off` icon.
   - Verify the tooltip text: *"This check time has been calculated based on the last completed check. The actual check time on the server may differ."*
6. **Go Online**: Toggle the connection back to online.
   - Verify the "Queued" status changes to "Completed" and the estimated time display disappears (as terminals states usually don't show it).
