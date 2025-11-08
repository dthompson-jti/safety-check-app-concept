// src/features/Schedule/CheckListItem.tsx
// NEW FILE
import { useMemo } from 'react';
import { useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { SafetyCheck } from '../../types';
import { workflowStateAtom } from '../../data/atoms';
import { useCountdown } from '../../data/useCountdown';
import { Tooltip } from '../../components/Tooltip';
import { StatusBadge } from './StatusBadge';
import styles from './CheckListItem.module.css';

interface CheckListItemProps {
  check: SafetyCheck;
}

export const CheckListItem = ({ check }: CheckListItemProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const dueDate = useMemo(() => new Date(check.dueDate), [check.dueDate]);
  const relativeTime = useCountdown(dueDate, check.status);
  const isActionable = check.status !== 'complete' && check.status !== 'supplemental' && check.status !== 'missed';

  const handleItemClick = () => {
    if (isActionable) {
      setWorkflowState({
        view: 'scanning',
        isManualSelectionOpen: false,
        targetCheckId: check.id,
      });
    }
  };

  const { residents, specialClassification, status } = check;
  const locationText = `${residents[0]?.location || 'N/A'} - ${residents.map(r => r.name).join(' / ')}`;
  const showIndicator = status !== 'complete' && status !== 'supplemental' && status !== 'missed';

  return (
    <motion.div
      layout
      className={styles.checkListItem}
      data-status={status}
      onClick={handleItemClick}
      aria-disabled={!isActionable}
      whileTap={isActionable ? { scale: 0.99 } : {}}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {showIndicator && <div className={styles.statusIndicator} data-status={status} />}
      <div className={styles.content}>
        <div className={styles.locationInfo}>
          {specialClassification && (
            <Tooltip content={`${specialClassification.type}: ${specialClassification.details}`}>
              <span className={`material-symbols-rounded ${styles.filledIcon}`}>warning</span>
            </Tooltip>
          )}
          <span className={styles.locationText}>{locationText}</span>
        </div>
        <StatusBadge status={status} />
        <div className={styles.timeDisplay}>{relativeTime}</div>
      </div>
    </motion.div>
  );
};