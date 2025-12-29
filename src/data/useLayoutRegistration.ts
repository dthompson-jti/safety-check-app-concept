// src/data/useLayoutRegistration.ts
import { useLayoutEffect, useRef } from 'react';
import { useSetAtom, PrimitiveAtom } from 'jotai';

/**
 * A hook that automatically measures a component and updates a Jotai atom with its height.
 * Uses ResizeObserver to adapt to dynamic content changes.
 * 
 * Includes throttling to prevent "ResizeObserver loop limit exceeded" and OOM crashes.
 * 
 * @param heightAtom The Jotai atom to update with the height (e.g., headerHeightAtom)
 * @returns A ref to attach to the element to be measured
 */
export const useLayoutRegistration = (heightAtom: PrimitiveAtom<number>) => {
    const setHeight = useSetAtom(heightAtom);
    const elementRef = useRef<HTMLElement>(null);
    // Track the last value to prevent redundant updates (which trigger the loop)
    const lastHeight = useRef<number>(0);
    const frameId = useRef<number>(0);

    useLayoutEffect(() => {
        const updateHeight = () => {
            if (elementRef.current) {
                const newHeight = elementRef.current.offsetHeight;

                // CRITICAL FIX: Debounce/Throttle logic
                // Only update if the height has actually changed.
                // We use a small threshold to ignore sub-pixel rounding jitter if necessary,
                // but usually offsetHeight is an integer.
                if (lastHeight.current !== newHeight) {
                    // Cancel any pending frame to avoid stacking updates
                    cancelAnimationFrame(frameId.current);

                    // Schedule the update for the next animation frame.
                    // This breaks the synchronous ResizeObserver loop.
                    frameId.current = requestAnimationFrame(() => {
                        lastHeight.current = newHeight;
                        setHeight(newHeight);
                    });
                }
            }
        };

        // Initial measurement
        updateHeight();

        // Observe changes
        const observer = new ResizeObserver(updateHeight);
        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            observer.disconnect();
            cancelAnimationFrame(frameId.current);
            // NOTE: We intentionally do NOT reset height to 0 on cleanup.
            // The header never truly unmounts in normal usage, and resetting
            // would cause a layout flash during view transitions.
        };
    }, [setHeight]);

    return elementRef;
};