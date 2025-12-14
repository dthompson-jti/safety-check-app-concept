// src/features/LateEffects/PulseEffectsManager.tsx
import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { lateCheckCountAtom } from '../../data/appDataAtoms';
import { featureFlagsAtom, PulseStyle } from '../../data/featureFlags';
import { useEpochSync, SYNC_BASE_MS } from '../../hooks/useEpochSync';

/**
 * PulseEffectsManager - Manages global pulse effects on glass surfaces (header, footer)
 * 
 * Sets data-glass-pulse attribute on body when:
 * - There are late/missed checks (lateCount > 0)
 * - The glass pulse feature flag is not 'none'
 * 
 * Also sets --glass-sync-delay CSS variable to synchronize header/footer
 * animations with card animations using the shared epoch-based timing.
 * 
 * Periods:
 * - 'basic': 1.2s (SYNC_BASE_MS)
 * - 'gradient': 2.4s (SYNC_BASE_MS * 2)
 */
export const PulseEffectsManager = () => {
    const lateCount = useAtomValue(lateCheckCountAtom);
    const { feat_glass_pulse, feat_glass_tint } = useAtomValue(featureFlagsAtom);

    // Determine pulse style first to know which period to use
    const pulseStyle: PulseStyle = feat_glass_pulse !== 'none'
        ? feat_glass_pulse
        : (feat_glass_tint ? 'basic' : 'none');

    // Calculate sync using the SAME epoch as cards
    // - Basic pulse: 1.2s period (same as badge)
    // - Gradient pulse: 4.8s period (same as card magma gradient)
    const period = pulseStyle === 'gradient' ? SYNC_BASE_MS * 4 : SYNC_BASE_MS;
    const syncStyle = useEpochSync(period);

    const shouldActivate = pulseStyle !== 'none' && lateCount > 0;

    useEffect(() => {
        if (shouldActivate) {
            document.body.setAttribute('data-glass-pulse', pulseStyle);
            // Set sync delay CSS variable for header/footer animations
            document.body.style.setProperty('--glass-sync-delay', syncStyle.animationDelay || '0ms');
        } else {
            document.body.removeAttribute('data-glass-pulse');
            document.body.style.removeProperty('--glass-sync-delay');
        }

        return () => {
            document.body.removeAttribute('data-glass-pulse');
            document.body.style.removeProperty('--glass-sync-delay');
        };
    }, [shouldActivate, pulseStyle, syncStyle.animationDelay]);

    // No DOM elements - effect is handled via body attribute + CSS
    return null;
};

// Legacy export for backward compatibility
export { PulseEffectsManager as GlassTintOverlay };
