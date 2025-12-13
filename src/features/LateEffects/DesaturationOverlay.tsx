// src/features/LateEffects/DesaturationOverlay.tsx
import { useAtomValue } from 'jotai';
import { lateCheckCountAtom } from '../../data/appDataAtoms';
import { featureFlagsAtom } from '../../data/featureFlags';
import styles from './DesaturationOverlay.module.css';

/**
 * DesaturationOverlay - Desaturates content while keeping alert colors vibrant
 * 
 * Only activates when:
 * - There are late/missed checks (lateCount > 0)
 * - The desaturation feature flag is enabled
 */
export const DesaturationOverlay = () => {
    const lateCount = useAtomValue(lateCheckCountAtom);
    const { feat_desaturation } = useAtomValue(featureFlagsAtom);

    // Only render if feature is enabled AND there are late checks
    if (!feat_desaturation || lateCount === 0) {
        return null;
    }

    return (
        <div
            className={styles.desaturation}
            aria-hidden="true"
        />
    );
};
