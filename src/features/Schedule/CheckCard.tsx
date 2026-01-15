import { useMemo, useRef } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { motion, Transition } from 'framer-motion';
import { SafetyCheck, Resident } from '../../types';
import {
  workflowStateAtom,
  recentlyCompletedCheckIdAtom,
  appConfigAtom
} from '../../data/atoms';
import { featureFlagsAtom } from '../../data/featureFlags';
import { useCountdown } from '../../data/useCountdown';
import { useWaapiSync } from '../../hooks/useWaapiSync';
import { StatusBadge } from './StatusBadge';
import styles from './CheckCard.module.css';

interface CheckCardProps {
  check: SafetyCheck;
  transition: Transition; // Accept the shared transition object
  isReadOnly?: boolean;
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



export const CheckCard = ({ check, transition, isReadOnly = false }: CheckCardProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const recentlyCompletedCheckId = useAtomValue(recentlyCompletedCheckIdAtom);
  const { showStatusIndicators } = useAtomValue(appConfigAtom);
  const { feat_card_pulse, feat_card_gradient, feat_card_border, feat_hazard_texture, feat_invert_card } = useAtomValue(featureFlagsAtom);

  const isPulsing = recentlyCompletedCheckId === check.id;
  const isLate = check.status === 'missed';

  // Ref for WAAPI sync on the animated card element
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Sync animations when card has animated effects
  const hasAnimatedEffects = isLate && (feat_card_pulse !== 'none' || feat_card_gradient || feat_card_border || feat_hazard_texture);
  useWaapiSync(cardRef, { isEnabled: hasAnimatedEffects });

  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);
  const relativeTime = useCountdown(dueDate, check.status);
  const isActionable = !['complete', 'supplemental', 'completing', 'queued'].includes(check.status) && !isReadOnly;

  const handleCardClick = () => {
    if (isActionable && !isReadOnly) {
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


  // Determine pulse class based on feat_card_pulse
  // 'basic' = subtle opacity breathing (1.2s)
  // 'gradient' = magma flowing gradient effect (4.8s)
  const pulseClass = isLate && feat_card_pulse === 'basic' ? styles.cardPulseBasic
    : isLate && feat_card_pulse === 'gradient' ? styles.cardGradient  // Use original magma gradient
      : '';

  // Legacy: feat_card_gradient still works if feat_card_pulse is 'none'
  const legacyGradient = isLate && feat_card_pulse === 'none' && feat_card_gradient ? styles.cardGradient : '';

  const cardEffectClasses = [
    styles.checkCard,
    isPulsing ? styles.isCompleting : '',
    pulseClass,
    legacyGradient,
    isLate && feat_card_border ? styles.cardBorder : '',
    isLate && feat_hazard_texture ? styles.cardHazard : '',
    isLate && feat_invert_card ? styles.cardInvert : ''
  ].filter(Boolean).join(' ');

  // Read Only Override for Cursor
  const finalStyle = isReadOnly ? { cursor: 'default' } : undefined;

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
        ref={cardRef}
        transition={transition}
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{
          x: '100%',
          opacity: 0,
          transition: {
            // Corrected: duration: 0.2s, no delay
            x: { duration: 0.2, ease: [0.25, 1, 0.5, 1] },
            opacity: { duration: 0.2, ease: 'easeOut' }
          }
        }}
        className={cardEffectClasses}
        style={finalStyle}
        data-status={check.status}
        data-check-id={check.id}
        data-indicators-visible={showStatusIndicators}
        onClick={handleCardClick}
        aria-disabled={!isActionable || !!isReadOnly}
        whileTap={(isActionable && !isReadOnly) ? { scale: 0.98 } : {}}
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
