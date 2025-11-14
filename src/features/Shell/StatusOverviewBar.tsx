// src/features/Shell/StatusOverviewBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { statusCountsAtom } from '../../data/appDataAtoms';
import { connectionStatusAtom, isScheduleSearchActiveAtom } from '../../data/atoms';
import { Button } from '../../components/Button';
import { Tooltip } from '../../components/Tooltip';
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
      <span className="material-symbols-rounded">{icon}</span>
      <span className={styles.count}>{count}</span>
    </div>
  );
};

export const StatusOverviewBar = () => {
  const counts = useAtomValue(statusCountsAtom);
  const connectionStatus = useAtomValue(connectionStatusAtom);
  const setIsSearchActive = useSetAtom(isScheduleSearchActiveAtom);
  const isOffline = connectionStatus !== 'online';

  return (
    <motion.div
      className={styles.overviewBar}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'tween', duration: 0.2 }}
    >
      <div className={styles.statusPillContainer}>
        <StatusPill count={counts.late} icon="notifications" status="late" />
        <StatusPill count={counts.dueSoon} icon="schedule" status="dueSoon" />
        {isOffline && <StatusPill count={counts.queued} icon="cloud_off" status="queued" />}
        <StatusPill count={counts.completed} icon="check_circle" status="completed" />
      </div>

      <div className={styles.actionContainer}>
        <Tooltip content="Search schedule">
          <Button
            variant="tertiary"
            size="m"
            iconOnly
            onClick={() => setIsSearchActive(true)}
            aria-label="Search schedule"
          >
            <span className="material-symbols-rounded">search</span>
          </Button>
        </Tooltip>
      </div>
    </motion.div>
  );
};