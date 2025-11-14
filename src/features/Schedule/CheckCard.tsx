// src/features/Schedule/CheckCard.tsx
import { useMemo } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { SafetyCheck, Resident } from '../../types';
import {
  workflowStateAtom,
  recentlyCompletedCheckIdAtom,
} from '../../data/atoms';
import { useCountdown } from '../../data/useCountdown';
import { StatusBadge } from './StatusBadge';
import styles from './CheckCard.module.css';

interface CheckCardProps {
  check: SafetyCheck;
}

const ResidentListItem = ({ resident, check }: { resident: Resident; check: SafetyCheck }) => {
  const isClassified = check.specialClassification?.residentId === resident.id;

  return (
    <li className={styles.residentListItem}>
      {isClassified && (
        <span
          className={`material-symbols-rounded ${styles.warningIcon}`}
          aria-label="Special Classification"
        >
          warning
        </span>
      )}
      {resident.name}
    </li>
  );
};

export const CheckCard = ({ check }: CheckCardProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const recentlyCompletedCheckId = useAtomValue(recentlyCompletedCheckIdAtom);

  const isPulsing = recentlyCompletedCheckId === check.id;

  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);
  const relativeTime = useCountdown(dueDate, check.status);
  const isActionable = !['complete', 'supplemental', 'missed', 'completing', 'queued'].includes(check.status);

  const handleCardClick = () => {
    if (isActionable) {
      setWorkflowState({
        view: 'form',
        type: 'scheduled',
        checkId: check.id,
        roomName: check.residents[0].location,
        residents: check.residents,
        specialClassification: check.specialClassification,
      });
    }
  };

  const { residents } = check;
  const roomName = residents[0]?.location || 'N/A';
  
  const showIndicator = !['complete', 'supplemental', 'missed', 'completing', 'queued'].includes(check.status);
  const cardClassName = `${styles.checkCard} ${isPulsing ? styles.isCompleting : ''}`;

  return (
    <motion.div
      layout
      animate={{ x: 0, height: 'auto', opacity: 1, marginBottom: 'var(--spacing-3)' }}
      transition={{ type: 'tween', duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      initial={{ opacity: 0 }}
      // DEFINITIVE FIX: The exit animation is now non-directional (no 'x' property).
      // This provides a smooth collapse animation suitable for both completion and filtering.
      exit={{ height: 0, opacity: 0, marginBottom: 0, overflow: 'hidden' }}
      className={cardClassName}
      data-status={check.status} 
      onClick={handleCardClick}
      aria-disabled={!isActionable}
      whileTap={isActionable ? { scale: 0.98 } : {}}
    >
      {showIndicator && <div className={styles.statusIndicator} data-status={check.status} />}

      <div className={styles.mainContent}>
        <div className={styles.topRow}>
          <div className={styles.locationInfo}>
            <span className={styles.locationText}>{roomName}</span>
          </div>
          <StatusBadge status={check.status} />
        </div>
        <div className={styles.bottomRow}>
          <ul className={styles.residentList}>
            {residents.map((resident) => (
              <ResidentListItem key={resident.id} resident={resident} check={check} />
            ))}
          </ul>
          <div className={styles.timeDisplay}>{isActionable ? relativeTime : ''}</div>
        </div>
      </div>
    </motion.div>
  );
};