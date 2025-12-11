import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useCallback } from 'react';

/**
 * Future Ideas Feature Flags
 * 
 * Controls visibility of experimental "Future Ideas" features.
 * Unlocked via:
 * - Konami code (keyboard): ↑↑↓↓←→←→BA
 * - 7 taps on app logo
 * 
 * Persisted to localStorage so it stays unlocked.
 * 
 * REPLACES: devMode.ts (Dave Mode)
 */

// Unlock state for Future Ideas section
export const futureIdeasUnlockedAtom = atomWithStorage('future-ideas-unlocked', false);

// Feature flags control which experimental features are enabled
export interface FeatureFlags {
    useSoundEnabled: boolean;
    useHapticsEnabled: boolean;
    enableDarkMode: boolean;
}

export const featureFlagsAtom = atomWithStorage<FeatureFlags>('feature-flags', {
    useSoundEnabled: false,
    useHapticsEnabled: false,
    enableDarkMode: false,
});

// Hook with stable callbacks for Future Ideas unlock state
export const useFutureIdeas = () => {
    const [isUnlocked, setUnlocked] = useAtom(futureIdeasUnlockedAtom);

    const unlock = useCallback(() => {
        setUnlocked(true);
    }, [setUnlocked]);

    const lock = useCallback(() => {
        setUnlocked(false);
    }, [setUnlocked]);

    // Toggle: Konami code or 7-tap toggles visibility
    const toggle = useCallback(() => {
        setUnlocked((prev) => !prev);
    }, [setUnlocked]);

    return { isUnlocked, unlock, lock, toggle };
};
