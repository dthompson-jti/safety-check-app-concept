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
          // DEFINITIVE FIX: 
          // The container has 4px padding.
          // Available width is 100% (of content box).
          // We want the pill to be half of the available width.
          // The pill must start at 'left: 4px' (top/bottom 4px).
          // Width is calc(50% - 4px) because 50% of the total box includes the padding,
          // so we subtract the 4px padding to get the true half-content width.
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