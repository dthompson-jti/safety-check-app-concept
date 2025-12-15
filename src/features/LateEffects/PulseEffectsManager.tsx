// src/features/LateEffects/PulseEffectsManager.tsx
import { useLayoutEffect } from 'react';
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

    const shouldActivate = pulseStyle !== 'none' && lateCount > 0;

    // Calculate sync using the SAME epoch as cards
    // CRITICAL: Pass [shouldActivate] as dependency. 
    // This forces the hook to capture a FRESH 'currentTime' exactly when the animation starts (shouldActivate=true).
    // Without this, 'phase' is stale (captured at mount), causing drift because the animation starts LATER than mount.
    const period = pulseStyle === 'gradient' ? SYNC_BASE_MS * 4 : SYNC_BASE_MS;
    const syncResult = useEpochSync(period, [shouldActivate]);

    useLayoutEffect(() => {
        if (shouldActivate) {
            // FORCE RESTART:
            // 1. Remove attribute (stops animation)
            document.body.removeAttribute('data-glass-pulse');
            
            // 2. Force Reflow (calculates styles without animation)
            // This ensures the browser sees the "stop" state
            void document.body.offsetHeight; 
            
            // 3. Set Variable (calculated for T=Now)
            console.log(`[PulseManager] Activating ${pulseStyle} | Phase: ${syncResult.phase}ms`);
            document.body.style.setProperty('--glass-sync-delay', `${syncResult.phase}ms`);
            
            // 4. Re-add attribute (restarts animation)
            // The animation starts at T=Now, using the delay derived for T=Now.
            document.body.setAttribute('data-glass-pulse', pulseStyle);

        } else {
            console.log(`[PulseManager] Deactivating`);
            document.body.removeAttribute('data-glass-pulse');
            document.body.style.removeProperty('--glass-sync-delay');
        }

        return () => {
            document.body.removeAttribute('data-glass-pulse');
            document.body.style.removeProperty('--glass-sync-delay');
        };
    }, [shouldActivate, pulseStyle, syncResult.phase]);

    // No DOM elements - effect is handled via body attribute + CSS
    return null;
};

// Legacy export for backward compatibility
export { PulseEffectsManager as GlassTintOverlay };
