// src/features/Shell/OfflineToggleFab.tsx
import { useAtomValue } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { isOfflineToggleVisibleAtom } from '../../data/atoms';
import { useConnectionManager } from '../../hooks/useConnectionManager';
import styles from './OfflineToggleFab.module.css';

export const OfflineToggleFab = () => {
    const isVisible = useAtomValue(isOfflineToggleVisibleAtom);
    const { status, toggleConnection } = useConnectionManager();
    // Removed local dispatch/haptic/atom usage

    const handleToggle = () => {
        toggleConnection();
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
