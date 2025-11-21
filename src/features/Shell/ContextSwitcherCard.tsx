// src/features/Shell/ContextSwitcherCard.tsx
import { facilityData } from '../../data/mock/facilityData';
import styles from './ContextSwitcherCard.module.css';

interface ContextSwitcherCardProps {
  groupId: string | null;
  unitId: string | null;
  onClick: () => void;
  variant?: 'default' | 'compact';
}

/**
 * A reusable card component that displays the current operational
 * context (Group and Unit) and allows the user to change it.
 */
export const ContextSwitcherCard = ({ 
  groupId, 
  unitId, 
  onClick, 
  variant = 'default' 
}: ContextSwitcherCardProps) => {
  const group = facilityData.find(g => g.id === groupId);
  const unit = group?.units.find(u => u.id === unitId);

  const groupDisplayName = group?.name || '—';
  const unitDisplayName = unit?.name || '—';

  return (
    <button 
      className={styles.contextCard} 
      onClick={onClick}
      data-variant={variant}
    >
      <div className={styles.contextInfo}>
        {variant === 'default' && <span className={styles.contextLabel}>Group</span>}
        <span className={styles.contextValue}>{groupDisplayName}</span>
        
        {variant === 'default' && <span className={styles.contextLabel}>Unit</span>}
        <span className={styles.contextValue}>{unitDisplayName}</span>
      </div>
      <span className="material-symbols-rounded">swap_horiz</span>
    </button>
  );
};