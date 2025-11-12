// src/features/Schedule/CheckCard.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { SafetyCheck } from '../../types';
import {
  workflowStateAtom,
  recentlyCompletedCheckIdAtom,
} from '../../data/atoms';
import { useCountdown } from '../../data/useCountdown';
import { useHaptics } from '../../data/useHaptics';
import { Tooltip } from '../../components/Tooltip';
import { StatusBadge } from './StatusBadge';
import styles from './CheckCard.module.css';

interface CheckCardProps {
  check: SafetyCheck;
}

const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const CheckCard = ({ check }: CheckCardProps) => {
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

  // DEFINITIVE FIX: Derive visual status directly on each render. This ensures the component
  // always reflects the latest prop data, while still allowing the pulse animation to override it.
  const visualStatus = isPulsing ? 'complete' : check.status;

  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);
  const relativeTime = useCountdown(dueDate, check.status);
  const isActionable = check.status !== 'complete' && check.status !== 'supplemental' && check.status !== 'missed';

  const handleCardClick = () => {
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
  const cardClassName = `${styles.checkCard} ${isPulsing ? styles.isCompleting : ''}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cardClassName}
      data-status={visualStatus} 
      onClick={handleCardClick}
      aria-disabled={!isActionable}
      whileTap={isActionable ? { scale: 0.98 } : {}}
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