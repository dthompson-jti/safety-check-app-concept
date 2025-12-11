import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useCallback } from 'react';

/**
 * Dev Mode Atom
 * 
 * Controls visibility of hidden developer features (like dark mode toggle).
 * Unlocked via:
 * - Konami code (keyboard): ↑↑↓↓←→←→BA
 * - Long press (mobile): 3 seconds on app title
 * 
 * Persisted to localStorage so it stays unlocked.
 */
export const devModeUnlockedAtom = atomWithStorage('dev-mode-unlocked', false);

// Hook with stable callbacks
export const useDevMode = () => {
    const [isUnlocked, setUnlocked] = useAtom(devModeUnlockedAtom);

    const unlock = useCallback(() => {
        setUnlocked(true);
    }, [setUnlocked]);

    const lock = useCallback(() => {
        setUnlocked(false);
    }, [setUnlocked]);

    // Toggle: Konami code or long-press toggles visibility
    const toggle = useCallback(() => {
        setUnlocked((prev) => !prev);
    }, [setUnlocked]);

    return { isUnlocked, unlock, lock, toggle };
};
