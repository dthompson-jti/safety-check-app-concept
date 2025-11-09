// src/features/Shell/StatusOverviewBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { statusCountsAtom } from '../../data/appDataAtoms';
import styles from './StatusOverviewBar.module.css';

type StatusType = 'late' | 'dueSoon' | 'due' | 'completed';

const usePrevious = <T,>(value: T): T | undefined => {
  // DEFINITIVE FIX: Initialize the ref with a value (undefined is appropriate here)
  // to satisfy the hook's signature, which expects an initial value.
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const StatusPill: React.FC<{ count: number; label: string; status: StatusType }> = ({ count, label, status }) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const prevCount = usePrevious(count);

  useEffect(() => {
    if (prevCount !== undefined && count !== prevCount) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [count, prevCount]);

  return (
    <div className={`${styles.statusPill} ${isFlashing ? styles.flash : ''}`} data-status={status}>
      <span className={styles.count}>{count}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export const StatusOverviewBar = () => {
  const counts = useAtomValue(statusCountsAtom);

  return (
    <div className={styles.overviewBar}>
      <StatusPill count={counts.late} label="Late" status="late" />
      <StatusPill count={counts.dueSoon} label="Due soon" status="dueSoon" />
      <StatusPill count={counts.due} label="Due" status="due" />
      <StatusPill count={counts.completed} label="Completed" status="completed" />
    </div>
  );
};