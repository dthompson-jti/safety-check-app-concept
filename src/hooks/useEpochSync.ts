/**
 * useEpochSync - High-Craft Animation Synchronization Hook
 * 
 * Solves the "Temporal Drift" problem where components mounting at
 * different times have out-of-phase animations.
 * 
 * How it works:
 * - A fixed APP_EPOCH is captured when this module first loads.
 * - Each component calculates its phase relative to APP_EPOCH at mount time.
 * - A negative animation-delay makes the animation appear to have been
 *   running since APP_EPOCH, putting all components in phase.
 * 
 * @param duration - The animation duration in milliseconds (e.g., 1200)
 * @returns CSS properties object with CSS variable (NO inline animationDelay)
 */
import { useMemo } from 'react';

// Fixed epoch - captured ONCE when the module loads (app boot time)
// All animations sync to this shared reference point
const APP_EPOCH = performance.now();

export const useEpochSync = (duration: number): React.CSSProperties => {
    // Calculate phase relative to the shared APP_EPOCH at mount time
    // This makes the animation appear to have been running since APP_EPOCH
    const phase = useMemo(() => {
        const elapsed = performance.now() - APP_EPOCH;
        return -(elapsed % duration);
    }, [duration]);

    // Return ONLY the CSS variable - no inline animationDelay
    // This prevents inline styles from overriding CSS rules
    // The CSS animation-delay should read from var(--glass-sync-delay) on body
    // which is set by PulseEffectsManager
    return {
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

