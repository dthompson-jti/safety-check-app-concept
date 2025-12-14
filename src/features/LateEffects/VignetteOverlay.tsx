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
 */
export const VignetteOverlay = () => {
    const lateCount = useAtomValue(lateCheckCountAtom);
    const { feat_vignette } = useAtomValue(featureFlagsAtom);

    // Only render if feature is enabled AND there are late checks
    if (!feat_vignette || lateCount === 0) {
        return null;
    }

    return (
        <div
            className={styles.vignette}
            aria-hidden="true"
            data-late-count={lateCount}
        />
    );
};
