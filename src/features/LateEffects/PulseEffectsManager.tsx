// src/features/LateEffects/PulseEffectsManager.tsx
import { useEffect } from 'react';
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
 * Attribute values:
 * - 'basic': Opacity-driven breathing effect
 * - 'gradient': Flowing gradient animation (Magma-style)
 * 
 * The actual visual effect is handled via CSS in AppHeader.module.css and AppFooter.module.css
 */
export const PulseEffectsManager = () => {
    const lateCount = useAtomValue(lateCheckCountAtom);
    const { feat_glass_pulse, feat_glass_tint } = useAtomValue(featureFlagsAtom);

    // Determine pulse style: new flag takes precedence, fallback to legacy
    const pulseStyle: PulseStyle = feat_glass_pulse !== 'none' 
        ? feat_glass_pulse 
        : (feat_glass_tint ? 'basic' : 'none');

    const shouldActivate = pulseStyle !== 'none' && lateCount > 0;

    useEffect(() => {
        if (shouldActivate) {
            document.body.setAttribute('data-glass-pulse', pulseStyle);
        } else {
            document.body.removeAttribute('data-glass-pulse');
        }

        return () => {
            document.body.removeAttribute('data-glass-pulse');
        };
    }, [shouldActivate, pulseStyle]);

    // No DOM elements - effect is handled via body attribute + CSS
    return null;
};

// Legacy export for backward compatibility
export { PulseEffectsManager as GlassTintOverlay };
