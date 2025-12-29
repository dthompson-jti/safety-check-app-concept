# WAAPI Synchronization Strategy: "The Zero-Time Protocol"

## Executive Summary
To permanently solve animation misalignment ("drift") and startup inconsistencies ("thumps"), we will implement a synchronization protocol based on the **Web Animations API (WAAPI)**.
Instead of calculating *offsets* (CSS Delays), we will enforcing a shared **absolute start time**.

## The Core Concept: `startTime = 0`
Every looping animation in the app (pulses, gradients, borders) will be forced to behave as if it started at `document.timeline.currentTime = 0`.
*   **Effect**: At any given wall-clock time `T`, every 1200ms animation frame will be exactly at `T % 1200`.
*   **Benefit**: It is mathematically impossible for two components to be out of sync, regardless of when they mounted, how long the main thread hung, or how many frames were dropped.

## Technical Implementation

### 1. The Hook: `useWaapiSync(ref)`
We will create a single, reusable hook that enforces this protocol.

```typescript
// Conceptual Signature
function useWaapiSync(
  ref: RefObject<HTMLElement>, 
  options: { 
    period: number;   // e.g. 1200, 2400, 4800
    isEnabled: boolean; 
  }
) {
  useLayoutEffect(() => {
    if (!isEnabled || !ref.current) return;

    // 1. Get all animations (including ::before/::after)
    const animations = ref.current.getAnimations({ subtree: true });

    // 2. Filter for our specific pulse effects (optional but safer)
    // We can identify them by 'animationName' matching our CSS logic
    
    // 3. Force Synchronization
    animations.forEach(anim => {
      // The "Nuclear" Sync: 
      // Force all animations to align with the document's origin time.
      anim.startTime = 0; 
    });
    
  }, [isEnabled, period, /* Re-run if CSS classes change */]);
}
```

### 2. Targeting Pseudo-Elements
Our Pulse Effects lives on `::before` (Header/Footer/Cards).
*   **Browser Support**: Modern browsers (Chrome 84+, Safari 14+) support `element.getAnimations({ subtree: true })` which returns animations on pseudo-elements.
*   **Fallback**: For older browsers (unlikely a target given the tech stack), they would just drift. This is an acceptable "progressive enhancement".

### 3. Handling Lifecycle & Re-mounts
*   **Mount**: `useLayoutEffect` runs synchronously after DOM mutations but before Paint. We set `startTime` here. The user sees the first frame already synchronized.
*   **Updates**: If class names change (e.g. `basic` -> `gradient`), a new CSS Animation object is created. The hook dependencies must trigger a re-sync.
*   **Visibility Change**: WAAPI `startTime` is absolute. If the tab is backgrounded and resumed 1 hour later, `document.timeline.currentTime` has advanced 1 hour. The animation jumps to the correct frame instantly.

## "Go Broad": Systemic Implications

### 1. Reduced Motion
*   **Policy**: If `prefers-reduced-motion: reduce` is active, we should NOT sync, because we shouldn't be animating at all.
*   **Implementation**: usage of `window.matchMedia` inside the hook to early-return.

### 2. DevTools & Debugging
*   **Observability**: We can inspect `el.getAnimations()[0].startTime` in Console. Constant `0` indicates success. Random numbers indicate failure.

### 3. Performance
*   **Cost**: `getAnimations()` causes a style (re)calculation if styles are dirty.
*   **Mitigation**: We only call it inside `useLayoutEffect` (on mount/update), NOT on every frame. This is negligible overhead (microseconds).
*   **Battery**: This logic is cleaner than the current `useEpochSync` which sets CSS variables (causing style invalidation). WAAPI is direct engine manipulation.

### 4. CSS Architecture Changes
*   **Remove**: `animation-delay: var(--glass-sync-delay)` from CSS.
*   **Keep**: Keyframes, Durations, Easings in CSS.
*   **Reasoning**: Separation of concerns. CSS defines "What" (Look/Feel). JS defines "When" (Coordination).

## Risk Assessment
*   **Risk**: `getAnimations()` returns *nothing* because CSS hasn't applied the animation class yet.
*   **Mitigation**: Ensure `useLayoutEffect` dependencies include the variables that toggle the class (e.g., `pulseStyle`, `isLate`). This guarantees the effect runs *after* React has applied the class attributes.

## Verification Plan
1.  **Synthetic Test**: Create a "Sync Grid" page with 100 cards mounting at random intervals. Visually verify alignment.
2.  **Browser Console Check**: Select a card, run `($0).getAnimations({subtree:true})[0].startTime`. Assert it is `0`.
