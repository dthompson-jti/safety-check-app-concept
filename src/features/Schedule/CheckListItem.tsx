// src/features/Schedule/CheckListItem.tsx
import { useState, useEffect, useMemo } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { SafetyCheck } from '../../types';
import { workflowStateAtom, recentlyCompletedCheckIdAtom } from '../../data/atoms';
import { useCountdown } from '../../data/useCountdown';
import { Tooltip } from '../../components/Tooltip';
import { StatusBadge } from './StatusBadge';
import styles from './CheckListItem.module.css';

interface CheckListItemProps {
  check: SafetyCheck;
}

export const CheckListItem = ({ check }: CheckListItemProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const recentlyCompletedCheckId = useAtomValue(recentlyCompletedCheckIdAtom);
  const [isRecentlyCompleted, setIsRecentlyCompleted] = useState(false);

  useEffect(() => {
    if (recentlyCompletedCheckId === check.id) {
      setIsRecentlyCompleted(true);
      const timer = setTimeout(() => setIsRecentlyCompleted(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentlyCompletedCheckId, check.id]);

  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);
  const relativeTime = useCountdown(dueDate, check.status);
  const isActionable = check.status !== 'complete' && check.status !== 'supplemental' && check.status !== 'missed';

  const handleItemClick = () => {
    if (isActionable) {
      setWorkflowState({
        view: 'scanning',
        isManualSelectionOpen: false,
        targetCheckId: check.id,
      });
    }
  };

  const { residents, specialClassification, status } = check;
  const roomName = residents[0]?.location || 'N/A';
  const showIndicator = status !== 'complete' && status !== 'supplemental' && status !== 'missed';

  return (
    <motion.div
      layout
      className={styles.checkListItem}
      data-status={status}
      onClick={handleItemClick}
      aria-disabled={!isActionable}
      whileTap={isActionable ? { scale: 0.995, backgroundColor: 'var(--surface-bg-primary_hover)' } : {}}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {showIndicator && <div className={styles.statusIndicator} data-status={status} />}
      <div className={styles.mainContent}>
        <div className={styles.topRow}>
          <div className={styles.locationInfo}>
            {specialClassification && (
              <Tooltip content={`${specialClassification.type}: ${specialClassification.details}`}>
                <span className={`material-symbols-rounded ${styles.filledIcon}`}>warning</span>
              </Tooltip>
            )}
            <span className={styles.locationText}>{roomName}</span>
          </div>
          <AnimatePresence mode="wait">
            {isRecentlyCompleted ? (
              <motion.div
                key="completed-badge"
                className={styles.completedBadge}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <span className="material-symbols-rounded">check_circle</span>
                <span>Completed</span>
              </motion.div>
            ) : (
              <motion.div
                key="status-badge"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <StatusBadge status={status} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className={styles.bottomRow}>
          <ul className={styles.residentList}>
            {residents.map((resident) => (
              <li key={resident.id}>{resident.name}</li>
            ))}
          </ul>
          <div className={styles.timeDisplay}>{relativeTime}</div>
        </div>
      </div>
    </motion.div>
  );
};