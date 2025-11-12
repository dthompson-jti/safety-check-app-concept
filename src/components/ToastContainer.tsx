// src/components/ToastContainer.tsx
import * as ToastPrimitive from '@radix-ui/react-toast';

// DEFINITIVE FIX: This component is now a simple, stateless wrapper for the Radix Viewport.
// The list of toasts is rendered and managed in App.tsx.
export const ToastContainer = () => {
  return <ToastPrimitive.Viewport asChild>
    <ol className="toast-viewport" />
  </ToastPrimitive.Viewport>;
};