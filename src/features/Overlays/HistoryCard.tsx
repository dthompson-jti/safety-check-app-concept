// src/features/Overlays/HistoryCard.tsx
import { useMemo } from 'react';
import { SafetyCheck } from '../../types';
import styles from './HistoryCard.module.css';

interface HistoryCardProps {
  check: SafetyCheck;
}

const statusConfig: Record<string, { icon: string; label: string }> = {
  complete: { icon: 'task_alt', label: 'Completed' },
  supplemental: { icon: 'add_circle', label: 'Supplemental' },
  late: { icon: 'error', label: 'Late' },
  missed: { icon: 'warning', label: 'Missed' },
  pending: { icon: '', label: '' },
};
// FIX: Provide a safe fallback object to prevent unsafe assignment from `|| {}`
const defaultConfig = { icon: 'help', label: 'Unknown' };

const formatTime = (isoString: string): string => {
  return new Date(isoString).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const HistoryCard = ({ check }: HistoryCardProps) => {
  // FIX: Use the safe fallback to ensure icon/label are always defined strings.
  const { icon, label } = useMemo(() => statusConfig[check.status] || defaultConfig, [check.status]);

  const timestampLabel = useMemo(() => {
    if (check.lastChecked) {
      return `at ${formatTime(check.lastChecked)}`;
    }
    return `was due ${formatTime(check.dueDate)}`;
  }, [check.lastChecked, check.dueDate]);

  // FIX: Safely access resident data from the new `residents` array.
  const primaryInfoText = useMemo(() => {
    if (!check.residents || check.residents.length === 0) {
      return 'Unknown Location - Unknown Resident';
    }
    const location = check.residents[0].location;
    const names = check.residents.map(r => r.name).join(' / ');
    return `${location} - ${names}`;
  }, [check.residents]);

  return (
    <div className={styles.historyCard} data-status={check.status}>
      <div className={styles.iconContainer}>
        <span className="material-symbols-rounded">{icon}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.primaryInfo}>
          <h4>{primaryInfoText}</h4>
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