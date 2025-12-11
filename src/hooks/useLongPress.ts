import { useRef, useCallback } from 'react';

/**
 * Long Press Hook
 * 
 * Detects a long press (hold) gesture for mobile fallback.
 * Default: 3 seconds
 */
export const useLongPress = (
    onLongPress: () => void,
    duration: number = 3000
) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isActiveRef = useRef(false);

    const start = useCallback(() => {
        if (isActiveRef.current) return;
        isActiveRef.current = true;

        timerRef.current = setTimeout(() => {
            onLongPress();
            isActiveRef.current = false;
        }, duration);
    }, [onLongPress, duration]);

    const cancel = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        isActiveRef.current = false;
    }, []);

    return {
        onMouseDown: start,
        onMouseUp: cancel,
        onMouseLeave: cancel,
        onTouchStart: start,
        onTouchEnd: cancel,
        onTouchCancel: cancel,
    };
};
