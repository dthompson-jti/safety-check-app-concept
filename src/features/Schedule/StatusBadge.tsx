// src/features/Schedule/StatusBadge.tsx
import React from 'react';
import { SafetyCheckStatus, SafetyCheckType } from '../../types';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: SafetyCheckStatus;
  type?: SafetyCheckType;
}

const getStatusConfig = (status: SafetyCheckStatus) => {
  switch (status) {
    case 'late':
      return { label: 'Late', icon: 'notifications' };
    case 'due-soon':
      return { label: 'Due Soon', icon: 'schedule' };
    case 'missed':
      return { label: 'Missed', icon: 'error' };
    case 'complete':
      return { label: 'Complete', icon: 'check_circle' };
    case 'completing':
      return { label: 'Completing', icon: 'pending' };
    case 'queued':
      return { label: 'Queued', icon: 'cloud_off' };
    default:
      return { label: status, icon: 'info' };
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  // User Request: "Upcoming" items (which are 'pending') should NOT have a badge.
  // "Due Soon" items SHOULD have a badge.
  if (status === 'pending') {
    return null;
  }

  const config = getStatusConfig(status);

  // specific override for supplemental if needed, or just use status
  const label = type === 'supplemental' && status === 'complete' ? 'Supplemental' : config.label;

  return (
    <div className={styles.badge} data-status={status}>
      <span className={`material-symbols-rounded ${styles.badgeIcon}`}>
        {config.icon}
      </span>
      {label}
    </div>
  );
};