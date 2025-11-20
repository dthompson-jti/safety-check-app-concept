// src/features/Schedule/CheckCard.tsx
import { useMemo } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion, Transition } from 'framer-motion';
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
  transition: Transition; // Accept the shared transition object
}

const getClassificationBadge = (type: string): string => {
  const normalized = type.toLowerCase();
  if (normalized.includes('high risk')) return 'MSR';
  if (normalized.includes('suicide')) return 'SR';
  if (normalized.includes('watch')) return 'SW';
  // Fallback: First two chars uppercase
  return type.substring(0, 2).toUpperCase();
};

const ResidentListItem = ({ resident, check }: { resident: Resident; check: SafetyCheck }) => {
  const classification = check.specialClassifications?.find(
    (sc) => sc.residentId === resident.id
  );

  return (
    <li className={styles.residentListItem}>
      {classification && (
        <span className={styles.classificationBadge}>
          {getClassificationBadge(classification.type)}
        </span>
      )}
      {resident.name}
    </li>
  );
};

export const CheckCard = ({ check, transition }: CheckCardProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const recentlyCompletedCheckId = useAtomValue(recentlyCompletedCheckIdAtom);

  const isPulsing = recentlyCompletedCheckId === check.id;

  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);
  const relativeTime = useCountdown(dueDate, check.status);
  const isActionable = !['complete', 'supplemental', 'missed', 'completing', 'queued'].includes(check.status);

  const handleCardClick = () => {
    if (isActionable) {
      // Manually initiating a check from the UI sets the method to 'manual'.
      // This is the flag that triggers the attestation requirement on the form.
      setWorkflowState({
        view: 'form',
        type: 'scheduled',
        method: 'manual',
        checkId: check.id,
        roomName: check.residents[0].location,
        residents: check.residents,
        specialClassifications: check.specialClassifications,
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
      transition={transition}
      // Padding updated via CSS class, margin handled in CSS now too
      animate={{ x: 0, height: 'auto', opacity: 1 }}
      initial={{ opacity: 0 }}
      exit={{ height: 0, opacity: 0, overflow: 'hidden', marginBottom: 0 }}
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
          <StatusBadge status={check.status} type={check.type} />
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