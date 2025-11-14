// src/features/Shell/ScheduleSearchBar.tsx
import { useAtom, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { scheduleSearchQueryAtom, isScheduleSearchActiveAtom } from '../../data/atoms';
import { SearchInput } from '../../components/SearchInput';
import { Button } from '../../components/Button';
import { Tooltip } from '../../components/Tooltip';
import styles from './ScheduleSearchBar.module.css';

export const ScheduleSearchBar = () => {
  const [query, setQuery] = useAtom(scheduleSearchQueryAtom);
  const setIsSearchActive = useSetAtom(isScheduleSearchActiveAtom);

  const handleClose = () => {
    setIsSearchActive(false);
    // Add a slight delay to clearing the query to prevent a visual flash
    // of the unfiltered list during the exit animation.
    setTimeout(() => setQuery(''), 150);
  };

  return (
    <motion.div
      className={styles.searchBarContainer}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'tween', duration: 0.2 }}
    >
      {/* DEFINITIVE FIX: Left-aligned decorative icon */}
      <div className={styles.decorativeIconContainer}>
        <span className={`material-symbols-rounded ${styles.decorativeIcon}`}>search</span>
      </div>

      <div className={styles.inputWrapper}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="" /* Placeholder is now handled visually by the component itself */
          variant="integrated"
          autoFocus
        />
      </div>

      {/* DEFINITIVE FIX: Right-aligned close button */}
      <div className={styles.actionContainer}>
        <Tooltip content="Close search">
          <Button
            variant="tertiary"
            size="m"
            iconOnly
            onClick={handleClose}
            aria-label="Close search"
          >
            <span className="material-symbols-rounded">close</span>
          </Button>
        </Tooltip>
      </div>
    </motion.div>
  );
};