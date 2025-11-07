// src/components/PillToggle.tsx
import { useAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { AppView, appViewAtom } from '../data/atoms';
import styles from './PillToggle.module.css';

const options: { id: AppView; label: string }[] = [
  { id: 'dashboardTime', label: 'Time' },
  { id: 'dashboardRoute', label: 'Route' },
];

export const PillToggle = () => {
  const [activeView, setActiveView] = useAtom(appViewAtom);

  return (
    <div className={styles.pillToggleContainer}>
      {options.map((option) => {
        const isActive = activeView === option.id;
        return (
          <button
            key={option.id}
            onClick={() => setActiveView(option.id)}
            className={`${styles.pillButton} ${isActive ? styles.active : ''}`}
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className={styles.activePill}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
              />
            )}
            
            {/* FIX: Moved label before the icon */}
            <motion.span 
              layout="position" 
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
              className={styles.pillLabel}
            >
              {option.label}
            </motion.span>

            <AnimatePresence>
              {isActive && (
                <motion.span
                  className={`material-symbols-rounded ${styles.dropdownIcon}`}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
                >
                  arrow_downward_alt
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
};