// src/features/Shell/StatusBar.tsx
import React from 'react';
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { statusCountsAtom } from '../../data/appDataAtoms';
import { Popover } from '../../components/Popover';
import type { ScheduleFilter } from '../../types';
import styles from './StatusBar.module.css';

// This type correctly excludes 'all' from the possible statuses for a pill.
type StatusType = Exclude<ScheduleFilter, 'all'>;

interface StatusPillProps {
  count: number;
  icon: string;
  status: StatusType;
  variant: 'default' | 'solid';
  tooltipContent?: React.ReactNode;
}

const StatusPill: React.FC<StatusPillProps> = ({ count, icon, status, variant, tooltipContent }) => {
  const isEmpty = count === 0;
  const pill = (
    <div
      className={styles.statusPill}
      data-status={status}
      data-variant={variant}
      data-active="false"
      data-empty={isEmpty ? "true" : undefined}
    >
      <span className={`material-symbols-rounded ${styles.icon}`}>{icon}</span>
      <span className={styles.count}>{count}</span>
    </div>
  );

  // If tooltipContent is provided, wrap in Popover for touch-friendly interaction
  if (tooltipContent) {
    return (
      <Popover trigger={pill} variant="tooltip">
        {tooltipContent}
      </Popover>
    );
  }

  return pill;
};


interface StatusBarProps {
  variant?: 'default' | 'solid';
}

export const StatusBar = ({ variant = 'default' }: StatusBarProps) => {
  const counts = useAtomValue(statusCountsAtom);

  // Tooltips for each status
  const missedTooltip = (
    <div className={styles.popoverContent}>
      <span>{counts.missed} Missed</span>
    </div>
  );

  const dueTooltip = (
    <div className={styles.popoverContent}>
      <span>{counts.due} Due</span>
    </div>
  );

  return (
    <motion.div
      className={styles.statusBar}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'tween', duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
      data-variant={variant}
    >
      <div className={styles.contentContainer} data-variant={variant}>
        {/* Missed pill (red) - always visible, softened when count=0 */}
        <StatusPill count={counts.missed} icon="notifications_active" status="missed" variant={variant} tooltipContent={missedTooltip} />
        {/* Due pill (yellow/warning) - always visible, softened when count=0 */}
        <StatusPill count={counts.due} icon="schedule" status="due" variant={variant} tooltipContent={dueTooltip} />
      </div>
    </motion.div>
  );
};
