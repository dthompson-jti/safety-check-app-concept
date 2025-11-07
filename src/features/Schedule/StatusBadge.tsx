// src/features/Schedule/StatusBadge.tsx
// NEW FILE
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
  missed: 'Missed',
  supplemental: 'Supplemental',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // Do not render a badge for the default 'pending' state.
  if (status === 'pending') {
    return null;
  }

  const text = statusTextMap[status] || 'Scheduled';

  return (
    <div className={styles.badge} data-status={status}>
      {text}
    </div>
  );
};