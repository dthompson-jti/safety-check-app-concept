// src/App.tsx
import { useEffect, useRef } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { AnimatePresence } from 'framer-motion';
import * as ToastPrimitive from '@radix-ui/react-toast';
import {
  sessionAtom,
  fastTickerAtom,
  slowTickerAtom,
  throttledTickerAtom
} from './data/atoms';
import { toastsAtom } from './data/toastAtoms';
import { useCheckLifecycle } from './data/useCheckLifecycle';

// Components
import { AppShell } from './AppShell';
import { LoginView } from './features/Session/LoginView';
import { ToastContainer } from './components/ToastContainer';
import { ToastMessage } from './components/Toast';
import { SoundManager } from './features/Shell/SoundManager';
import { LayoutOrchestrator } from './features/Shell/LayoutOrchestrator';

function App() {
  const session = useAtomValue(sessionAtom);
  const toasts = useAtomValue(toastsAtom);

  // Heartbeat Setters
  const [, setFastTicker] = useAtom(fastTickerAtom);
  const [, setThrottledTicker] = useAtom(throttledTickerAtom);
  const [, setSlowTicker] = useAtom(slowTickerAtom);

  const requestRef = useRef<number | null>(null);
  const lastSlowTickRef = useRef<number>(Date.now());
  const lastThrottledTickRef = useRef<number>(Date.now());

  useCheckLifecycle();

  useEffect(() => {
    const animate = () => {
      const now = Date.now();

      // 1. 60fps Ticker (Animations only)
      setFastTicker(now);

      // 2. 10fps Ticker (Text Timers - Fixes React Thrashing)
      if (now - lastThrottledTickRef.current >= 100) {
        setThrottledTicker(now);
        lastThrottledTickRef.current = now;
      }

      // 3. 1fps Ticker (Business Logic)
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
  }, [setFastTicker, setSlowTicker, setThrottledTicker]);

  return (
    <ToastPrimitive.Provider swipeDirection="right" swipeThreshold={80}>
      <SoundManager />
      <LayoutOrchestrator />
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