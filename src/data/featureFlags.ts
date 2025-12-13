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
    // Late Check Concepts
    feat_vignette: boolean;
    feat_desaturation: boolean;
    feat_glass_tint: boolean;
    feat_card_gradient: boolean;
    feat_card_border: boolean;
    feat_hazard_texture: boolean;
    feat_invert_card: boolean;
    feat_invert_badge: boolean;
    feat_badge_mode: 'none' | 'pulse' | 'ticker';
    feat_jump_fab: boolean;
    feat_bio_sync: boolean;
}

export const featureFlagsAtom = atomWithStorage<FeatureFlags>('feature-flags', {
    useSoundEnabled: false,
    useHapticsEnabled: false,
    enableDarkMode: false,
    enableEnhancedAvatarDropdown: false,
    // Late Check Concepts - all default to OFF
    feat_vignette: false,
    feat_desaturation: false,
    feat_glass_tint: false,
    feat_card_gradient: false,
    feat_card_border: false,
    feat_hazard_texture: false,
    feat_invert_card: false,
    feat_invert_badge: false,
    feat_badge_mode: 'none',
    feat_jump_fab: false,
    feat_bio_sync: false,
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
                // Late Check Concepts
                feat_vignette: false,
                feat_desaturation: false,
                feat_glass_tint: false,
                feat_card_gradient: false,
                feat_card_border: false,
                feat_hazard_texture: false,
                feat_invert_card: false,
                feat_invert_badge: false,
                feat_badge_mode: 'none',
                feat_jump_fab: false,
                feat_bio_sync: false,
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
                    // Late Check Concepts
                    feat_vignette: false,
                    feat_desaturation: false,
                    feat_glass_tint: false,
                    feat_card_gradient: false,
                    feat_card_border: false,
                    feat_hazard_texture: false,
                    feat_invert_card: false,
                    feat_invert_badge: false,
                    feat_badge_mode: 'none',
                    feat_jump_fab: false,
                    feat_bio_sync: false,
                });
                setTheme('light');
            }, 0);
        }
    }, [setUnlocked, setFeatureFlags, setTheme]);

    return { isUnlocked, unlock, lock, toggle };
};
