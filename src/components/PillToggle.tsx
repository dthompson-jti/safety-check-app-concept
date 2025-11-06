// src/components/PillToggle.tsx
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
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
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => setActiveView(option.id)}
          className={`${styles.pillButton} ${activeView === option.id ? styles.active : ''}`}
        >
          {/* 
            The animated pill is only rendered inside the currently active button.
            The `layoutId` prop tells Framer Motion to treat this as the *same*
            element moving between buttons, creating the smooth slide animation.
          */}
          {activeView === option.id && (
            <motion.div
              layoutId="active-pill"
              className={styles.activePill}
              // A 'tween' transition is used for a direct, snappy animation.
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
            />
          )}
          {/* The label is wrapped to control its stacking order. */}
          <span className={styles.pillLabel}>{option.label}</span>
        </button>
      ))}
    </div>
  );
};