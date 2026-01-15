// src/features/LateEffects/PulseEffectsManager.tsx
import { useLayoutEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { lateCheckCountAtom } from '../../data/appDataAtoms';
import { featureFlagsAtom, PulseStyle } from '../../data/featureFlags';

/**
 * PulseEffectsManager - Manages global pulse effects on glass surfaces (header, footer)
 * 
 * Sets data-glass-pulse attribute on body when:
 * - There are late/missed checks (lateCount > 0)
 * - The glass pulse feature flag is not 'none'
 * 
 * Synchronization is now handled by useWaapiSync in each component (AppHeader, AppFooter).
 * This manager only toggles the body attribute that activates the CSS animations.
 */
export const PulseEffectsManager = () => {
    const lateCount = useAtomValue(lateCheckCountAtom);
    const { feat_glass_pulse, feat_glass_tint } = useAtomValue(featureFlagsAtom);

    // Ref to track the current pulse style for WAAPI sync trigger
    const currentPulseRef = useRef<PulseStyle>('none');

    // Determine pulse style
    const pulseStyle: PulseStyle = feat_glass_pulse !== 'none'
        ? feat_glass_pulse
        : (feat_glass_tint ? 'basic' : 'none');

    const shouldActivate = pulseStyle !== 'none' && lateCount > 0;

    useLayoutEffect(() => {
        if (shouldActivate) {
            console.log(`[PulseManager] Activating: ${pulseStyle}`);
            document.body.setAttribute('data-glass-pulse', pulseStyle);
            currentPulseRef.current = pulseStyle;
        } else {
            console.log(`[PulseManager] Deactivating`);
            document.body.removeAttribute('data-glass-pulse');
            currentPulseRef.current = 'none';
        }

        return () => {
            document.body.removeAttribute('data-glass-pulse');
        };
    }, [shouldActivate, pulseStyle]);

    // No DOM elements - effect is handled via body attribute + CSS
    return null;
};


