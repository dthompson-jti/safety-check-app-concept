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
import { dispatchActionAtom } from './data/appDataAtoms';
import { useCheckLifecycle } from './data/useCheckLifecycle';
import { useFutureIdeas } from './data/featureFlags';
import { useKonamiCode } from './hooks/useKonamiCode';

import { VignetteOverlay } from './features/LateEffects/VignetteOverlay';
import { JumpFAB } from './features/LateEffects/JumpFAB';
import { PulseEffectsManager } from './features/LateEffects/PulseEffectsManager';

// Lazy load heavy components
// LoginView: minimum delay for cinematic boot experience
// AppShell: NO delay - skeleton fallback provides progressive disclosure
const MIN_SPLASH_MS = 500;
const withMinDelay = <T,>(promise: Promise<T>, minMs: number): Promise<T> =>
  Promise.all([promise, new Promise(resolve => setTimeout(resolve, minMs))]).then(([result]) => result);

// AppShell: Add delay to force skeleton display (cinematic transition)
const AppShell = lazy(() => withMinDelay(import('./AppShell').then(module => ({ default: module.AppShell })), MIN_SPLASH_MS));
const LoginView = lazy(() => withMinDelay(import('./features/Session/LoginView').then(module => ({ default: module.LoginView })), MIN_SPLASH_MS));
import { ToastContainer } from './components/ToastContainer';
import { ToastMessage } from './components/Toast';
import { LayoutOrchestrator } from './features/Shell/LayoutOrchestrator';
import { SoundManager } from './features/Shell/SoundManager';
import { ReloadPrompt } from './components/ReloadPrompt';
import { SplashView } from './components/SplashView';
import { AppShellSkeleton } from './components/AppShellSkeleton';
import { FacilitySelectionSkeleton } from './components/FacilitySelectionSkeleton';
import { DelayedFallback } from './components/DelayedFallback';
import { facilityData } from './data/mock/facilityData';


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
      <SoundManager />
      <PulseEffectsManager />
      <VignetteOverlay />
      <JumpFAB />
      {/* Persistent background wrapper prevents black flash during transitions */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--surface-bg-secondary, var(--splash-bg))',
        zIndex: 0
      }}>
        <AnimatePresence mode="wait">
          <Suspense fallback={
            <DelayedFallback delay={200}>
              {/* Context-aware fallback: 
                  - If > 1 facility group, we'll see Facility Selection first -> Show List Skeleton
                  - If 1 facility group, we bump straight to Dashboard -> Show App Shell Skeleton
              */}
              {session.isAuthenticated ? (
                facilityData.length > 1 ? <FacilitySelectionSkeleton /> : <AppShellSkeleton />
              ) : <SplashView />}
            </DelayedFallback>
          }>
            {session.isAuthenticated ? <AppShell /> : <LoginView />}
          </Suspense>
        </AnimatePresence>
      </div>

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