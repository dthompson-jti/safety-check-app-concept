// src/components/PillToggle.tsx
import { useAtom } from 'jotai';
// FIX: Removed unused 'AnimatePresence' import.
import { motion } from 'framer-motion';
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
            
            <motion.span 
              layout="position" 
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
              className={styles.pillLabel}
            >
              {option.label}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
};