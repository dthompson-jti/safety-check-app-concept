// src/features/Schedule/FilterIndicatorChip.tsx
import { motion } from 'framer-motion';
import { Button } from '../../components/Button';
import styles from './FilterIndicatorChip.module.css';

interface FilterIndicatorChipProps {
  filterLabel: string;
  onClear: () => void;
}

export const FilterIndicatorChip = ({ filterLabel, onClear }: FilterIndicatorChipProps) => {
  return (
    <motion.div
      layout
      className={styles.chipContainer}
      initial={{ y: -20, opacity: 0, height: 0 }}
      animate={{ y: 0, opacity: 1, height: 'auto' }}
      exit={{ y: -20, opacity: 0, height: 0 }}
      transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
    >
      <div className={styles.chipContent}>
        <span className={styles.chipText}>
          Showing: <strong>{filterLabel}</strong>
        </span>
        <Button
          variant="quaternary"
          size="xs"
          iconOnly
          onClick={onClear}
          aria-label="Clear filter"
          className={styles.clearButton}
        >
          <span className="material-symbols-rounded">close</span>
        </Button>
      </div>
    </motion.div>
  );
};