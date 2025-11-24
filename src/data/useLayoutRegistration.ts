// src/data/useLayoutRegistration.ts
import { useLayoutEffect, useRef } from 'react';
import { useSetAtom, PrimitiveAtom } from 'jotai';

/**
 * A hook that automatically measures a component and updates a Jotai atom with its height.
 * Uses ResizeObserver to adapt to dynamic content changes.
 * 
 * @param heightAtom The Jotai atom to update with the height (e.g., headerHeightAtom)
 * @returns A ref to attach to the element to be measured
 */
export const useLayoutRegistration = (heightAtom: PrimitiveAtom<number>) => {
    const setHeight = useSetAtom(heightAtom);
    const elementRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const updateHeight = () => {
            if (elementRef.current) {
                setHeight(elementRef.current.offsetHeight);
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
            setHeight(0);
        };
    }, [setHeight]);

    return elementRef;
};