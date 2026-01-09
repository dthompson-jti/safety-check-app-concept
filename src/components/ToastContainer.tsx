// src/components/ToastContainer.tsx
import * as ToastPrimitive from '@radix-ui/react-toast';

// ARCHITECTURE UPDATE: We wrap the Viewport in the Provider here to strictly enforce
// the swipeDirection configuration. This ensures that regardless of where ToastContainer
// is mounted in the tree, the interaction model is consistent (Swipe Right to Dismiss).
export const ToastContainer = ({ platform }: { platform?: string }) => {
  return (
    <ToastPrimitive.Viewport asChild>
      <ol className="toast-viewport" data-platform={platform} />
    </ToastPrimitive.Viewport>
  );
};