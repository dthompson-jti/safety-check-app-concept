// src/components/PillToggle.tsx
import { useAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { AppView, appViewAtom } from '../data/atoms';
import styles from './PillToggle.module.css';

const options: { id: AppView; label: string; icon: string }[] = [
  { id: 'dashboardTime', label: 'Time', icon: 'schedule' },
  { id: 'dashboardRoute', label: 'Route', icon: 'route' },
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
            
            {/* REMOVED: Leading icon is no longer rendered */}
            
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
                  // FIX: Use a fade+scale animation. This is a highly performant transform
                  // that feels like an appearance effect and prevents layout jank.
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: 'tween', ease: 'easeOut', duration: 0.15 }}
                >
                  arrow_drop_down
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
};