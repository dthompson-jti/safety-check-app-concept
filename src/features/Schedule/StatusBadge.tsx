// src/features/Schedule/StatusBadge.tsx
import React from 'react';
import { SafetyCheckStatus, SafetyCheckType } from '../../types';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: SafetyCheckStatus;
  type?: SafetyCheckType;
}

// Helper to return configuration. Icon can now be null.
const getStatusConfig = (status: SafetyCheckStatus): { label: string; icon: string | null } => {
  switch (status) {
    case 'late':
      return { label: 'Late', icon: 'notifications' };
    case 'due-soon':
      return { label: 'Due Soon', icon: 'schedule' };
    case 'early':
      // No icon for Early status
      return { label: 'Early', icon: null };
    case 'completing':
      return { label: 'Completed', icon: 'check_circle' };
    case 'complete':
      return { label: 'Completed', icon: 'check_circle' };
    case 'missed':
      return { label: 'Missed', icon: 'history' };
    case 'queued':
      return { label: 'Queued', icon: 'cloud_off' };
    default:
      return { label: status, icon: 'info' };
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  // User Request: "Upcoming" items (which are 'pending') should NOT have a badge.
  if (status === 'pending') {
    return null;
  }

  const config = getStatusConfig(status);

  // Determine label and effective status for styling
  let label = config.label;
  // FIX: Explicitly type as string to allow 'supplemental' and avoid narrowing conflicts
  let effectiveStatus: string = status;

  if (type === 'supplemental') {
    label = 'Supplemental';
    effectiveStatus = 'supplemental';
  }

  return (
    <div className={styles.badge} data-status={effectiveStatus}>
      {config.icon && (
        <span className={`material-symbols-rounded ${styles.badgeIcon}`}>
          {config.icon}
        </span>
      )}
      {label}
    </div>
  );
};