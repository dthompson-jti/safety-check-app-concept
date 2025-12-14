/**
 * useEpochSync - High-Craft Animation Synchronization Hook
 * 
 * Solves the "Temporal Drift" problem where components mounting at
 * different times have out-of-phase animations.
 * 
 * How it works:
 * - A fixed APP_EPOCH is captured when this module first loads.
 * - All components calculate their animation phase relative to this
 *   shared epoch, NOT their individual mount times.
 * - The phase is the current position in the animation cycle.
 * 
 * Example: If APP_EPOCH was 1000ms ago and animation is 1200ms:
 * - Phase = 1000 % 1200 = 1000
 * - Delay = -1000ms (starts animation 1000ms into the cycle)
 * 
 * @param duration - The animation duration in milliseconds (e.g., 1200)
 * @returns CSS properties object with `animationDelay`
 */
import { useMemo } from 'react';

// Fixed epoch - captured ONCE when the module loads (app boot time)
// All animations sync to this shared reference point
const APP_EPOCH = performance.now();

export const useEpochSync = (duration: number): React.CSSProperties => {
    // Calculate phase relative to the shared APP_EPOCH
    // This runs on mount, but uses the SAME epoch for all components
    const phase = useMemo(() => {
        const elapsed = performance.now() - APP_EPOCH;
        return -(elapsed % duration);
    }, [duration]);

    // Return both animationDelay (for direct animations) and CSS variable
    // (for pseudo-element animations that can't inherit inline styles)
    return {
        animationDelay: `${phase}ms`,
        '--card-sync-delay': `${phase}ms`,
    } as React.CSSProperties;
};

// Named constant for the standard sync base (1200ms = badge pulse period)
export const SYNC_BASE_MS = 1200;

// Convenience hook for common 1200ms sync
export const useStandardSync = (): React.CSSProperties => {
    return useEpochSync(SYNC_BASE_MS);
};

// Convenience hook for 2x sync (2400ms = card border/gradient period)
export const useSlowSync = (): React.CSSProperties => {
    return useEpochSync(SYNC_BASE_MS * 2);
};
