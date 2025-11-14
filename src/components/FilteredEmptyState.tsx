// src/components/FilteredEmptyState.tsx
import { Button } from './Button';
import styles from './FilteredEmptyState.module.css';

interface FilteredEmptyStateProps {
  filterLabel: string;
  onClear: () => void;
}

export const FilteredEmptyState = ({ filterLabel, onClear }: FilteredEmptyStateProps) => {
  return (
    <div className={styles.emptyStateContainer}>
      <div className={styles.iconWrapper}>
        <span className="material-symbols-rounded">filter_list_off</span>
      </div>
      <h3 className={styles.title}>No "{filterLabel}" checks</h3>
      <p className={styles.message}>There are no checks that match the current filter. Try clearing the filter to see all upcoming checks.</p>
      <Button variant="secondary" size="m" onClick={onClear}>
        Clear Filter
      </Button>
    </div>
  );
};