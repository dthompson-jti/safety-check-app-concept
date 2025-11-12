// src/features/Schedule/CheckListItem.tsx
import { useEffect, useMemo, useRef } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { SafetyCheck } from '../../types';
import { workflowStateAtom, recentlyCompletedCheckIdAtom } from '../../data/atoms';
import { useCountdown } from '../../data/useCountdown';
import { useHaptics } from '../../data/useHaptics';
import { Tooltip } from '../../components/Tooltip';
import { StatusBadge } from './StatusBadge';
import styles from './CheckListItem.module.css';

interface CheckListItemProps {
  check: SafetyCheck;
}

const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const CheckListItem = ({ check }: CheckListItemProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const recentlyCompletedCheckId = useAtomValue(recentlyCompletedCheckIdAtom);
  const { trigger: triggerHaptic } = useHaptics();
  const prevStatus = usePrevious(check.status);

  useEffect(() => {
    if (prevStatus && prevStatus !== check.status) {
      if (check.status === 'due-soon' || check.status === 'late') {
        triggerHaptic('warning');
      }
    }
  }, [check.status, prevStatus, triggerHaptic]);

  // CRITICAL FIX: The component no longer manages its own "pulsing" state.
  // It derives it directly from the global atom. This eliminates the race condition
  // where the component would remove its own pulse class prematurely.
  const isPulsing = recentlyCompletedCheckId === check.id;

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
  
  const showIndicator = check.status !== 'complete' && check.status !== 'supplemental' && check.status !== 'missed';
  const listItemClassName = `${styles.checkListItem} ${isPulsing ? styles.isCompleting : ''}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={listItemClassName}
      data-status={check.status}
      onClick={handleItemClick}
      aria-disabled={!isActionable}
      whileTap={isActionable ? { scale: 0.99, backgroundColor: 'var(--surface-bg-primary_hover)' } : {}}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      exit={{ x: '110%', opacity: 0, transition: { duration: 0.3 } }}
    >
      {showIndicator && <div className={styles.statusIndicator} data-status={check.status} />}
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
          <StatusBadge status={check.status} />
        </div>
        <div className={styles.bottomRow}>
          <ul className={styles.residentList}>
            {residents.map((resident) => (
              <li key={resident.id}>{resident.name}</li>
            ))}
          </ul>
          <div className={styles.timeDisplay}>{isActionable ? relativeTime : ''}</div>
        </div>
      </div>
    </motion.div>
  );
};