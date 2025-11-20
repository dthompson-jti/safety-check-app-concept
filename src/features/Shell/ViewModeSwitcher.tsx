// src/features/Shell/ViewModeSwitcher.tsx
import { useAtom } from 'jotai';
import { motion, useTransform } from 'framer-motion';
import { AppView, appViewAtom } from '../../data/atoms';
import { useGestureContext } from '../../context/GestureContext';
import styles from './ViewModeSwitcher.module.css';

const options: { id: AppView; label: string }[] = [
  { id: 'dashboardTime', label: 'Time' },
  { id: 'dashboardRoute', label: 'Route' },
];

export const ViewModeSwitcher = () => {
  const [activeView, setActiveView] = useAtom(appViewAtom);
  const { filmStripProgress } = useGestureContext();

  // Assuming 2 items of equal width.
  // 0 -> 0% (Time)
  // 1 -> 100% (Route)
  // We need to move the pill by 100% of its own width.
  const x = useTransform(filmStripProgress, [0, 1], ['0%', '100%']);

  return (
    <div className={styles.container}>
      {/* 
        The active pill is now a sibling to the buttons, absolutely positioned.
        We need to ensure the container has relative positioning (it does).
        We also need to ensure the pill has the correct width (approx 50% minus padding).
        
        However, the current CSS puts the activePill INSIDE the button.
        To support the sliding gesture, we should move it OUTSIDE the buttons
        and position it absolutely within the container.
      */}
      <motion.div
        className={styles.activeIndicator}
        style={{
          x,
          // We need to set the width explicitly or via CSS to match one button.
          // Since buttons have min-width and padding, this is tricky without exact measurements.
          // But let's try setting it to `calc(50% - 2px)` assuming 2px margin/padding.
          width: 'calc(50% - 4px)',
          height: 'calc(100% - 4px)',
          top: '2px',
          left: '2px',
          position: 'absolute'
        }}
      />

      {options.map((option) => {
        const isActive = activeView === option.id;
        return (
          <button
            key={option.id}
            onClick={() => setActiveView(option.id)}
            className={`${styles.optionButton} ${isActive ? styles.active : ''}`}
            style={{ flex: 1 }} // Ensure equal width
          >
            <span className={styles.label}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};