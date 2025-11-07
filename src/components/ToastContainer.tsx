// src/components/ToastContainer.tsx
import { useAtomValue } from 'jotai';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { toastsAtom } from '../data/toastAtoms';
import { ToastMessage } from './Toast';

// This component renders the list of toasts and the viewport they appear in.
export const ToastContainer = () => {
  const toasts = useAtomValue(toastsAtom);

  return (
    <>
      <motion.ol>
        <AnimatePresence>
          {toasts.map(({ id, message, icon }) => (
            <ToastMessage key={id} id={id} message={message} icon={icon} />
          ))}
        </AnimatePresence>
      </motion.ol>
      <ToastPrimitive.Viewport className="toast-viewport" />
    </>
  );
};