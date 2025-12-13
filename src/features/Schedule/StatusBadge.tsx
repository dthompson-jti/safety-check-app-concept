// src/features/Schedule/StatusBadge.tsx
import React, { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { SafetyCheckStatus, SafetyCheckType } from '../../types';
import { slowTickerAtom } from '../../data/atoms';
import { featureFlagsAtom } from '../../data/featureFlags';
import styles from './StatusBadge.module.css';

// Global animation sync base - shared across all components for perfect alignment
// Badge pulse: 1.2s (1x base), Card border/hazard: 2.4s (2x base), Magma: 4s (~3.3x base)
const ANIMATION_SYNC_BASE_MS = 1200;

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
  // All hooks MUST be at top before any early returns (React Rules of Hooks)
  const now = useAtomValue(slowTickerAtom);
  const { feat_badge_mode, feat_invert_badge, feat_invert_card } = useAtomValue(featureFlagsAtom);

  // Calculate sync delay ONCE on mount - aligns animation to global clock
  const syncDelay = useMemo(() => {
    return -(Date.now() % ANIMATION_SYNC_BASE_MS);
  }, []); // Empty deps = only runs on mount

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

  // Determine which classes to apply to badge
  // Invert Badge: solid red bg, white text
  // Invert Card: white bg, red text (to contrast with red card)
  const shouldInvertBadgeOnly = status === 'missed' && feat_invert_badge && !feat_invert_card;
  const shouldInvertForCard = status === 'missed' && feat_invert_card;
  const shouldPulse = feat_badge_mode === 'pulse' && status === 'missed';

  const badgeClasses = [
    styles.badge,
    shouldPulse ? styles.badgePulse : '',
    shouldInvertBadgeOnly ? styles.badgeInvert : '',
    shouldInvertForCard ? styles.badgeInvertForCard : ''
  ].filter(Boolean).join(' ');

  // Apply sync delay only when pulsing
  const badgeStyle = shouldPulse ? { animationDelay: `${syncDelay}ms` } : undefined;

  return (
    <div className={badgeClasses} data-status={effectiveStatus} style={badgeStyle}>
      {config.icon && (
        <span className={`material-symbols-rounded ${styles.badgeIcon}`}>
          {config.icon}
        </span>
      )}
      {label}
    </div>
  );
};