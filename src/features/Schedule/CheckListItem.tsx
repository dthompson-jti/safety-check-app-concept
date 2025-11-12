// src/features/Schedule/CheckListItem.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
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
  const [isPulsing, setIsPulsing] = useState(false);
  const { trigger: triggerHaptic } = useHaptics();
  const prevStatus = usePrevious(check.status);

  useEffect(() => {
    if (prevStatus && prevStatus !== check.status) {
      if (check.status === 'due-soon' || check.status === 'late') {
        triggerHaptic('warning');
      }
    }
  }, [check.status, prevStatus, triggerHaptic]);

  useEffect(() => {
    let timerId: number | undefined;
    if (recentlyCompletedCheckId === check.id) {
      setIsPulsing(true);
      timerId = window.setTimeout(() => setIsPulsing(false), 1200);
    } else {
      setIsPulsing(false);
    }
    return () => clearTimeout(timerId);
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
      // DEFINITIVE FIX: The exit animation delay is removed. Orchestration is now handled
      // entirely by the setTimeout in the CheckFormView's handleSave function.
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