// src/features/Schedule/CheckCard.tsx
import { useMemo } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion, Transition } from 'framer-motion';
import { SafetyCheck, Resident } from '../../types';
import {
  workflowStateAtom,
  recentlyCompletedCheckIdAtom,
  appConfigAtom,
  slowTickerAtom
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

// PRD-006: Helper to format absolute time (No seconds, per user request)
const formatAbsoluteTime = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
  };
  return date.toLocaleTimeString(undefined, options);
};

// PRD-006: Sub-component for absolute time display (subscribes to 1fps ticker)
const AbsoluteTimeDisplay = ({ dueTime }: { dueTime: Date }) => {
  useAtomValue(slowTickerAtom); // Re-render at 1fps
  return <>{formatAbsoluteTime(dueTime)}</>;
};

export const CheckCard = ({ check, transition }: CheckCardProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const recentlyCompletedCheckId = useAtomValue(recentlyCompletedCheckIdAtom);
  const { showStatusIndicators, timeDisplayMode } = useAtomValue(appConfigAtom);

  const isPulsing = recentlyCompletedCheckId === check.id;

  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);
  const relativeTime = useCountdown(dueDate, check.status);
  const isActionable = !['complete', 'supplemental', 'missed', 'completing', 'queued'].includes(check.status);

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

  const showIndicator = !['complete', 'supplemental', 'missed', 'completing', 'queued'].includes(check.status);
  const cardClassName = `${styles.checkCard} ${isPulsing ? styles.isCompleting : ''}`;

  // PRD-006: Render time based on mode
  const renderTimeDisplay = () => {
    if (!isActionable) return null;

    switch (timeDisplayMode) {
      case 'absolute':
        return <AbsoluteTimeDisplay dueTime={dueDate} />;
      case 'dual':
        return (
          <>
            <span className={styles.dualSecondary}>
              <AbsoluteTimeDisplay dueTime={dueDate} />
            </span>
            <span>{relativeTime}</span>
          </>
        );
      case 'relative':
      default:
        return relativeTime;
    }
  };

  return (
    <motion.div
      layout
      transition={transition}
      animate={{ x: 0, height: 'auto', opacity: 1 }}
      initial={{ opacity: 0 }}
      // UPDATED EXIT ANIMATION: Slide right (x: 100%) + Collapse height
      exit={{ x: '100%', height: 0, opacity: 0, overflow: 'hidden', marginBottom: 0 }}
      className={cardClassName}
      data-status={check.status}
      // Data attribute controls padding logic in CSS
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
          <StatusBadge status={check.status} type={check.type} />
        </div>
        <div className={styles.bottomRow}>
          <ul className={styles.residentList}>
            {residents.map((resident) => (
              <ResidentListItem key={resident.id} resident={resident} check={check} />
            ))}
          </ul>
          <div className={styles.timeDisplay}>{renderTimeDisplay()}</div>
        </div>
      </div>
    </motion.div>
  );
};
