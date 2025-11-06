// src/features/SafetyCheckSchedule/CheckCard.tsx
import { useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { SafetyCheck, SafetyCheckStatus } from '../../types';
import { currentTimeAtom, workflowStateAtom } from '../../data/atoms';
import { Tooltip } from '../../components/Tooltip';
import styles from './CheckCard.module.css';

interface CheckCardProps {
  check: SafetyCheck;
}

// FIX: Update time formatting logic to match the new design screenshot.
const formatRelativeTime = (dueDate: Date, now: Date, status: SafetyCheckStatus): string => {
  if (status === 'complete' || status === 'supplemental') return 'Completed';
  if (status === 'missed') return 'Missed';

  const diffSeconds = Math.round((dueDate.getTime() - now.getTime()) / 1000);

  if (status === 'late') {
    const absSeconds = Math.abs(diffSeconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    return `Overdue by ${mins}m ${secs}s`;
  }

  // Pending checks
  if (diffSeconds < 60) {
    return `Due in ${diffSeconds}s`;
  }
  if (diffSeconds < 3600) {
    const mins = Math.floor(diffSeconds / 60);
    const secs = diffSeconds % 60;
    return `Due in ${mins}m ${secs}s`;
  }
  const hours = Math.floor(diffSeconds / 3600);
  const mins = Math.floor((diffSeconds % 3600) / 60);
  return `Due in ${hours}h ${mins}m`;
};

export const CheckCard = ({ check }: CheckCardProps) => {
  const now = useAtomValue(currentTimeAtom);
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);

  const relativeTime = useMemo(() => formatRelativeTime(dueDate, now, check.status), [dueDate, now, check.status]);
  const statusText = useMemo(() => check.status.replace('-', ' '), [check.status]);

  const isActionable = check.status !== 'complete' && check.status !== 'missed' && check.status !== 'supplemental';

  const handleCardClick = () => {
    if (isActionable) {
      setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
    }
  };

  return (
    // FIX: Update JSX structure to match the new design
    <motion.div
      layout
      className={styles.checkCard}
      data-status={check.status}
      onClick={handleCardClick}
      aria-disabled={!isActionable}
    >
      <div className={styles.statusIndicator} />
      <div className={styles.content}>
        <div className={styles.primaryInfo}>
          {check.resident.location} &middot; {check.resident.name}
        </div>
        <div className={styles.secondaryInfo}>
          <span>{statusText}</span> &middot; <span>{relativeTime}</span>
        </div>
      </div>
      {check.specialClassification && (
        <Tooltip content={check.specialClassification.details}>
          <div className={styles.specialClassification}>
            <span className="material-symbols-rounded">shield_person</span>
          </div>
        </Tooltip>
      )}
    </motion.div>
  );
};