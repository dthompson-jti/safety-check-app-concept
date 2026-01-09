import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useCallback } from 'react';
import { useTheme } from './useTheme';
import { appConfigAtom } from './atoms';

/**
 * Future Ideas Feature Flags
 */

// Pulse style options for glass and card effects
export type PulseStyle = 'none' | 'basic' | 'gradient';

// Scan animation style options (A=none, B=rings, C=wave, D=wave-top, E=step-pulse, F=icon-restored)
export type ScanAnimationStyle = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

// Unlock state for Future Ideas section
export const futureIdeasUnlockedAtom = atomWithStorage('future-ideas-unlocked', false);

// Feature flags control which experimental features are enabled
export interface FeatureFlags {
    useSoundEnabled: boolean;
    useHapticsEnabled: boolean;
    enableDynamicAvatarColor: boolean;
    // Late Check Concepts - Pulse Effects
    feat_glass_pulse: PulseStyle;  // Header/Footer pulse style
    feat_card_pulse: PulseStyle;   // Card background pulse style
    // Late Check Concepts - Other Effects
    feat_vignette: boolean;
    feat_desaturation: boolean;
    feat_glass_tint: boolean;      // Legacy - kept for migration
    feat_card_gradient: boolean;   // Legacy - kept for migration
    feat_card_border: boolean;
    feat_hazard_texture: boolean;
    feat_invert_card: boolean;
    feat_invert_badge: boolean;
    feat_badge_mode: 'none' | 'pulse' | 'ticker';
    feat_jump_fab: boolean;
    feat_scan_animation: ScanAnimationStyle;
}

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
    useSoundEnabled: false,
    useHapticsEnabled: false,
    enableDynamicAvatarColor: false,
    // Late Check Concepts - Pulse defaults to 'none'
    feat_glass_pulse: 'none',
    feat_card_pulse: 'none',
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
    feat_scan_animation: 'E',
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
            setTheme('light');
            setAppConfig(cur => ({
                ...cur,
                showStatusIndicators: true,
                hapticsEnabled: true,
                audioEnabled: true,
            }));
            setFeatureFlags(cur => ({
                ...cur,
                // ON: Haptics, Audio, Dynamic Avatar, Invert Badge
                enableDynamicAvatarColor: true,
                useHapticsEnabled: true,
                useSoundEnabled: true,
                feat_invert_badge: true,
                // OFF: Pulse effects, everything else
                feat_glass_pulse: 'none',
                feat_card_pulse: 'none',
                feat_vignette: false,
                feat_desaturation: false,
                feat_glass_tint: false,
                feat_card_gradient: false,
                feat_card_border: false,
                feat_hazard_texture: false,
                feat_invert_card: false,
                feat_badge_mode: 'none',
                feat_jump_fab: false,
                feat_scan_animation: 'E',
            }));
        }, 0);
    }, [setUnlocked, setTheme, setAppConfig, setFeatureFlags]);

    const lock = useCallback(() => {
        setUnlocked(false);
        setTheme('light');
        setTimeout(() => {
            setFeatureFlags(DEFAULT_FEATURE_FLAGS);
            setAppConfig(cur => ({
                ...cur,
                hapticsEnabled: false,
                audioEnabled: false,
            }));
        }, 0);
    }, [setUnlocked, setFeatureFlags, setTheme, setAppConfig]);

    const toggle = useCallback(() => {
        let wasUnlocked = false;
        setUnlocked((prev) => {
            wasUnlocked = prev;
            return !prev;
        });

        if (wasUnlocked) {
            setTimeout(() => {
                lock();
            }, 0);
        } else {
            setTimeout(() => {
                unlock();
            }, 0);
        }
    }, [setUnlocked, lock, unlock]);

    return { isUnlocked, unlock, lock, toggle };
};
