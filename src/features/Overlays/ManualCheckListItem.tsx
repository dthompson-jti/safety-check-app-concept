// src/features/Overlays/ManualCheckListItem.tsx
import { ActionListItem } from '../../components/ActionListItem';
import styles from './ManualCheckListItem.module.css';

interface ManualCheckListItemProps {
  title: string;
  subtitle: string;
  hasWarning?: boolean;
  onClick: () => void;
}

export const ManualCheckListItem = ({ title, subtitle, hasWarning, onClick }: ManualCheckListItemProps) => {
  return (
    <ActionListItem onClick={onClick} className={styles.manualCheckItem}>
      {hasWarning && (
        <div className={styles.iconContainer}>
          <span className={`material-symbols-rounded ${styles.icon}`}>warning</span>
        </div>
      )}
      <div className={styles.contentContainer}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
    </ActionListItem>
  );
};