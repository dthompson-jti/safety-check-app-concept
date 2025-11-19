// src/components/FullScreenModal.tsx
import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Button } from './Button';
import styles from './FullScreenModal.module.css';

export type ModalTransitionType = 'slide-horizontal' | 'slide-vertical';
export type ExitDirection = 'left' | 'right';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  leftIcon?: string;
  rightAction?: React.ReactNode;
  transitionType?: ModalTransitionType;
  /** 
   * DYNAMIC EXIT: Allows overriding the exit direction.
   * Essential for "Success" (slide left) vs "Back" (slide right) flows.
   */
  exitDirection?: ExitDirection;
}

const variants: Variants = {
  hidden: (type: ModalTransitionType) => ({
    x: type === 'slide-horizontal' ? '100%' : 0,
    y: type === 'slide-vertical' ? '100%' : 0,
  }),
  visible: { 
    x: 0, 
    y: 0 
  },
  exit: ({ type, direction }: { type: ModalTransitionType, direction?: ExitDirection }) => {
    // If an explicit direction is provided, use it (for horizontal flows)
    if (type === 'slide-horizontal' && direction) {
      return { 
        x: direction === 'left' ? '-100%' : '100%',
        transition: { type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }
      };
    }
    
    // Default behavior
    return {
      x: type === 'slide-horizontal' ? '100%' : 0,
      y: type === 'slide-vertical' ? '100%' : 0,
      transition: { type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }
    };
  }
};

export const FullScreenModal: React.FC<FullScreenModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  leftIcon = 'arrow_back',
  rightAction,
  transitionType = 'slide-horizontal',
  exitDirection
}) => {
  return (
    <AnimatePresence custom={{ type: transitionType, direction: exitDirection }}>
      {isOpen && (
        <motion.div
          className={styles.modalWrapper}
          custom={{ type: transitionType, direction: exitDirection }}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.backdrop} />
          <div className={styles.modalContainer}>
            <header className={styles.header}>
              <Button variant="quaternary" size="m" iconOnly onClick={onClose} aria-label="Back">
                <span className="material-symbols-rounded">{leftIcon}</span>
              </Button>
              
              <h2>{title}</h2>
              
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