// src/features/Schedule/StatusBadge.tsx
import React from 'react';
import { SafetyCheckStatus } from '../../types';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: SafetyCheckStatus;
}

const statusTextMap: Record<SafetyCheckStatus, string> = {
  late: 'Late',
  'due-soon': 'Due Soon',
  pending: 'Due',
  complete: 'Completed',
  completing: 'Completed',
  missed: 'Missed',
  queued: 'Queued',
  supplemental: 'Supplemental',
};

const statusIconMap: Partial<Record<SafetyCheckStatus, string>> = {
  late: 'warning',
  'due-soon': 'schedule',
  complete: 'check_circle',
  completing: 'check_circle',
  supplemental: 'add_comment',
  missed: 'cancel',
  queued: 'cloud_off',
};


export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (status === 'pending') {
    return null;
  }

  const text = statusTextMap[status];
  const icon = statusIconMap[status];

  return (
    <div className={styles.badge} data-status={status}>
      {icon && <span className={`material-symbols-rounded ${styles.badgeIcon}`}>{icon}</span>}
      {text}
    </div>
  );
};