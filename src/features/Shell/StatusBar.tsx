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
  tooltipContent?: React.ReactNode;
}

const StatusPill: React.FC<StatusPillProps> = ({ count, icon, status, tooltipContent }) => {
  const pill = (
    <div
      className={styles.statusPill}
      data-status={status}
      data-active="false"
    >
      <span className={`material-symbols-rounded ${styles.icon}`}>{icon}</span>
      <span className={styles.count}>{count}</span>
    </div>
  );

  // If tooltipContent is provided, wrap in Popover for touch-friendly interaction
  if (tooltipContent) {
    return (
      <Popover trigger={pill}>
        {tooltipContent}
      </Popover>
    );
  }

  return pill;
};


export const StatusBar = () => {
  const counts = useAtomValue(statusCountsAtom);

  // PRD-02: Blue Pill shows aggregated Due + Due Soon
  const aggregatedDueCount = counts.due + counts.dueSoon;

  // Simplified natural language - reads like a sentence
  const lateTooltip = (
    <div className={styles.popoverContent}>
      <span>{counts.late} Late</span>
    </div>
  );

  // PRD-02: Tapping Blue Pill shows breakdown - reads like sentences
  const dueTooltip = (
    <div className={styles.popoverContent}>
      <div>{counts.due} Due Now</div>
      <div>{counts.dueSoon} Due Soon</div>
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
        {/* PRD-02: Blue Pill shows aggregated count with breakdown popover */}
        <StatusPill count={aggregatedDueCount} icon="schedule" status="due-soon" tooltipContent={dueTooltip} />
        {/* Queued items are handled by OfflineBanner now */}
      </div>
    </motion.div>
  );
};