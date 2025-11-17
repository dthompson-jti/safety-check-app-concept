// src/features/Schedule/CheckListItem.tsx
import { useMemo } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion, Transition } from 'framer-motion';
import { SafetyCheck, Resident } from '../../types';
import { workflowStateAtom, recentlyCompletedCheckIdAtom } from '../../data/atoms';
import { useCountdown } from '../../data/useCountdown';
import { StatusBadge } from './StatusBadge';
import styles from './CheckListItem.module.css';

interface CheckListItemProps {
  check: SafetyCheck;
  transition: Transition; // Accept the shared transition object
}

const ResidentListItem = ({ resident, check }: { resident: Resident; check: SafetyCheck }) => {
  const isClassified = check.specialClassifications?.some(
    (sc) => sc.residentId === resident.id
  );

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

export const CheckListItem = ({ check, transition }: CheckListItemProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const recentlyCompletedCheckId = useAtomValue(recentlyCompletedCheckIdAtom);

  const isPulsing = recentlyCompletedCheckId === check.id;

  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);
  const relativeTime = useCountdown(dueDate, check.status);
  const isActionable = !['complete', 'supplemental', 'missed', 'completing', 'queued'].includes(check.status);

  const handleItemClick = () => {
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
  const listItemClassName = `${styles.checkListItem} ${isPulsing ? styles.isCompleting : ''}`;

  return (
    <motion.div
      layout
      transition={transition}
      animate={{ x: 0, height: 'auto', opacity: 1, borderBottomWidth: '1px' }}
      initial={{ opacity: 0 }}
      exit={{ height: 0, opacity: 0, borderBottomWidth: 0, overflow: 'hidden' }}
      className={listItemClassName}
      data-status={check.status}
      onClick={handleItemClick}
      aria-disabled={!isActionable}
      whileTap={isActionable ? { scale: 0.99, backgroundColor: 'var(--surface-bg-primary_hover)' } : {}}
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