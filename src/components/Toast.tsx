// src/components/Toast.tsx
import * as ToastPrimitive from '@radix-ui/react-toast';
import { useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { removeToastAtom, ToastVariant } from '../data/toastAtoms';

export interface ToastMessageProps {
  id: string;
  message: string;
  icon: string;
  variant?: ToastVariant;
}

/**
 * A self-contained, animated toast instance. It wraps Radix's Root component
 * with Framer Motion to handle animations, adhering to the project's canonical
 * 'spring' animation principle for a consistent, high-craft feel.
 */
export const ToastMessage = ({ id, message, icon, variant = 'neutral' }: ToastMessageProps) => {
  const removeToast = useSetAtom(removeToastAtom);

  return (
    <ToastPrimitive.Root
      asChild
      forceMount // Let AnimatePresence control mounting
      duration={4000}
      onOpenChange={(open) => {
        if (!open) {
          // This handles both timed and swipe dismissals
          removeToast(id);
        }
      }}
    >
      <motion.li
        // FIX: Removed `layout` prop.
        // Framer Motion's layout projection interferes with Radix's CSS transform-based 
        // swipe gestures. Removing it ensures the toast tracks the finger 1:1 during swipe.
        className="toast-root"
        data-variant={variant}
        initial={{ y: -20, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.15, ease: 'easeOut' } }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <span className="material-symbols-rounded toast-icon">{icon}</span>
        <ToastPrimitive.Description>{message}</ToastPrimitive.Description>
        <ToastPrimitive.Close className="toast-close-button" aria-label="Close">
          <span className="material-symbols-rounded">close</span>
        </ToastPrimitive.Close>
      </motion.li>
    </ToastPrimitive.Root>
  );
};