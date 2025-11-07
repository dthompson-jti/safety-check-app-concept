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
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className={styles.backdrop} />
          <div className={styles.modalContainer}>
            <header className={styles.header}>
              <h2>{title}</h2>
              <Button variant="quaternary" size="m" iconOnly onClick={onClose} aria-label="Close">
                <span className="material-symbols-rounded">close</span>
              </Button>
            </header>
            <main className={styles.content}>{children}</main>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};