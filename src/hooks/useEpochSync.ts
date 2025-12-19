/**
 * useEpochSync - High-Craft Animation Synchronization Hook
 * 
 * Solves the "Temporal Drift" problem where components mounting at
 * different times have out-of-phase animations.
 * 
 * How it works:
 * - Uses `document.timeline.currentTime` which pauses when tabs are hidden.
 * - Formula: `phase = -(currentTime % duration)` syncs all animations to T=0.
 * - A negative animation-delay makes the animation appear to have been
 *   running since the document timeline origin.
 * 
 * @param duration - The animation duration in milliseconds (e.g., 1200)
 * @returns Object with `style` (CSS properties) and `phase` (raw ms value)
 */
import { useMemo } from 'react';

/**
 * Get current animation timeline time.
 * Uses document.timeline.currentTime (pauses with CSS animations in background tabs).
 * Falls back to performance.now() if unavailable.
 */
const getCurrentTime = (): number => {
    if (typeof document !== 'undefined' && document.timeline?.currentTime != null) {
        return document.timeline.currentTime as number;
    }
    return typeof performance !== 'undefined' ? performance.now() : 0;
};

export interface EpochSyncResult {
    /** CSS properties object with --card-sync-delay variable */
    style: React.CSSProperties;
    /** Raw phase value in milliseconds (negative) */
    phase: number;
}

// Named constant for the standard sync base (1200ms = badge pulse period)
export const SYNC_BASE_MS = 1200;

export const useEpochSync = (duration: number, deps: React.DependencyList = []): EpochSyncResult => {
    // Calculate phase using the animation timeline clock
    // This ensures sync even after tab backgrounding
    const result = useMemo(() => {
        const currentTime = getCurrentTime();
        const phase = -(currentTime % duration);

        return {
            style: { '--card-sync-delay': `${phase}ms` } as React.CSSProperties,
            phase,
        };
    }, [duration, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

    // Log AFTER memo calculation to see what's happening
    // if (typeof console !== 'undefined') { ... } // Removed to reduce noise

    return result;
};

// Convenience hook for common 1200ms sync
export const useStandardSync = (): EpochSyncResult => {
    return useEpochSync(SYNC_BASE_MS);
};

// Convenience hook for 2x sync (2400ms = card border/gradient period)
export const useSlowSync = (): EpochSyncResult => {
    return useEpochSync(SYNC_BASE_MS * 2);
};

