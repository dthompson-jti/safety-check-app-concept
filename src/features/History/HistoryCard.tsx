// src/features/History/HistoryCard.tsx
import { useMemo } from 'react';
import { SafetyCheck } from '../../types';
import styles from './HistoryCard.module.css';

interface HistoryCardProps {
  check: SafetyCheck;
}

const statusConfig = {
  complete: { icon: 'task_alt', label: 'Completed' },
  supplemental: { icon: 'add_circle', label: 'Supplemental' },
  late: { icon: 'error', label: 'Late' },
  missed: { icon: 'warning', label: 'Missed' },
  pending: { icon: '', label: '' },
};

const formatTime = (isoString: string): string => {
  return new Date(isoString).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const HistoryCard = ({ check }: HistoryCardProps) => {
  const { icon, label } = useMemo(() => statusConfig[check.status] || {}, [check.status]);

  const timestampLabel = useMemo(() => {
    if (check.lastChecked) {
      return `at ${formatTime(check.lastChecked)}`;
    }
    return `was due ${formatTime(check.dueDate)}`;
  }, [check.lastChecked, check.dueDate]);

  return (
    <div className={styles.historyCard} data-status={check.status}>
      <div className={styles.iconContainer}>
        <span className="material-symbols-rounded">{icon}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.primaryInfo}>
          <h4>{check.resident.location} - {check.resident.name}</h4>
        </div>
        <div className={styles.secondaryInfo}>
          <p>
            {label} <span>{timestampLabel}</span>
          </p>
        </div>
        {check.notes && <p className={styles.notes}>"{check.notes}"</p>}
      </div>
    </div>
  );
};