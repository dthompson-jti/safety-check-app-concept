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

// 24fps = approx 41.6ms
const CINEMATIC_FRAME_MS = 41;

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
  const lastFastTickRef = useRef<number>(0);

  useCheckLifecycle();

  // Version Log to verify deployment
  useEffect(() => {
    console.log('eProbation Prototype v1.3 - Performance Optimized');
  }, []);

  useEffect(() => {
    const animate = () => {
      const now = Date.now();

      // 1. 24fps Ticker (Cinematic / Animations)
      if (now - lastFastTickRef.current >= CINEMATIC_FRAME_MS) {
        setFastTicker(now);
        lastFastTickRef.current = now;
      }

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