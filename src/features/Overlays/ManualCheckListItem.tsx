// src/features/Overlays/ManualCheckListItem.tsx
import { ActionListItem } from '../../components/ActionListItem';
import { Resident, SpecialClassification } from '../../types';
import styles from './ManualCheckListItem.module.css';

interface ManualCheckListItemProps {
  title: string;
  residents: Resident[];
  specialClassifications?: SpecialClassification[];
  onClick: () => void;
}

export const ManualCheckListItem = ({ title, residents, specialClassifications, onClick }: ManualCheckListItemProps) => {
  const residentClassifications = new Map(
    specialClassifications?.map(sc => [sc.residentId, sc])
  );

  return (
    <ActionListItem onClick={onClick}>
      <div className={styles.contentContainer}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>
          {residents.map((resident, index) => (
            <span key={resident.id} className={styles.residentName}>
              {residentClassifications.has(resident.id) && (
                <span className={`material-symbols-rounded ${styles.inlineIcon}`}>
                  warning
                </span>
              )}
              {resident.name}
              {index < residents.length - 1 && ', '}
            </span>
          ))}
        </div>
      </div>
    </ActionListItem>
  );
};