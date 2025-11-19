// src/components/FullScreenModal.tsx
import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Button } from './Button';
import styles from './FullScreenModal.module.css';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Optional override for the left navigation icon. Defaults to 'arrow_back'. */
  leftIcon?: string;
  /** Optional component to render on the right side of the header. */
  rightAction?: React.ReactNode;
  /** Controls which way the modal slides out when closing. Defaults to 'right' (Back). */
  exitDirection?: 'left' | 'right';
}

// Animation variants for the modal wrapper
const modalVariants: Variants = {
  enter: { x: '100%' },
  visible: { x: 0 },
  exit: (exitDirection: 'left' | 'right') => ({
    x: exitDirection === 'left' ? '-100%' : '100%',
    transition: { 
      type: 'tween', 
      duration: 0.35, 
      ease: [0.16, 1, 0.3, 1] 
    } as const
  })
};

/**
 * A full-screen overlay component acting as a navigation shell.
 * Supports custom header actions and Framer Motion entrance/exit animations.
 */
export const FullScreenModal: React.FC<FullScreenModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  leftIcon = 'arrow_back',
  rightAction,
  exitDirection = 'right'
}) => {
  return (
    <AnimatePresence custom={exitDirection}>
      {isOpen && (
        <motion.div
          className={styles.modalWrapper}
          custom={exitDirection}
          variants={modalVariants}
          initial="enter"
          animate="visible"
          exit="exit"
          // Use the same transition curve for entrance
          transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.backdrop} />
          <div className={styles.modalContainer}>
            <header className={styles.header}>
              <Button variant="quaternary" size="m" iconOnly onClick={onClose} aria-label="Back or Close">
                <span className="material-symbols-rounded">{leftIcon}</span>
              </Button>
              
              <h2>{title}</h2>
              
              {/* Render Right Action if present, otherwise a spacer to balance the header layout */}
              <div className={styles.rightActionContainer}>
                {rightAction || <div style={{ width: '38px' }} />}
              </div>
            </header>
            <main className={styles.content}>{children}</main>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};