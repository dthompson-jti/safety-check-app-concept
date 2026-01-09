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
  /**
   * Navigation Mode:
   * - 'back': Render a specific icon (default: arrow_back) on the LEFT.
   * - 'close': Render a standard close ('x') icon on the RIGHT.
   */
  actionType?: 'back' | 'close';
  leftIcon?: string; // Kept for custom 'back' icons
  rightAction?: React.ReactNode;
  transitionType?: ModalTransitionType;
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
    if (type === 'slide-horizontal' && direction) {
      return {
        x: direction === 'left' ? '-100%' : '100%',
        transition: { type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }
      };
    }
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
  actionType = 'back', // Default to Flow Pattern
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
              {/* LEFT ACTION: Render only if actionType is 'back' */}
              {actionType === 'back' ? (
                <Button variant="tertiary" size="lg" iconOnly onClick={onClose} aria-label="Back">
                  <span className="material-symbols-rounded">{leftIcon}</span>
                </Button>
              ) : (
                // Spacer to keep title aligned if we want consistent padding, 
                // but strictly left-aligned title usually doesn't need spacer on left if it's flush.
                // However, "Back" takes up 40px space. "Title" starts after that. 
                // If "Close" is on right, should Title start flush left?
                // Design Strategy: No spacer needed for flush left title.
                null
              )}

              <h2 style={{ marginLeft: actionType === 'back' ? '0' : 'var(--spacing-2)' }}>{title}</h2>

              <div className={styles.rightActionContainer}>
                {/* RIGHT ACTION: Custom action OR 'close' mode button */}
                {rightAction ? (
                  rightAction
                ) : actionType === 'close' ? (
                  <Button variant="tertiary" size="lg" iconOnly onClick={onClose} aria-label="Close">
                    <span className="material-symbols-rounded">close</span>
                  </Button>
                ) : (
                  // Flow mode (Back button on left) - keep right empty or spacer?
                  // CSS flexes title to fill, so rightActionContainer just sits there.
                  // Min-width 40px in CSS might keep it balanced if we wanted center title, but we want Left.
                  null
                )}
              </div>
            </header>
            <main className={styles.content}>{children}</main>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};