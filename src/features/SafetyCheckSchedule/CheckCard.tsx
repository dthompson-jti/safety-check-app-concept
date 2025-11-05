// src/features/SafetyCheckSchedule/CheckCard.tsx
import { useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { SafetyCheck } from '../../types';
import { currentTimeAtom, workflowStateAtom } from '../../data/atoms';
import { Tooltip } from '../../components/Tooltip';
import styles from './CheckCard.module.css';

interface CheckCardProps {
  check: SafetyCheck;
}

const formatRelativeTime = (dueDate: Date, now: Date, status: SafetyCheck['status']): string => {
  if (status === 'complete') return 'Completed';

  const diffSeconds = Math.round((dueDate.getTime() - now.getTime()) / 1000);
  const diffMins = Math.round(diffSeconds / 60);

  if (diffMins < 0) {
    return `Overdue by ${Math.abs(diffMins)}m`;
  }
  if (diffMins === 0) {
    return 'Due now';
  }
  if (diffMins < 60) {
    return `Due in ${diffMins}m`;
  }
  const diffHours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;
  return `Due in ${diffHours}h ${remainingMins}m`;
};

export const CheckCard = ({ check }: CheckCardProps) => {
  const now = useAtomValue(currentTimeAtom);
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);

  const relativeTime = useMemo(() => formatRelativeTime(dueDate, now, check.status), [dueDate, now, check.status]);
  const statusText = useMemo(() => check.status.replace('-', ' '), [check.status]);

  const handleCardClick = () => {
    if (check.status !== 'complete') {
      setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
    }
  };

  return (
    <motion.div
      layout
      className={styles.checkCard}
      data-status={check.status}
      onClick={handleCardClick}
      aria-disabled={check.status === 'complete'}
    >
      <div className={styles.statusIndicator} />
      <div className={styles.content}>
        <div className={styles.primaryInfo}>
          <span>
            {check.resident.location} &middot; {check.resident.name}
          </span>
          {check.specialClassification && (
            <Tooltip content={check.specialClassification.details}>
              <div className={styles.specialClassification}>
                <span className="material-symbols-rounded">shield_person</span>
              </div>
            </Tooltip>
          )}
        </div>
        <div className={styles.secondaryInfo}>
          <span>{statusText}</span> &middot; <span>{relativeTime}</span>
        </div>
      </div>
    </motion.div>
  );
};