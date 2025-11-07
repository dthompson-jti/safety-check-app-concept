// src/components/FullScreenModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import styles from './FullScreenModal.module.css';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const FullScreenModal: React.FC<FullScreenModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.modalWrapper}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          // FIX: Apply the specified high-craft transition curve
          transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.backdrop} />
          <div className={styles.modalContainer}>
            <header className={styles.header}>
              <Button variant="quaternary" size="m" iconOnly onClick={onClose} aria-label="Back">
                <span className="material-symbols-rounded">arrow_back</span>
              </Button>
              <h2>{title}</h2>
              {/* Empty div to balance flexbox and keep title centered */}
              <div style={{ width: '38px' }} />
            </header>
            <main className={styles.content}>{children}</main>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};