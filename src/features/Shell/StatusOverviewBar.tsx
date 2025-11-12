// src/features/Shell/StatusOverviewBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { statusCountsAtom } from '../../data/appDataAtoms';
import styles from './StatusOverviewBar.module.css';

type StatusType = 'late' | 'dueSoon' | 'due' | 'completed';

const usePrevious = <T,>(value: T): T | undefined => {
  // This ref stores the previous value of a prop or state.
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

// BUG FIX: Add `as const` to ensure TypeScript infers the most specific
// type for this object, which is required by Framer Motion's prop types.
const transition = { type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] } as const;

const StatusPill: React.FC<{ count: number; label: string; status: StatusType }> = ({ count, label, status }) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const prevCount = usePrevious(count);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (prevCount !== undefined && count !== prevCount) {
      setIsFlashing(true);
      setIsAnimating(true);
      const flashTimer = setTimeout(() => setIsFlashing(false), 1200);
      const animTimer = setTimeout(() => setIsAnimating(false), 350);
      return () => {
        clearTimeout(flashTimer);
        clearTimeout(animTimer);
      };
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
      <motion.div
        className={styles.count}
        animate={{ scale: isAnimating ? 1.2 : 1 }}
        transition={transition}
        style={{ position: 'absolute', opacity: 0 }} /* This is a ghost element for the scale animation */
      >
        {count}
      </motion.div>
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