## PRD 4: Performance & Architecture Refactor
**Focus:** Optimization, Data Persistence, and State Library Strategy.

### 1. Overview
This PRD addresses the "under the hood" improvements required to make the prototype feel native (60fps) and persist data like a real app. It also defines the evaluation criteria for the state library.

### 2. Problem & Goals
**Problem:** `useCountdown` causes excessive re-renders (one RAF loop per row). Data is lost on reload. Filtering logic is naive.
**Goals:**
*   Achieve 60fps scrolling even with active timers.
*   Persist user session and view preferences across reloads.
*   Optimize data derivation.
*   Establish a stance on State Management libraries.

### 3. Scope & Key Initiatives
*   **Centralized Heartbeat:** Replace per-component RAF with a single `globalTimerAtom` that ticks every 1s (or 100ms). Components subscribe to this atom.
*   **Persistence:** Wrap `appConfigAtom`, `sessionAtom`, and `appViewAtom` with `atomWithStorage` to persist to `localStorage`.
*   **Derivation Optimization:** Refactor `appDataAtoms.ts`. Split the search logic so it only runs when the search query *changes*, not when unrelated atoms update.
*   **State Library Evaluation:** (Documentation Task) Compare Jotai vs. Zustand/XState for this specific use case.
    *   *Verdict:* Jotai is actually ideal for this "atomic" prototype. Switching to Zustand (Global Store) would require a total rewrite. The performance issues are due to implementation (naive derivation), not the library. We will stick with Jotai but optimize it.

### 4. Architecture & Implementation Plan
*   **Heartbeat:**
    ```typescript
    // src/data/timerAtoms.ts
    export const nowAtom = atom(Date.now());
    // In App.tsx, one useEffect updates this atom.
    ```
*   **Countdown Hook:** Update `useCountdown` to read `useAtomValue(nowAtom)` instead of creating its own local state/effect.

### 5. File Manifest
*   `src/data/atoms.ts` `[MODIFIED]` (Add persistence)
*   `src/data/useCountdown.ts` `[MODIFIED]` (Refactor to use global atom)
*   `src/App.tsx` `[MODIFIED]` (Add global timer loop)
*   `src/data/appDataAtoms.ts` `[MODIFIED]` (Optimize filter chains)

### 6. Unintended Consequences Check
*   **Persistence:** Ensure "Offline" status is *not* persisted. The app should always start "Online" or check real status on boot.
*   **Timers:** A global atom update causes all subscribers to re-render. Ensure `CheckCard` is wrapped in `memo` so it only re-renders if *its* specific countdown string changes (which it will every second/minute).

### 7. Risks & Mitigations
*   **Risk:** Global timer might trigger too many re-renders if not handled carefully.
*   **Mitigation:** The timer is only needed for "Pending/Due Soon/Late" items. Completed items should not subscribe.

### 8. Definition of Done
*   Application retains "List View" setting after reload.
*   Performance profiling shows reduced CPU usage on the Schedule list.
*   Architecture document updated with State Library decision (Stick with Jotai + Optimizations).