// src/components/Toast.tsx
import * as ToastPrimitive from '@radix-ui/react-toast';
import { useSetAtom } from 'jotai';
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
    <ToastPrimitive.Root 
      className="toast-root" 
      duration={5000}
      onOpenChange={(open) => {
        // When Radix automatically closes the toast (due to timer, swipe, or close button),
        // this event fires. We then remove the toast from our global state.
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
  );
};