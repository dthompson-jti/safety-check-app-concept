// src/features/LateEffects/JumpFAB.tsx
import { useAtomValue } from 'jotai';
import { lateCheckCountAtom, timeSortedChecksAtom } from '../../data/appDataAtoms';
import { featureFlagsAtom } from '../../data/featureFlags';
import { workflowStateAtom } from '../../data/atoms';
import styles from './JumpFAB.module.css';

/**
 * JumpFAB - Floating Action Button to scroll to first late check
 * 
 * Only appears when:
 * - Feature flag is enabled
 * - There are late checks
 * - User is on main schedule list (not drilled into form views)
 */
export const JumpFAB = () => {
    const lateCount = useAtomValue(lateCheckCountAtom);
    const checks = useAtomValue(timeSortedChecksAtom);
    const { feat_jump_fab } = useAtomValue(featureFlagsAtom);
    const workflowState = useAtomValue(workflowStateAtom);

    // Hide FAB when drilled into other views (form, provisioning, nfc-write)
    const isInMainList = workflowState.view === 'none';

    if (!feat_jump_fab || lateCount === 0 || !isInMainList) {
        return null;
    }

    const handleClick = () => {
        // Find first missed check
        const firstLate = checks.find(c => c.status === 'missed');
        if (firstLate) {
            // Scroll to the check card (simplified - assumes cards have IDs)
            const element = document.querySelector(`[data-check-id="${firstLate.id}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    return (
        <button
            className={styles.fab}
            onClick={handleClick}
            aria-label={`Jump to ${lateCount} late check${lateCount > 1 ? 's' : ''}`}
        >
            <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>
                arrow_upward
            </span>
            <span className={styles.fabLabel}>
                {lateCount} Late
            </span>
        </button>
    );
};
