// src/features/Schedule/CheckCard.tsx
import { useMemo } from 'react';
import { useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { SafetyCheck } from '../../types';
import { workflowStateAtom } from '../../data/atoms';
import { useCountdown } from '../../data/useCountdown';
import { Tooltip } from '../../components/Tooltip';
// REFACTOR: Import the new StatusBadge component
import { StatusBadge } from './StatusBadge';
import styles from './CheckCard.module.css';

interface CheckCardProps {
  check: SafetyCheck;
}

export const CheckCard = ({ check }: CheckCardProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);

  // The new high-performance countdown hook replaces the old formatting logic.
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

  const { residents, specialClassification, status } = check;
  const roomName = residents[0]?.location || 'N/A';

  // FIX: Logic to determine if the indicator bar should be shown.
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
              <Tooltip content={`${specialClassification.type}: ${specialClassification.details}`}>
                <span className={`material-symbols-rounded ${styles.filledIcon}`}>
                  warning
                </span>
              </Tooltip>
            )}
            <span className={styles.locationText}>{roomName}</span>
          </div>
          {/* REFACTOR: Use the new StatusBadge component */}
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