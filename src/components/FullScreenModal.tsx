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
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className={styles.backdrop} />
          <div className={styles.modalContainer}>
            <header className={styles.header}>
              {/* FIX: Replaced 'close' button on right with 'back' button on left */}
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