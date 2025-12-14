import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useCallback } from 'react';
import { useTheme } from './useTheme';
import { appConfigAtom } from './atoms';

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

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
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
};

export const featureFlagsAtom = atomWithStorage<FeatureFlags>('feature-flags', DEFAULT_FEATURE_FLAGS);

// Hook with stable callbacks for Future Ideas unlock state
export const useFutureIdeas = () => {
    const [isUnlocked, setUnlocked] = useAtom(futureIdeasUnlockedAtom);
    const [, setFeatureFlags] = useAtom(featureFlagsAtom);
    const [, setAppConfig] = useAtom(appConfigAtom);
    const { setTheme } = useTheme();

    const unlock = useCallback(() => {
        setUnlocked(true);
        // Apply "Dave's Favorites" preset when unlocking
        setTimeout(() => {
            setTheme('dark-c');
            setAppConfig(cur => ({
                ...cur,
                showStatusIndicators: true,
                hapticsEnabled: true,
                audioEnabled: true,
            }));
            setFeatureFlags(cur => ({
                ...cur,
                enableEnhancedAvatarDropdown: true,
                useHapticsEnabled: true,
                useSoundEnabled: true,
                enableDarkMode: true,
                feat_glass_tint: true,
                feat_card_gradient: true,
                feat_invert_badge: true,
            }));
        }, 0);
    }, [setUnlocked, setTheme, setAppConfig, setFeatureFlags]);

    const lock = useCallback(() => {
        console.log('[Future Ideas] LOCK called - resetting to defaults');
        setUnlocked(false);
        // Reset theme immediately (not in setTimeout)
        console.log('[Future Ideas] Setting theme to light immediately');
        setTheme('light');
        // Reset all feature flags to default (off)
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
            console.log('[Future Ideas] Resetting feature flags to defaults');
            setFeatureFlags(DEFAULT_FEATURE_FLAGS);
            console.log('[Future Ideas] Resetting haptics and audio');
            // Reset haptics and audio when locking Future Ideas
            setAppConfig(cur => ({
                ...cur,
                hapticsEnabled: false,
                audioEnabled: false,
            }));
        }, 0);
    }, [setUnlocked, setFeatureFlags, setTheme, setAppConfig]);

    // Toggle: Konami code or 7-tap toggles visibility
    const toggle = useCallback(() => {
        let wasUnlocked = false;
        setUnlocked((prev) => {
            wasUnlocked = prev;
            console.log(`[Future Ideas] TOGGLE - wasUnlocked: ${prev}, will be: ${!prev}`);
            return !prev;
        });

        // If we were unlocked and are now locking, call lock()
        if (wasUnlocked) {
            console.log('[Future Ideas] Calling lock() to reset everything');
            // Call lock to reset - but we need to do it in next tick since setUnlocked already ran
            setTimeout(() => {
                lock();
            }, 0);
        } else {
            // Unlocking - call unlock()
            console.log("[Future Ideas] Calling unlock() to apply Daves favorites");
            setTimeout(() => {
                unlock();
            }, 0);
        }
    }, [setUnlocked, lock, unlock]);

    return { isUnlocked, unlock, lock, toggle };
};
