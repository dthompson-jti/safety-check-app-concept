import { useMemo } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion, Transition } from 'framer-motion';
import { SafetyCheck, Resident } from '../../types';
import {
  workflowStateAtom,
  recentlyCompletedCheckIdAtom,
  appConfigAtom
} from '../../data/atoms';
import { useCountdown } from '../../data/useCountdown';
import { StatusBadge } from './StatusBadge';
import styles from './CheckCard.module.css';

interface CheckCardProps {
  check: SafetyCheck;
  transition: Transition; // Accept the shared transition object
}

const ResidentListItem = ({ resident, check }: { resident: Resident; check: SafetyCheck }) => {
  // Logic: If ANY classification exists for this resident, show the warning icon.
  // This replaces the previous detailed text badges to reduce visual noise.
  const hasSpecialStatus = check.specialClassifications?.some(
    (sc) => sc.residentId === resident.id
  );

  return (
    <li className={styles.residentListItem}>
      {hasSpecialStatus && (
        <span className={`material-symbols-rounded ${styles.warningIcon}`}>
          warning
        </span>
      )}
      {resident.name}
    </li>
  );
};



export const CheckCard = ({ check, transition }: CheckCardProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const recentlyCompletedCheckId = useAtomValue(recentlyCompletedCheckIdAtom);
  const { showStatusIndicators } = useAtomValue(appConfigAtom);

  const isPulsing = recentlyCompletedCheckId === check.id;

  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);
  const relativeTime = useCountdown(dueDate, check.status);
  const isActionable = !['complete', 'supplemental', 'completing', 'queued'].includes(check.status);

  const handleCardClick = () => {
    if (isActionable) {
      setWorkflowState({
        view: 'form',
        type: 'scheduled',
        method: 'manual',
        checkId: check.id,
        roomName: check.residents[0].location,
        residents: check.residents,
        specialClassifications: check.specialClassifications,
      });
    }
  };

  const { residents } = check;
  const roomName = residents[0]?.location || 'N/A';

  const showIndicator = !['complete', 'supplemental', 'completing', 'queued'].includes(check.status);
  const cardClassName = `${styles.checkCard} ${isPulsing ? styles.isCompleting : ''}`;



  // Nested Motion Divs Pattern:
  // - Outer div: Controls height/margin collapse (delayed start)
  // - Inner div: Controls slide and fade (immediate start)
  // This separation prevents the instant height change that occurs when
  // height animation starts at same time as slide animation.
  // Note: No overflow:hidden on outer - it would clip the pulse box-shadow
  return (
    <motion.div
      // OUTER: Height collapse wrapper - starts AFTER slide completes
      initial={{ height: 'auto', marginBottom: 'var(--space-3)' }}
      animate={{ height: 'auto', marginBottom: 'var(--space-3)' }}
      exit={{
        height: 0,
        marginBottom: 0,
        overflow: 'hidden', // Only clip during exit animation
        transition: {
          // Collapse delay: 0.1s (after slide starts), duration: 0.2s
          delay: 0.1,
          duration: 0.2,
          ease: 'linear'
        }
      }}
    >
      <motion.div
        // INNER: Slide and fade animation - starts immediately
        transition={transition}
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{
          x: '100%',
          opacity: 0,
          transition: {
            // DEBUG: 2.5x slower - duration: 0.5s (normal: 0.2s)
            x: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
            opacity: { duration: 1.5, delay: 1, ease: 'easeOut' }
          }
        }}
        className={cardClassName}
        data-status={check.status}
        data-indicators-visible={showStatusIndicators}
        onClick={handleCardClick}
        aria-disabled={!isActionable}
        whileTap={isActionable ? { scale: 0.98 } : {}}
      >
        {showStatusIndicators && showIndicator && <div className={styles.statusIndicator} data-status={check.status} />}

        <div className={styles.mainContent}>
          <div className={styles.topRow}>
            <div className={styles.locationInfo}>
              <span className={styles.locationText}>{roomName}</span>
            </div>
            <StatusBadge status={check.status} type={check.type} dueDate={check.dueDate} />
          </div>
          <div className={styles.bottomRow}>
            <ul className={styles.residentList}>
              {residents.map((resident) => (
                <ResidentListItem key={resident.id} resident={resident} check={check} />
              ))}
            </ul>
            <div className={styles.timeDisplay}>{isActionable ? relativeTime : null}</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
