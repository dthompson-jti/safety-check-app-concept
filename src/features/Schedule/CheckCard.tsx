// src/features/Schedule/CheckCard.tsx
import { useMemo } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { SafetyCheck } from '../../types';
import {
  workflowStateAtom,
  recentlyCompletedCheckIdAtom,
} from '../../data/atoms';
import { useCountdown } from '../../data/useCountdown';
import { Tooltip } from '../../components/Tooltip';
import { StatusBadge } from './StatusBadge';
import styles from './CheckCard.module.css';

interface CheckCardProps {
  check: SafetyCheck;
}

export const CheckCard = ({ check }: CheckCardProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const recentlyCompletedCheckId = useAtomValue(recentlyCompletedCheckIdAtom);

  const isPulsing = recentlyCompletedCheckId === check.id;

  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);
  const relativeTime = useCountdown(dueDate, check.status);
  const isActionable = check.status !== 'complete' && check.status !== 'supplemental' && check.status !== 'missed' && check.status !== 'completing';

  const handleCardClick = () => {
    if (isActionable) {
      // PRD CHANGE: Tapping a card now goes directly to the form, bypassing the scan view.
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

  const { residents, specialClassification } = check;
  const roomName = residents[0]?.location || 'N/A';
  
  const showIndicator = check.status !== 'complete' && check.status !== 'supplemental' && check.status !== 'missed' && check.status !== 'completing';
  const cardClassName = `${styles.checkCard} ${isPulsing ? styles.isCompleting : ''}`;

  return (
    <motion.div
      layout
      animate={{ x: 0, height: 'auto', opacity: 1, marginBottom: 'var(--spacing-3)' }}
      transition={{ type: 'tween', duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      initial={{ opacity: 0 }}
      exit={{ x: '100%', height: 0, opacity: 0, marginBottom: 0, overflow: 'hidden' }}
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