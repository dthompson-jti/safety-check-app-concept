// src/features/Shell/ContextSwitcherCard.tsx
import { facilityData } from '../../data/mock/facilityData';
import styles from './ContextSwitcherCard.module.css';

interface ContextSwitcherCardProps {
  groupId: string | null;
  unitId: string | null;
  onClick: () => void;
}

/**
 * A reusable card component that displays the current operational
 * context (Group and Unit) and allows the user to change it.
 * 
 * Design: Flat, bordered card with stacked group/unit labels.
 * Used in Side Menu and NFC Provisioning View.
 */
export const ContextSwitcherCard = ({ 
  groupId, 
  unitId, 
  onClick, 
}: ContextSwitcherCardProps) => {
  const group = facilityData.find(g => g.id === groupId);
  const unit = group?.units.find(u => u.id === unitId);

  const groupDisplayName = group?.name || 'Select Group';
  const unitDisplayName = unit?.name || 'Select Unit';

  return (
    <button 
      className={styles.contextCard} 
      onClick={onClick}
      type="button"
    >
      <div className={styles.stackedContainer}>
        <div className={styles.stackItem}>
          <span className={styles.label}>Group</span>
          <span className={styles.value}>{groupDisplayName}</span>
        </div>
        <div className={styles.stackItem}>
          <span className={styles.label}>Unit</span>
          <span className={styles.value}>{unitDisplayName}</span>
        </div>
      </div>
      
      <div className={styles.actionIcon}>
        <span className="material-symbols-rounded">swap_horiz</span>
      </div>
    </button>
  );
};