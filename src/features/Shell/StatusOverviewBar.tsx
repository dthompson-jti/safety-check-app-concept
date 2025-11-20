// src/features/Shell/StatusOverviewBar.tsx
import React from 'react';
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { statusCountsAtom } from '../../data/appDataAtoms';
import type { ScheduleFilter } from '../../types';
import styles from './StatusOverviewBar.module.css';

// This type correctly excludes 'all' from the possible statuses for a pill.
type StatusType = Exclude<ScheduleFilter, 'all'>;

interface StatusPillProps {
  count: number;
  icon: string;
  status: StatusType;
}

const StatusPill: React.FC<StatusPillProps> = ({ count, icon, status }) => {
  return (
    // Removed interactivity (onClick) and disabled logic as requested.
    // The pill is now purely informational.
    <div
      className={styles.statusPill}
      data-status={status}
      data-active="false" 
    >
      <span className={`material-symbols-rounded ${styles.icon}`}>{icon}</span>
      <span className={styles.count}>{count}</span>
    </div>
  );
};

export const StatusOverviewBar = () => {
  const counts = useAtomValue(statusCountsAtom);

  return (
    <motion.div
      className={styles.overviewBar}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'tween', duration: 0.2 }}
    >
      <div className={styles.contentContainer}>
        <StatusPill count={counts.late} icon="notifications" status="late" />
        <StatusPill count={counts.dueSoon} icon="schedule" status="due-soon" />
        {/* Queued pill functionality moved to OfflineBanner */}
      </div>
    </motion.div>
  );
};