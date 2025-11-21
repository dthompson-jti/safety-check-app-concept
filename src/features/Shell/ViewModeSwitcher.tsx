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
  // We move the wrapper by 100% of its own width (which is 50% of container).
  const x = useTransform(filmStripProgress, [0, 1], ['0%', '100%']);

  return (
    <div className={styles.container}>
      {/* 
        The pillWrapper is 50% width and moves from 0% to 100%.
        The activeIndicator inside provides the visual styling with margins.
      */}
      <motion.div
        className={styles.pillWrapper}
        style={{ x }}
      >
        <div className={styles.activeIndicator} />
      </motion.div>

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