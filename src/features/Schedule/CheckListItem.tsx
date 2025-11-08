// src/features/Schedule/CheckListItem.tsx
import { useState, useEffect, useMemo } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
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
  const [isPulsing, setIsPulsing] = useState(false);

  // DEFINITIVE FIX: Create a "visual state snapshot" to prevent state reversion during exit animation.
  const [visualStatus, setVisualStatus] = useState(check.status);

  useEffect(() => {
    let timerId: number | undefined;
    if (recentlyCompletedCheckId === check.id) {
      setIsPulsing(true);
      setVisualStatus('complete'); // Snapshot the final state
      timerId = window.setTimeout(() => setIsPulsing(false), 1200);
    } else {
      setIsPulsing(false);
      // Ensure visual state is in sync when not pulsing
      setVisualStatus(check.status);
    }
    return () => clearTimeout(timerId);
  }, [recentlyCompletedCheckId, check.id, check.status]);

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

  const { residents, specialClassification } = check;
  const roomName = residents[0]?.location || 'N/A';
  
  const showIndicator = visualStatus !== 'complete' && visualStatus !== 'supplemental' && visualStatus !== 'missed';
  const listItemClassName = `${styles.checkListItem} ${isPulsing ? styles.isCompleting : ''}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={listItemClassName}
      data-status={visualStatus} // Use visual status for styling
      onClick={handleItemClick}
      aria-disabled={!isActionable}
      whileTap={isActionable ? { scale: 0.99, backgroundColor: 'var(--surface-bg-primary_hover)' } : {}}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      exit={{ x: '110%', opacity: 0, transition: { duration: 0.3, delay: 0.2 } }}
    >
      {showIndicator && <div className={styles.statusIndicator} data-status={visualStatus} />}
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
          <StatusBadge status={visualStatus} />
        </div>
        <div className={styles.bottomRow}>
          <ul className={styles.residentList}>
            {residents.map((resident) => (
              <li key={resident.id}>{resident.name}</li>
            ))}
          </ul>
          <div className={styles.timeDisplay}>{visualStatus === 'complete' || visualStatus === 'supplemental' ? '' : relativeTime}</div>
        </div>
      </div>
    </motion.div>
  );
};