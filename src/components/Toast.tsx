// src/components/Toast.tsx
import * as ToastPrimitive from '@radix-ui/react-toast';

interface ToastMessageProps {
  message: string;
  icon: string;
}

// This component renders a single toast message.
export const ToastMessage = ({ message, icon }: ToastMessageProps) => {
  return (
    <ToastPrimitive.Root className="toast-root" duration={5000}>
        <span className="material-symbols-rounded">{icon}</span>
        <ToastPrimitive.Description>{message}</ToastPrimitive.Description>
        <ToastPrimitive.Close className="toast-close-button" aria-label="Close">
            <span className="material-symbols-rounded">close</span>
        </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
};