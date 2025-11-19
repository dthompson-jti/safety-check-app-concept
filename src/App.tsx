// src/App.tsx
import { useEffect, useRef } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { AnimatePresence } from 'framer-motion';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { sessionAtom, fastTickerAtom, slowTickerAtom } from './data/atoms';
import { toastsAtom } from './data/toastAtoms';

// Components
import { AppShell } from './AppShell';
import { LoginView } from './features/Session/LoginView';
import { ToastContainer } from './components/ToastContainer';
import { ToastMessage } from './components/Toast';

function App() {
  const session = useAtomValue(sessionAtom);
  const toasts = useAtomValue(toastsAtom);
  
  // Heartbeat Setters
  // We use useAtom to avoid TypeScript inference issues with useSetAtom in some environments.
  const [, setFastTicker] = useAtom(fastTickerAtom);
  const [, setSlowTicker] = useAtom(slowTickerAtom);
  
  // Refs for the animation loop
  const requestRef = useRef<number | null>(null);
  const lastSlowTickRef = useRef<number>(Date.now());

  // =================================================================
  //                 Global Heartbeat (The Engine)
  // =================================================================
  // This loop drives the entire temporal aspect of the application.
  // It replaces individual RAF loops in components, ensuring 60fps performance.
  
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      
      // 1. Update Fast Ticker (approx. every frame/100ms)
      // We update this every frame to ensure smooth "4.2s" countdowns.
      setFastTicker(now);

      // 2. Update Slow Ticker (approx. every 1000ms)
      // Used for heavy calculations like list sorting and status updates.
      if (now - lastSlowTickRef.current >= 1000) {
        setSlowTicker(now);
        lastSlowTickRef.current = now;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [setFastTicker, setSlowTicker]);

  return (
    <ToastPrimitive.Provider swipeDirection="right" swipeThreshold={80}>
      <AnimatePresence mode="wait">
        {session.isAuthenticated ? <AppShell /> : <LoginView />}
      </AnimatePresence>
      
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