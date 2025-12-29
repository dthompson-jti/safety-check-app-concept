// src/features/Shell/OfflineToggleFab.tsx
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { connectionStatusAtom, isOfflineToggleVisibleAtom } from '../../data/atoms';
import { dispatchActionAtom } from '../../data/appDataAtoms';
import { useHaptics } from '../../data/useHaptics';
import { useAppSound } from '../../data/useAppSound';
import styles from './OfflineToggleFab.module.css';

export const OfflineToggleFab = () => {
    const isVisible = useAtomValue(isOfflineToggleVisibleAtom);
    const [status, setStatus] = useAtom(connectionStatusAtom);
    const dispatch = useSetAtom(dispatchActionAtom);
    const { trigger: triggerHaptic } = useHaptics();
    const { play: playSound } = useAppSound();

    const handleToggle = () => {
        triggerHaptic('selection');
        if (status === 'online') {
            setStatus('offline');
        } else {
            // Going back online - clear queue and show connected state
            dispatch({ type: 'SYNC_QUEUED_CHECKS', payload: { syncTime: new Date().toISOString() } });
            triggerHaptic('success');
            playSound('success');
            setStatus('connected');
            setTimeout(() => setStatus('online'), 1000);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    className={styles.fab}
                    data-status={status}
                    onClick={handleToggle}
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    aria-label={`Toggle connectivity: currently ${status}`}
                >
                    <span className="material-symbols-rounded">
                        {status === 'online' ? 'cloud' : 'cloud_off'}
                    </span>
                </motion.button>
            )}
        </AnimatePresence>
    );
};
