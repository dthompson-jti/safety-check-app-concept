// src/components/Toast.tsx
import * as ToastPrimitive from '@radix-ui/react-toast';
import { useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { removeToastAtom } from '../data/toastAtoms';

interface ToastMessageProps {
  id: string;
  message: string;
  icon: string;
}

// DEFINITIVE FIX: This component is now a self-contained, animated toast instance.
// It correctly wraps Radix's Root component with Framer Motion for animations.
// The animation is now a 'tween' to align with the project's new animation principle.
export const ToastMessage = ({ id, message, icon }: ToastMessageProps) => {
  const removeToast = useSetAtom(removeToastAtom);

  return (
    <ToastPrimitive.Root
      asChild
      forceMount // Let AnimatePresence control mounting
      duration={5000}
      onOpenChange={(open) => {
        if (!open) {
          // This handles both timed and swipe dismissals
          removeToast(id);
        }
      }}
    >
      <motion.li
        layout
        className="toast-root"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ x: '110%', opacity: 0, transition: { duration: 0.25 } }}
        transition={{ type: 'tween', duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="material-symbols-rounded">{icon}</span>
        <ToastPrimitive.Description>{message}</ToastPrimitive.Description>
        <ToastPrimitive.Close className="toast-close-button" aria-label="Close">
          <span className="material-symbols-rounded">close</span>
        </ToastPrimitive.Close>
      </motion.li>
    </ToastPrimitive.Root>
  );
};