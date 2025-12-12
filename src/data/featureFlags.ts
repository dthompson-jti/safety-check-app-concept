import { useAtom, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useCallback } from 'react';
import { themeAtom } from './useTheme';

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
    enableEnhancedAvatarDropdown: boolean;
}

export const featureFlagsAtom = atomWithStorage<FeatureFlags>('feature-flags', {
    useSoundEnabled: false,
    useHapticsEnabled: false,
    enableDarkMode: false,
    enableEnhancedAvatarDropdown: false,
});

// Hook with stable callbacks for Future Ideas unlock state
export const useFutureIdeas = () => {
    const [isUnlocked, setUnlocked] = useAtom(futureIdeasUnlockedAtom);
    const [, setFeatureFlags] = useAtom(featureFlagsAtom);
    const setTheme = useSetAtom(themeAtom);

    const unlock = useCallback(() => {
        setUnlocked(true);
    }, [setUnlocked]);

    const lock = useCallback(() => {
        setUnlocked(false);
        // Reset all feature flags to default (off)
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
            setFeatureFlags({
                useSoundEnabled: false,
                useHapticsEnabled: false,
                enableDarkMode: false,
                enableEnhancedAvatarDropdown: false,
            });
            // Reset theme to light
            setTheme('light');
        }, 0);
    }, [setUnlocked, setFeatureFlags, setTheme]);

    // Toggle: Konami code or 7-tap toggles visibility
    const toggle = useCallback(() => {
        let wasUnlocked = false;
        setUnlocked((prev) => {
            wasUnlocked = prev;
            return !prev;
        });

        // If we were unlocked and are now locking, reset everything
        // Use setTimeout to ensure state updates are processed
        if (wasUnlocked) {
            setTimeout(() => {
                setFeatureFlags({
                    useSoundEnabled: false,
                    useHapticsEnabled: false,
                    enableDarkMode: false,
                    enableEnhancedAvatarDropdown: false,
                });
                setTheme('light');
            }, 0);
        }
    }, [setUnlocked, setFeatureFlags, setTheme]);

    return { isUnlocked, unlock, lock, toggle };
};
