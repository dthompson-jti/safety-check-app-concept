// src/components/FullScreenPlaceholder.tsx
import React from 'react';
import styles from './FullScreenPlaceholder.module.css';

interface FullScreenPlaceholderProps {
  icon: string;
  title: string;
  message: string;
}

export const FullScreenPlaceholder: React.FC<FullScreenPlaceholderProps> = ({ icon, title, message }) => {
  return (
    <div className={styles.fullscreenPlaceholderWrapper}>
      <div className={styles.fullscreenPlaceholderCard}>
        <span className="material-symbols-rounded">{icon}</span>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </div>
  );
};