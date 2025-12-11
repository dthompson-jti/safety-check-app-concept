import { useEffect, useRef, useCallback } from 'react';

/**
 * Konami Code Hook
 * 
 * Detects the classic Konami code sequence:
 * ↑ ↑ ↓ ↓ ← → ← → B A
 * 
 * Keys used:
 * - ArrowUp (×2)
 * - ArrowDown (×2)
 * - ArrowLeft
 * - ArrowRight
 * - ArrowLeft
 * - ArrowRight
 * - KeyB
 * - KeyA
 */
const KONAMI_CODE = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA',
];

export const useKonamiCode = (onActivate: () => void) => {
    const sequenceRef = useRef<string[]>([]);
    const lastTriggerRef = useRef<number>(0);
    const callbackRef = useRef(onActivate);

    // Keep callback ref updated (avoids useEffect dependency issues)
    callbackRef.current = onActivate;

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const key = event.code;
        const now = Date.now();

        // Add key to sequence
        sequenceRef.current = [...sequenceRef.current, key].slice(-KONAMI_CODE.length);

        // Check if sequence matches
        if (
            sequenceRef.current.length === KONAMI_CODE.length &&
            sequenceRef.current.every((k, i) => k === KONAMI_CODE[i])
        ) {
            // Debounce: prevent re-trigger within 1 second
            if (now - lastTriggerRef.current > 1000) {
                lastTriggerRef.current = now;
                sequenceRef.current = []; // Reset immediately
                callbackRef.current();
            }
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};

