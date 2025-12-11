import { useEffect, useRef, useCallback } from 'react';
import { useAtomValue, useAtom, useSetAtom } from 'jotai';
import { AnimatePresence } from 'framer-motion';
import * as ToastPrimitive from '@radix-ui/react-toast';
import {
  sessionAtom,
  fastTickerAtom,
  slowTickerAtom,
  throttledTickerAtom
} from './data/atoms';
import { toastsAtom, addToastAtom } from './data/toastAtoms';
import { dispatchActionAtom } from './data/appDataAtoms';
import { useCheckLifecycle } from './data/useCheckLifecycle';
import { useDevMode } from './data/devMode';
import { useKonamiCode } from './hooks/useKonamiCode';

// Components
import { AppShell } from './AppShell';
import { LoginView } from './features/Session/LoginView';
import { ToastContainer } from './components/ToastContainer';
import { ToastMessage } from './components/Toast';
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

  // Dev mode toggle via Konami code with toast feedback
  const { toggle: toggleDevMode, isUnlocked: devModeUnlocked } = useDevMode();
  const addToast = useSetAtom(addToastAtom);

  const toggleDevModeWithToast = useCallback(() => {
    const willBeUnlocked = !devModeUnlocked;
    toggleDevMode();

    // Show themed toast
    addToast({
      message: willBeUnlocked ? 'Dave Mode unlocked 🎮' : 'Dave Mode locked',
      icon: willBeUnlocked ? 'code' : 'lock',
      variant: 'neutral',
    });
  }, [toggleDevMode, devModeUnlocked, addToast]);

  useKonamiCode(toggleDevModeWithToast);

  // Ctrl+Shift+0: Reset app data shortcut ("0 = fresh start")
  const dispatch = useSetAtom(dispatchActionAtom);

  const handleResetShortcut = useCallback(() => {
    dispatch({ type: 'RESET_DATA' });
    addToast({ message: 'Data reset (Ctrl+Shift+Backspace)', icon: 'restart_alt', variant: 'neutral' });
  }, [dispatch, addToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // DEBUG: Log all ctrl/shift combos
      if (e.ctrlKey || e.shiftKey) {
        console.log('Key event:', { key: e.key, code: e.code, ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey });
      }
      // Use e.code ('Digit0') because e.key with Shift becomes ')'
      if (e.ctrlKey && e.shiftKey && e.code === 'Digit0') {
        e.preventDefault();
        handleResetShortcut();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleResetShortcut]);

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