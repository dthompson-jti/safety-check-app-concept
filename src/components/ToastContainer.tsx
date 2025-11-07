// src/components/ToastContainer.tsx
import { useAtomValue } from 'jotai';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { toastsAtom } from '../data/toastAtoms';
import { ToastMessage } from './Toast';

// This component renders the list of toasts and the viewport they appear in.
export const ToastContainer = () => {
  const toasts = useAtomValue(toastsAtom);

  return (
    <ToastPrimitive.Provider swipeDirection="down">
      {toasts.map(({ id, message, icon }) => (
        <ToastMessage key={id} id={id} message={message} icon={icon} />
      ))}
      <ToastPrimitive.Viewport className="toast-viewport" />
    </ToastPrimitive.Provider>
  );
};