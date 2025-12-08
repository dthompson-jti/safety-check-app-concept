// src/features/Shell/StatusBar.tsx
import React from 'react';
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { statusCountsAtom } from '../../data/appDataAtoms';
import { Tooltip } from '../../components/Tooltip';
import type { ScheduleFilter } from '../../types';
import styles from './StatusBar.module.css';

// This type correctly excludes 'all' from the possible statuses for a pill.
type StatusType = Exclude<ScheduleFilter, 'all'>;

interface StatusPillProps {
  count: number;
  icon: string;
  status: StatusType;
  tooltipContent: React.ReactNode;
}

const StatusPill: React.FC<StatusPillProps> = ({ count, icon, status, tooltipContent }) => {
  return (
    <Tooltip content={tooltipContent} side="bottom" delay={200}>
      <div
        className={styles.statusPill}
        data-status={status}
        data-active="false"
      >
        <span className={`material-symbols-rounded ${styles.icon}`}>{icon}</span>
        <span className={styles.count}>{count}</span>
      </div>
    </Tooltip>
  );
};


export const StatusBar = () => {
  const counts = useAtomValue(statusCountsAtom);

  const lateTooltip = "Late: Checks past their 15-minute max window";
  const dueTooltip = (
    <div style={{ textAlign: 'left' }}>
      <div>Due now: Checks within the deadline window</div>
      <div>Due soon: Approaching within 2 minutes</div>
    </div>
  );

  return (
    <motion.div
      className={styles.statusBar}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'tween', duration: 0.2 }}
    >
      <div className={styles.contentContainer}>
        <StatusPill count={counts.late} icon="notifications" status="late" tooltipContent={lateTooltip} />
        <StatusPill count={counts.dueSoon} icon="schedule" status="due-soon" tooltipContent={dueTooltip} />
        {/* Queued items are handled by OfflineBanner now */}
      </div>
    </motion.div>
  );
};