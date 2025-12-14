import { useEffect, useRef, useCallback, lazy, Suspense } from 'react';
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
import { dispatchActionAtom, lateCheckCountAtom } from './data/appDataAtoms';
import { featureFlagsAtom } from './data/featureFlags';
import { useCheckLifecycle } from './data/useCheckLifecycle';
import { useFutureIdeas } from './data/featureFlags';
import { useKonamiCode } from './hooks/useKonamiCode';

import { VignetteOverlay } from './features/LateEffects/VignetteOverlay';
import { JumpFAB } from './features/LateEffects/JumpFAB';
import { GlassTintOverlay } from './features/LateEffects/GlassTintOverlay';

// Lazy load heavy components to reduce initial bundle size
const AppShell = lazy(() => import('./AppShell').then(module => ({ default: module.AppShell })));
const LoginView = lazy(() => import('./features/Session/LoginView').then(module => ({ default: module.LoginView })));
import { ToastContainer } from './components/ToastContainer';
import { ToastMessage } from './components/Toast';
import { LayoutOrchestrator } from './features/Shell/LayoutOrchestrator';
import { SoundManager } from './features/Shell/SoundManager';
import { ReloadPrompt } from './components/ReloadPrompt';
import { SplashView } from './components/SplashView';


// 24fps = approx 41.6ms
const CINEMATIC_FRAME_MS = 41;

function App() {
  const session = useAtomValue(sessionAtom);
  const toasts = useAtomValue(toastsAtom);
  const lateCount = useAtomValue(lateCheckCountAtom);
  const { feat_bio_sync } = useAtomValue(featureFlagsAtom);

  // Heartbeat Setters
  const [, setFastTicker] = useAtom(fastTickerAtom);
  const [, setThrottledTicker] = useAtom(throttledTickerAtom);
  const [, setSlowTicker] = useAtom(slowTickerAtom);

  const requestRef = useRef<number | null>(null);
  const lastSlowTickRef = useRef<number>(Date.now());
  const lastThrottledTickRef = useRef<number>(Date.now());
  const lastFastTickRef = useRef<number>(0);

  useCheckLifecycle();

  // Future Ideas toggle via Konami code with toast feedback
  const { toggle: toggleFutureIdeas, isUnlocked: futureIdeasUnlocked } = useFutureIdeas();
  const addToast = useSetAtom(addToastAtom);

  const toggleFutureIdeasWithToast = useCallback(() => {
    const willBeUnlocked = !futureIdeasUnlocked;
    toggleFutureIdeas();

    // Show themed toast
    addToast({
      message: willBeUnlocked ? 'Future Ideas Unlocked' : 'Future Ideas Hidden',
      icon: willBeUnlocked ? 'lightbulb' : 'lightbulb_outline',
      variant: 'neutral',
    });
  }, [toggleFutureIdeas, futureIdeasUnlocked, addToast]);

  useKonamiCode(toggleFutureIdeasWithToast);

  // Ctrl+Backspace: Reset app data shortcut
  const dispatch = useSetAtom(dispatchActionAtom);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Backspace
      if (e.ctrlKey && e.key === 'Backspace' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        dispatch({ type: 'RESET_DATA' });
        addToast({ message: 'Data reset (Ctrl+Backspace)', icon: 'restart_alt', variant: 'neutral' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, addToast]);

  // Set data-late-state attribute on body for Bio-Sync
  useEffect(() => {
    if (lateCount > 0 && feat_bio_sync) {
      document.body.setAttribute('data-late-state', 'active');
    } else {
      document.body.removeAttribute('data-late-state');
    }

    return () => {
      document.body.removeAttribute('data-late-state');
    };
  }, [lateCount, feat_bio_sync]);

  // Version Log to verify deployment
  useEffect(() => {
    console.log('eProbation Prototype v1.3 - Performance Optimized');
  }, []);

  useEffect(() => {
    const PULSE_DURATION_MS = 1200; // Badge pulse is 1.2s

    const animate = () => {
      const now = Date.now();

      // 1. 24fps Ticker (Cinematic / Animations)
      if (now - lastFastTickRef.current >= CINEMATIC_FRAME_MS) {
        setFastTicker(now);
        lastFastTickRef.current = now;

        // Global animation sync: Calculate offset to align all animations
        // This forces any animation started NOW to sync with the master clock
        const syncOffset = -(now % PULSE_DURATION_MS);
        document.body.style.setProperty('--anim-sync-offset', `${syncOffset}ms`);
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
      <SoundManager />
      <GlassTintOverlay />
      <VignetteOverlay />
      <JumpFAB />
      <AnimatePresence mode="wait">
        <Suspense fallback={<SplashView />}>
          {session.isAuthenticated ? <AppShell /> : <LoginView />}
        </Suspense>
      </AnimatePresence>

      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastMessage key={toast.id} {...toast} />
        ))}
      </AnimatePresence>

      <ToastContainer />
      <ReloadPrompt />
    </ToastPrimitive.Provider>
  );
}

export default App;