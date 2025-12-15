# JumpFAB & Global Visibility Architecture Refinement

## Goal Description
The `JumpFAB` (Missed Checks Button) and potentially other floating UI elements need to be aware of the global interface state. Currently, the FAB overlaps with the Side Menu, Settings Modals, and Action Sheets, creating a cluttered and unpolished experience.

This plan introduces a centralized hook `useGlobalOverlayState` to manage "Main View Visibility" logic, ensuring that floating elements retreat when the user's focus is demanded by an overlay, menu, or modal.

## User Review Required
> [!NOTE]
> This architectural change introduces a single source of truth for "Is the dashboard obscured?". This pattern should be adopted for future global floating elements (e.g., global toasts, chat widgets) to maintain a clean UI.

## Proposed Changes

### 1. New Hook: `useGlobalOverlayState`
Create `src/hooks/useGlobalOverlayState.ts`.
This hook will aggregate all atoms that represent a "modal" or "overlay" state.

**State Sources:**
- **Navigation**: `appViewAtom` (specifically when === `'sideMenu'`)
- **Modals**:
  - `isSettingsModalOpenAtom`
  - `isDevToolsModalOpenAtom`
  - `isFutureIdeasModalOpenAtom`
  - `isUserSettingsModalOpenAtom`
  - `isContextSelectionModalOpenAtom`
- **Sheets/Action Views**:
  - `isManualCheckModalOpenAtom` (Vaul Drawer)
  - `workflowStateAtom` (specifically `view !== 'none'`) - *Already handled in JumpFAB, but good to double-check if we want it here.*

**Hook Contract:**
```typescript
export const useGlobalOverlayState = () => {
    // ... subscribes to all atoms ...
    return {
        isOverlayActive: boolean; // True if ANY modal/menu is open
        activeOverlay: string | null; // Optional: debug info ('sideMenu', 'settings', etc.)
    };
}
```

### 2. Refactor `JumpFAB.tsx`
Update `src/features/LateEffects/JumpFAB.tsx` to utilize `useGlobalOverlayState`.

**Logic Update:**
```typescript
const { isOverlayActive } = useGlobalOverlayState();
// ...
if (!feat_jump_fab || lateCount === 0 || isOverlayActive) {
    return null;
}
```

### 3. Cleanup
- Verify `VignetteOverlay` does *not* need this check (it is an atmospheric effect that should likely persist or fade, but it is `pointer-events: none` so less critical. Decision: Keep it independent for now to maintain "urgent" atmosphere even if menu is open, or hide it? *Refinement*: The vignette is an "App Shell" level effect. It might look weird over the side menu. We should probably apply the same logic to specific high-z-index atmospheric effects if they interfere with legibility, but let's stick to the requested FAB scope first.)

## Affected Files
#### [NEW] [useGlobalOverlayState.ts](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/hooks/useGlobalOverlayState.ts)
#### [MODIFY] [JumpFAB.tsx](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/features/LateEffects/JumpFAB.tsx)

## Verification Plan

### Manual Verification Matrix
| Action | Expected FAB State |
| :--- | :--- |
| **Default Dashboard** (with Missed Checks) | **Visible** |
| Open **Side Menu** | **Hidden** |
| Open **Settings Modal** | **Hidden** |
| Open **Dev Tools** | **Hidden** |
| Open **Future Ideas** | **Hidden** |
| Open **Manual Check Sheet** (+ Button) | **Hidden** |
| Open **Facility Selection** | **Hidden** |
| **Drill Down** into Check Form | **Hidden** |
