// src/App.tsx
import { useAtomValue } from 'jotai';
import { AnimatePresence } from 'framer-motion';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { sessionAtom } from './data/atoms';

// Components
import { AppShell } from './AppShell';
import { LoginView } from './features/Login/LoginView';
import { ToastContainer } from './components/ToastContainer';

function App() {
  const session = useAtomValue(sessionAtom);

  return (
    // DEFINITIVE FIX: The Toast.Provider MUST wrap the entire application
    // to provide context for swipe gestures and viewport management.
    <ToastPrimitive.Provider swipeDirection="right" swipeThreshold={80}>
      <AnimatePresence mode="wait">
        {session.isAuthenticated ? <AppShell /> : <LoginView />}
      </AnimatePresence>
      
      {/* The ToastContainer renders the toasts and viewport */}
      <ToastContainer />
    </ToastPrimitive.Provider>
  );
}

export default App;