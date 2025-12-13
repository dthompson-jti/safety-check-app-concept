// src/features/LateEffects/GlassTintOverlay.tsx
import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { lateCheckCountAtom } from '../../data/appDataAtoms';
import { featureFlagsAtom } from '../../data/featureFlags';

/**
 * GlassTintOverlay - Activates pulsing red tint on glass surfaces (header, footer)
 * 
 * Sets data-glass-tint="active" on body when:
 * - There are late/missed checks (lateCount > 0)
 * - The glass tint feature flag is enabled
 * 
 * The actual visual effect is handled via CSS in AppHeader.module.css and AppFooter.module.css
 */
export const GlassTintOverlay = () => {
    const lateCount = useAtomValue(lateCheckCountAtom);
    const { feat_glass_tint } = useAtomValue(featureFlagsAtom);

    const shouldActivate = feat_glass_tint && lateCount > 0;

    useEffect(() => {
        if (shouldActivate) {
            document.body.setAttribute('data-glass-tint', 'active');
        } else {
            document.body.removeAttribute('data-glass-tint');
        }

        return () => {
            document.body.removeAttribute('data-glass-tint');
        };
    }, [shouldActivate]);

    // No DOM elements - effect is handled via body attribute + CSS
    return null;
};
