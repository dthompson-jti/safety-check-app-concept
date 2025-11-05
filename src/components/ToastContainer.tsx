// src/components/ToastContainer.tsx
import { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import * as Toast from '@radix-ui/react-toast';
import { toastsAtom } from '../data/toastAtoms';
import { footerHeightAtom } from '../data/atoms';
import React from 'react'; // Import React for type casting

export const ToastContainer = () => {
  const [openToasts, setOpenToasts] = useAtom(toastsAtom);
  const footerHeight = useAtomValue(footerHeightAtom);

  useEffect(() => {
    if (openToasts.length > 0) {
      const timer = setTimeout(() => {
        setOpenToasts(currentToasts => currentToasts.slice(1));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [openToasts, setOpenToasts]);

  return (
    <>
      {openToasts.map((toast) => (
        <Toast.Root key={toast.id} className="toast-root">
          <span className="material-symbols-rounded">{toast.icon}</span>
          <Toast.Description>{toast.message}</Toast.Description>
          {/* Add a close button for accessibility and non-touch dismissal */}
          <Toast.Close className="toast-close-button" aria-label="Dismiss">
            <span className="material-symbols-rounded">close</span>
          </Toast.Close>
        </Toast.Root>
      ))}
      <Toast.Viewport
        className="toast-viewport"
        // DEFINITIVE FIX: Cast the style object to React.CSSProperties
        // to resolve the TypeScript error for custom properties.
        style={{
          '--footer-offset': `${footerHeight}px`,
          bottom: `calc(var(--footer-offset, 0px) + 16px)`,
        } as React.CSSProperties}
      />
    </>
  );
};