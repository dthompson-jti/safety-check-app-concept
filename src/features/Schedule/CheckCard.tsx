// src/features/Schedule/CheckCard.tsx
import { useState, useEffect, useMemo } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { SafetyCheck } from '../../types';
import { workflowStateAtom, recentlyCompletedCheckIdAtom } from '../../data/atoms';
import { useCountdown } from '../../data/useCountdown';
import { Tooltip } from '../../components/Tooltip';
import { StatusBadge } from './StatusBadge';
import styles from './CheckCard.module.css';

interface CheckCardProps {
  check: SafetyCheck;
}

export const CheckCard = ({ check }: CheckCardProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const recentlyCompletedCheckId = useAtomValue(recentlyCompletedCheckIdAtom);
  const [isCompleting, setIsCompleting] = useState(false);

  // DEFINITIVE FIX: This robust useEffect handles component recycling.
  // It ensures the animation state is correctly set or reset whenever the
  // component's props change or the global completion atom updates.
  useEffect(() => {
    let timerId: number | undefined;

    if (recentlyCompletedCheckId === check.id) {
      setIsCompleting(true);
      timerId = window.setTimeout(() => {
        setIsCompleting(false);
      }, 1200); // Duration must match the CSS animation
    } else {
      // Explicitly reset state if this component is recycled for a different check
      setIsCompleting(false);
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [recentlyCompletedCheckId, check.id]);

  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);
  const relativeTime = useCountdown(dueDate, check.status);
  const isActionable = check.status !== 'complete' && check.status !== 'supplemental' && check.status !== 'missed';

  const handleCardClick = () => {
    if (isActionable) {
      setWorkflowState({
        view: 'scanning',
        isManualSelectionOpen: false,
        targetCheckId: check.id,
      });
    }
  };

  const { residents, specialClassification, status } = check;
  const roomName = residents[0]?.location || 'N/A';
  const showIndicator = status !== 'complete' && status !== 'supplemental' && status !== 'missed';

  const cardClassName = `${styles.checkCard} ${isCompleting ? styles.isCompleting : ''}`;

  return (
    <motion.div
      layout
      className={cardClassName}
      data-status={status}
      onClick={handleCardClick}
      aria-disabled={!isActionable}
      whileTap={isActionable ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {showIndicator && <div className={styles.statusIndicator} data-status={status} />}

      <div className={styles.mainContent}>
        <div className={styles.topRow}>
          <div className={styles.locationInfo}>
            {specialClassification && (
              <Tooltip content={`${specialClassification.type}: ${specialClassification.details}`}>
                <span className={`material-symbols-rounded ${styles.filledIcon}`}>warning</span>
              </Tooltip>
            )}
            <span className={styles.locationText}>{roomName}</span>
          </div>
          {/* DEFINITIVE FIX: Always render the common StatusBadge, removing the intermediate state */}
          <StatusBadge status={isCompleting ? 'complete' : status} />
        </div>
        <div className={styles.bottomRow}>
          <ul className={styles.residentList}>
            {residents.map((resident) => (
              <li key={resident.id}>{resident.name}</li>
            ))}
          </ul>
          <div className={styles.timeDisplay}>{relativeTime}</div>
        </div>
      </div>
    </motion.div>
  );
};