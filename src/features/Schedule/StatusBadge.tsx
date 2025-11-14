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
  queued: 'Queued', // FIX: Added entry for the 'queued' status
  supplemental: 'Supplemental',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (status === 'pending') {
    return null;
  }

  const text = statusTextMap[status];

  return (
    <div className={styles.badge} data-status={status}>
      {text}
    </div>
  );
};