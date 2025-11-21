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