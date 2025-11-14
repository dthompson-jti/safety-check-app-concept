// src/features/Shell/StatusOverviewBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { statusCountsAtom } from '../../data/appDataAtoms';
// DEFINITIVE FIX: Import the `ScheduleFilter` type from its source of truth, `types.ts`.
import type { ScheduleFilter } from '../../types';
import {
  connectionStatusAtom,
  scheduleFilterAtom,
  isScheduleRefreshingAtom,
} from '../../data/atoms';
import styles from './StatusOverviewBar.module.css';

// This type correctly excludes 'all' from the possible statuses for a pill.
type StatusType = Exclude<ScheduleFilter, 'all'>;

const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

interface StatusPillProps {
  count: number;
  icon: string;
  status: StatusType;
  filter: ScheduleFilter;
  onFilterChange: (filter: ScheduleFilter) => void;
}

const StatusPill: React.FC<StatusPillProps> = ({ count, icon, status, filter, onFilterChange }) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const prevCount = usePrevious(count);

  useEffect(() => {
    if (prevCount !== undefined && count !== prevCount) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [count, prevCount]);

  const handleClick = () => {
    // This logic is type-safe because `status` is a valid ScheduleFilter, and so is 'all'.
    onFilterChange(filter === status ? 'all' : status);
  };

  return (
    <button
      className={`${styles.statusPill} ${isFlashing ? styles.flash : ''}`}
      data-status={status}
      data-active={filter === status}
      onClick={handleClick}
      disabled={count === 0}
    >
      <span className={`material-symbols-rounded ${styles.icon}`}>{icon}</span>
      <span className={styles.count}>{count}</span>
    </button>
  );
};

export const StatusOverviewBar = () => {
  const counts = useAtomValue(statusCountsAtom);
  const connectionStatus = useAtomValue(connectionStatusAtom);
  const [filter, setFilter] = useAtom(scheduleFilterAtom);
  const setIsRefreshing = useSetAtom(isScheduleRefreshingAtom);
  const isOffline = connectionStatus !== 'online';

  const handleFilterChange = (newFilter: ScheduleFilter) => {
    setIsRefreshing(true);
    setFilter(newFilter);
    setTimeout(() => setIsRefreshing(false), 500); // Simulate refetch
  };

  return (
    <motion.div
      className={styles.overviewBar}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'tween', duration: 0.2 }}
    >
      <div className={styles.contentContainer}>
        <StatusPill count={counts.late} icon="notifications" status="late" filter={filter} onFilterChange={handleFilterChange} />
        <StatusPill count={counts.dueSoon} icon="schedule" status="due-soon" filter={filter} onFilterChange={handleFilterChange} />
        {isOffline && <StatusPill count={counts.queued} icon="cloud_off" status="queued" filter={filter} onFilterChange={handleFilterChange} />}
      </div>
    </motion.div>
  );
};