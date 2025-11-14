// src/features/Shell/StatusOverviewBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { statusCountsAtom } from '../../data/appDataAtoms';
import { connectionStatusAtom } from '../../data/atoms';
import styles from './StatusOverviewBar.module.css';

type StatusType = 'late' | 'dueSoon' | 'completed' | 'queued';

const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const StatusPill: React.FC<{ count: number; icon: string; status: StatusType }> = ({ count, icon, status }) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const prevCount = usePrevious(count);

  useEffect(() => {
    if (prevCount !== undefined && count !== prevCount) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [count, prevCount]);

  return (
    <div className={`${styles.statusPill} ${isFlashing ? styles.flash : ''}`} data-status={status}>
      {/* DEFINITIVE FIX: Apply the local `styles.icon` class directly to the icon span. */}
      <span className={`material-symbols-rounded ${styles.icon}`}>{icon}</span>
      <span className={styles.count}>{count}</span>
    </div>
  );
};

export const StatusOverviewBar = () => {
  const counts = useAtomValue(statusCountsAtom);
  const connectionStatus = useAtomValue(connectionStatusAtom);
  const isOffline = connectionStatus !== 'online';

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
        <StatusPill count={counts.dueSoon} icon="schedule" status="dueSoon" />
        {isOffline && <StatusPill count={counts.queued} icon="cloud_off" status="queued" />}
        <StatusPill count={counts.completed} icon="check_circle" status="completed" />
      </div>
    </motion.div>
  );
};