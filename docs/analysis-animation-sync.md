# Animation Synchronization Analysis & Options

## Problem Diagnosis: The "Sync Nightmare"

The current implementation uses `useEpochSync` to calculate a negative `animation-delay` based on `document.timeline.currentTime`. This approach is theoretically sound but practically flawed due to **Execution-to-Paint Latency**.

### Why it drifts/thumps:
1.  **Race Condition**: React calculates the `phase` (delay) in JavaScript at Time `T_calc`.
2.  **Paint Delay**: The browser paints the frame and starts the CSS animation at Time `T_start`.
3.  **The Gap**: `T_start` is always slightly later than `T_calc` (by 16-50ms depending on frame load).
4.  **Result**: The animation starts with a delay calculated for `T_calc`, but applies it at `T_start`. This introduces a permanent offset of `T_start - T_calc`.
5.  **Inconsistency**: Since `T_start - T_calc` varies per component mount (heavy load = larger gap), every card and header ends up with a unique, random offset, causing the "shimmer/drift" effect.

## Proposed Options

### Option 1: Web Animations API (WAAPI) Direct Sync (Recommended)
Use the browser's native animation engine to force synchronization. Instead of calculating offsets, we grab the running animation reference and forcefully set its `startTime` to a global constant value (e.g., 0).

*   **Mechanism**: A React hook `useSyncedRef()` that gets the element's animations and sets `anim.startTime = 0`.
*   **Pros**: 
    *   **Perfect Sync**: The browser acts as if *all* animations started at the exact same millisecond (document creation time).
    *   **Robust**: Immune to lag, frame drops, or mount timing.
    *   **High Performance**: No ongoing JS loops.
*   **Cons**:
    *   **Ref Overhead**: Requires attaching a `ref` to every syncing element (Header, Footer, every Card).
    *   **Boilerplate**: Slight increase in JSX complexity (`ref={syncRef}`).

### Option 2: The "Nuclear" Option (RAF-Driven CSS Variable)
Use a single global mechanism to update a CSS variable 60 times per second to drive the animation "progress".

*   **Mechanism**: A `requestAnimationFrame` loop updates `--anim-tick` from 0.0 to 1.0 on `document.body`. Elements use `animation-delay: calc(var(--anim-tick) * -1.2s)` with `animation-play-state: paused`.
*   **Pros**:
    *   **Declarative**: Works purely in CSS once the variable is there. No refs needed.
    *   **Perfect Sync**: Everything reads the same variable from the same frame.
*   **Cons**:
    *   **Performance Cost**: Forces style recalculation on the entire document layout tree 60 times per second. Battery drain risk.
    *   **Complexity**: "Scrubbing" animations via delay is non-standard and might have ease-curve quirks.

### Option 3: Refined Epoch Sync (Current + Mitigation)
Try to predict the "next frame" time in the calculation.

*   **Mechanism**: `phase = -((currentTime + 16ms) % duration)`.
*   **Verdict**: **Not Recommended**. It's a guess. Frame timing is unpredictable. It reduces the error but doesn't eliminate the "nightmare".

## Recommendation

**Proceed with Option 1 (WAAPI Sync).** 
It provides the "Apple-level" fit and finish requested. It respects the CSS architecture (keyframes defined in CSS) but takes control of the *timing* via JS, which is the correct separation of concerns for precise synchronization.

### Proposed Plan
1.  Create `src/hooks/useWaapiSync.ts`.
2.  Update `CheckCard`, `AppHeader`, `AppFooter` to use this hook/ref.
3.  Remove `useEpochSync` and `PulseEffectsManager`'s complex sync logic.
