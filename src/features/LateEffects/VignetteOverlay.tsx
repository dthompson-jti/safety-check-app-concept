// src/features/LateEffects/VignetteOverlay.tsx
import { useAtomValue } from 'jotai';
import { lateCheckCountAtom } from '../../data/appDataAtoms';
import { featureFlagsAtom } from '../../data/featureFlags';
import styles from './VignetteOverlay.module.css';

/**
 * VignetteOverlay - Global atmospheric effect for Late Check state
 * 
 * Displays a red glow creeping from screen edges only when:
 * - There are late/missed checks (lateCount > 0)
 * - The vignette feature flag is enabled
 * - Bio-Sync can optionally animate the effect
 */
export const VignetteOverlay = () => {
    const lateCount = useAtomValue(lateCheckCountAtom);
    const { feat_vignette, feat_bio_sync } = useAtomValue(featureFlagsAtom);

    // Only render if feature is enabled AND there are late checks
    if (!feat_vignette || lateCount === 0) {
        return null;
    }

    const classNames = [
        styles.vignette,
        feat_bio_sync ? 'bio-sync-vignette' : '',
    ].filter(Boolean).join(' ');

    return (
        <div
            className={classNames}
            aria-hidden="true"
            data-late-count={lateCount}
        />
    );
};
