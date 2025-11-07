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

// This component renders a single toast message.
export const ToastMessage = ({ id, message, icon }: ToastMessageProps) => {
  const removeToast = useSetAtom(removeToastAtom);

  return (
    // Wrap with motion.div for layout animations
    <motion.li
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
    >
      <ToastPrimitive.Root 
        className="toast-root" 
        duration={5000}
        onOpenChange={(open) => {
          if (!open) {
            removeToast(id);
          }
        }}
      >
          <span className="material-symbols-rounded">{icon}</span>
          <ToastPrimitive.Description>{message}</ToastPrimitive.Description>
          <ToastPrimitive.Close className="toast-close-button" aria-label="Close">
              <span className="material-symbols-rounded">close</span>
          </ToastPrimitive.Close>
      </ToastPrimitive.Root>
    </motion.li>
  );
};