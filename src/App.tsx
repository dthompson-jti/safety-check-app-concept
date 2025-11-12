// src/App.tsx
import { useAtomValue } from 'jotai';
import { AnimatePresence } from 'framer-motion';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { sessionAtom } from './data/atoms';
import { toastsAtom } from './data/toastAtoms';

// Components
import { AppShell } from './AppShell';
import { LoginView } from './features/Session/LoginView';
import { ToastContainer } from './components/ToastContainer';
import { ToastMessage } from './components/Toast';

function App() {
  const session = useAtomValue(sessionAtom);
  const toasts = useAtomValue(toastsAtom);

  return (
    // DEFINITIVE FIX: The Toast.Provider MUST wrap the entire application
    // to provide context for swipe gestures and viewport management.
    <ToastPrimitive.Provider swipeDirection="right" swipeThreshold={80}>
      <AnimatePresence mode="wait">
        {session.isAuthenticated ? <AppShell /> : <LoginView />}
      </AnimatePresence>
      
      {/* 
        DEFINITIVE FIX: The list of toasts is now rendered here, wrapped in AnimatePresence.
        This allows Radix to manage their lifecycle while Framer Motion handles animations.
        The ToastContainer is now just the viewport.
      */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastMessage key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
      
      <ToastContainer />
    </ToastPrimitive.Provider>
  );
}

export default App;