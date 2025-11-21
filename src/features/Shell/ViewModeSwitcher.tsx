// src/features/Shell/ViewModeSwitcher.tsx
import { useAtom } from 'jotai';
import { motion, useTransform } from 'framer-motion';
import { AppView, appViewAtom } from '../../data/atoms';
import { useGestureContext } from '../../data/GestureContext';
import styles from './ViewModeSwitcher.module.css';

const options: { id: AppView; label: string }[] = [
  { id: 'dashboardTime', label: 'Time' },
  { id: 'dashboardRoute', label: 'Route' },
];

export const ViewModeSwitcher = () => {
  const [activeView, setActiveView] = useAtom(appViewAtom);
  const { filmStripProgress } = useGestureContext();

  const x = useTransform(filmStripProgress, [0, 1], ['0%', '100%']);

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.activeIndicator}
        style={{
          x,
          // Layout Calculation:
          // The pill width matches the flex-basis of the buttons (50% of container).
          // We subtract 4px to account for the container's padding (4px), ensuring the
          // pill sits perfectly flush with the text labels.
          width: 'calc(50% - 4px)',
          height: 'calc(100% - 8px)', // 100% height minus top(4) and bottom(4) padding
          top: '4px',
          left: '4px',
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
            style={{ flex: 1 }} 
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