// src/features/SafetyCheckSchedule/CheckCard.tsx
import { useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { SafetyCheck, SafetyCheckStatus } from '../../types';
import { currentTimeAtom, workflowStateAtom } from '../../data/atoms';
import { Tooltip } from '../../components/Tooltip';
import { StatusBadge } from './StatusBadge';
import styles from './CheckCard.module.css';

interface CheckCardProps {
  check: SafetyCheck;
}

const formatCheckTime = (dueDate: Date, now: Date, status: SafetyCheckStatus): string => {
  const diffSeconds = Math.round((dueDate.getTime() - now.getTime()) / 1000);

  switch (status) {
    case 'complete':
    case 'supplemental':
      return '';
    case 'missed':
      return 'Missed';
    case 'late': {
      const absSeconds = Math.abs(diffSeconds);
      const mins = Math.floor(absSeconds / 60);
      return `Overdue ${mins}m`;
    }
    case 'due-soon':
    case 'pending': {
      if (diffSeconds < 0) return `Due Now`;
      if (diffSeconds < 60) return `${diffSeconds}s`;
      const mins = Math.floor(diffSeconds / 60);
      const secs = diffSeconds % 60;
      return `${mins}m ${String(secs).padStart(2, '0')}s`;
    }
    default:
      return '';
  }
};

export const CheckCard = ({ check }: CheckCardProps) => {
  const now = useAtomValue(currentTimeAtom);
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);

  const relativeTime = useMemo(
    () => formatCheckTime(dueDate, now, check.status),
    [dueDate, now, check.status]
  );

  const isActionable = check.status !== 'complete' && check.status !== 'supplemental' && check.status !== 'missed';

  const handleCardClick = () => {
    if (isActionable) {
      setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
    }
  };

  const { residents, specialClassification, status } = check;
  const roomName = residents[0]?.location || 'N/A';

  const showIndicator = status !== 'complete' && status !== 'supplemental' && status !== 'missed';

  return (
    <motion.div
      layout
      className={styles.checkCard}
      data-status={status}
      onClick={handleCardClick}
      aria-disabled={!isActionable}
      whileTap={isActionable ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {showIndicator && <div className={styles.statusIndicator} data-status={status} />}
      
      <div className={styles.mainContent}>
        <div className={styles.topRow}>
          <div className={styles.locationInfo}>
            {specialClassification && (
              <Tooltip content={specialClassification.details}>
                {/* 
                  DEFINITIVE FIX: Apply both the global icon class and our new local
                  modifier class directly to the same element. This is the most
                  robust and idiomatic way to solve this in a CSS module system.
                */}
                <span className={`material-symbols-rounded ${styles.filledIcon}`}>
                  warning
                </span>
              </Tooltip>
            )}
            <span className={styles.locationText}>{roomName}</span>
          </div>
          <StatusBadge status={status} />
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