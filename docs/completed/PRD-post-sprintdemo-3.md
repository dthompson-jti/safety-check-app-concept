## PRD 3: Robust Offline & Connectivity Experience
**Focus:** Overhauling the offline visualization to be more informative and high-craft, removing "toast spam."

### 1. Overview
We are moving from a generic "Offline" banner to a rich status display that builds trust. Users need to know *how long* they've been offline and *how many* items are waiting to sync.

### 2. Problem & Goals
**Problem:** The current offline experience is generic. "Queued" toasts are annoying.
**Goals:**
*   Provide a detailed, high-craft Offline Header.
*   Remove the "Queued" pill from the app status bar (it moves to the header).
*   Eliminate "Check Queued" toasts.

### 3. Scope & Key Initiatives
*   **Offline Banner Overhaul:** Redesign to be 2 lines.
    *   Line 1: "Offline for X min" (Status)
    *   Line 2: "5 items queued" (Summary) + "Sync Now" (Action).
*   **Timer Logic:** Introduce `offlineSinceAtom` to track duration.
*   **Status Bar Cleanup:** Remove the "Queued" pill from `StatusOverviewBar`.
*   **Toast Cleanup:** Suppress toasts for offline saves.
*   **Hardware Simulation:** Add DevTool toggles for "Simulate Hardware Failure" (Camera/NFC).

### 4. UX/UI Specification & Wireframes

**A. Offline Banner (`OfflineBanner.tsx`)**
```text
+-------------------------------------------------------+
| [Cloud_Off]  Offline for 12m                          |
|              3 checks queued             [Sync Now]   |
+-------------------------------------------------------+
 ^ Container: bg-surface-bg-secondary-solid
   Text: fg-on-solid-faint
   Layout: Flex column or Grid
```

### 5. Architecture & Implementation Plan
*   **State:** Update `connectionStatusAtom`. When status changes to 'offline', set a `offlineTimestampAtom` to `Date.now()`.
*   **Ticker:** The banner needs a `setInterval` to update the "Offline for X min" text dynamically.
*   **Toast Logic:** In `CheckFormView`, wrap the `addToast` call in a conditional check: `if (status !== 'offline') addToast(...)`.

### 6. File Manifest
*   `src/features/Shell/OfflineBanner.tsx` `[MODIFIED]` (Complete rewrite)
*   `src/features/Shell/OfflineBanner.module.css` `[MODIFIED]`
*   `src/features/Shell/StatusOverviewBar.tsx` `[MODIFIED]` (Remove queued pill)
*   `src/features/Workflow/CheckFormView.tsx` `[MODIFIED]` (Suppress toast)
*   `src/features/Overlays/DeveloperOverlay.tsx` `[MODIFIED]` (Add hardware fail toggles)
*   `src/data/atoms.ts` `[MODIFIED]` (Add timestamp atom)

### 7. Unintended Consequences Check
*   **Layout Shift:** The 2-line banner is taller than the old one. Ensure `FloatingHeader` variable height calculation handles this dynamic change smoothly so content doesn't jump.

### 8. Risks & Mitigations
*   **Risk:** "Sync Now" might be clicked repeatedly.
*   **Mitigation:** Debounce the button and show a spinning state immediately.

### 9. Definition of Done
*   Offline banner shows time elapsed and queue count.
*   No "Queued" pill in the status bar.
*   No toasts appear when saving offline.
*   DevTools can simulate camera failure (rendering a "Camera Error" state in ScanView).

---

