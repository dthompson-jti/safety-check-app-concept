// src/components/PillToggle.tsx
import { useAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { ScheduleView, scheduleViewAtom } from '../data/atoms';
import styles from './PillToggle.module.css';

const options: { id: ScheduleView; label: string }[] = [
  { id: 'time', label: 'Time' },
  { id: 'route', label: 'Route' },
];

export const PillToggle = () => {
  const [activeView, setActiveView] = useAtom(scheduleViewAtom);

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
            
            <AnimatePresence>
              {isActive && (
                <motion.span
                  className={`material-symbols-rounded ${styles.dropdownIcon}`}
                  // Animate the width from 0 to its natural size and back.
                  // This drives a gradual layout change in the parent flexbox,
                  // which is the key to preventing the "janky" text jump.
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
                >
                  south
                </motion.span>
              )}
            </AnimatePresence>

            {/* 
              The `layout="position"` prop animates the text's position. It smoothly
              reacts to the gradual layout change caused by the icon's width
              animation, ensuring the text slides gracefully on both enter and exit.
            */}
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