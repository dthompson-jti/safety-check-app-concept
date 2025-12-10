// src/features/Schedule/StatusBadge.tsx
import React from 'react';
import { useAtomValue } from 'jotai';
import { SafetyCheckStatus, SafetyCheckType } from '../../types';
import { slowTickerAtom } from '../../data/atoms';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: SafetyCheckStatus;
  type?: SafetyCheckType;
  dueDate?: string; // ISO date string for calculating missed cycles
}

// Helper to return configuration. Icon can now be null.
const getStatusConfig = (status: SafetyCheckStatus): { label: string; icon: string | null } => {
  switch (status) {
    case 'due':
      return { label: 'Due', icon: 'schedule' };
    case 'missed':
      return { label: 'Missed', icon: 'notifications_active' };
    case 'completing':
      return { label: 'Completed', icon: 'check_circle' };
    case 'complete':
      return { label: 'Completed', icon: 'check_circle' };
    case 'queued':
      return { label: 'Queued', icon: 'cloud_off' };
    default:
      // early, pending return no badge
      return { label: '', icon: null };
  }
};

/**
 * Calculate dynamic missed badge label based on 15-min cycles.
 * "Missed" = 1 cycle, "2 Missed" = 2 cycles, etc.
 */
const getMissedLabel = (dueDate: string, now: number): string => {
  const dueTime = new Date(dueDate).getTime();
  const elapsedMinutes = (now - dueTime) / (60 * 1000);

  // Each 15-minute interval counts as another missed cycle
  const cycles = Math.max(1, Math.ceil(elapsedMinutes / 15));

  return cycles === 1 ? 'Missed' : `${cycles} Missed`;
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type, dueDate }) => {
  // Subscribe to slow ticker for missed badge updates
  const now = useAtomValue(slowTickerAtom);

  // Upcoming items (early/pending) should NOT have a badge
  if (status === 'pending' || status === 'early') {
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

  // Dynamic label for missed checks
  if (status === 'missed' && dueDate) {
    label = getMissedLabel(dueDate, now);
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