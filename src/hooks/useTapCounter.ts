import { useRef, useCallback } from 'react';

/**
 * Tap Counter Hook
 * 
 * Detects rapid tapping pattern (like Android dev options).
 * Default: 7 taps within 3 seconds.
 */
export const useTapCounter = (
    onActivate: () => void,
    requiredTaps: number = 7,
    windowMs: number = 3000
) => {
    const tapCountRef = useRef(0);
    const firstTapTimeRef = useRef<number>(0);
    const callbackRef = useRef(onActivate);

    // Keep callback current
    callbackRef.current = onActivate;

    const handleTap = useCallback(() => {
        const now = Date.now();

        // Reset if window expired
        if (now - firstTapTimeRef.current > windowMs) {
            tapCountRef.current = 0;
            firstTapTimeRef.current = now;
        }

        // Increment tap count
        tapCountRef.current += 1;

        // Set timestamp on first tap
        if (tapCountRef.current === 1) {
            firstTapTimeRef.current = now;
        }

        // Check if threshold reached
        if (tapCountRef.current >= requiredTaps) {
            tapCountRef.current = 0; // Reset
            callbackRef.current();
        }
    }, [requiredTaps, windowMs]);

    return {
        onTap: handleTap,
        // For debugging
        currentCount: tapCountRef.current,
    };
};
