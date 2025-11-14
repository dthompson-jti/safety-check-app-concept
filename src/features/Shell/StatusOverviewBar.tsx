// src/features/Shell/StatusOverviewBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { statusCountsAtom } from '../../data/appDataAtoms';
import { connectionStatusAtom } from '../../data/atoms';
import styles from './StatusOverviewBar.module.css';

type StatusType = 'late' | 'dueSoon' | 'due' | 'completed' | 'queued';

const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const transition = { type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] } as const;

const StatusPill: React.FC<{ count: number; label: string; status: StatusType }> = ({ count, label, status }) => {
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
      <AnimatePresence initial={false}>
        <motion.span
          key={count}
          className={styles.count}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0, position: 'absolute' }}
          transition={transition}
        >
          {count}
        </motion.span>
      </AnimatePresence>
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export const StatusOverviewBar = () => {
  const counts = useAtomValue(statusCountsAtom);
  const connectionStatus = useAtomValue(connectionStatusAtom);
  const isOffline = connectionStatus !== 'online';

  return (
    <div className={styles.overviewBar}>
      <StatusPill count={counts.late} label="Late" status="late" />
      <StatusPill count={counts.dueSoon} label="Due soon" status="dueSoon" />
      <StatusPill count={counts.due} label="Due" status="due" />
      {isOffline && <StatusPill count={counts.queued} label="Queued" status="queued" />}
      <StatusPill count={counts.completed} label="Completed" status="completed" />
    </div>
  );
};