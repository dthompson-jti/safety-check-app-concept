import { useEffect, useCallback, lazy, Suspense } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence } from 'framer-motion';
import * as ToastPrimitive from '@radix-ui/react-toast';
import {
  sessionAtom,
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
import { HeartbeatManager } from './data/HeartbeatManager';
import { ReloadPrompt } from './components/ReloadPrompt';
import { SplashView } from './components/SplashView';
import { AppShellSkeleton } from './components/AppShellSkeleton';
import { FacilitySelectionSkeleton } from './components/FacilitySelectionSkeleton';
import { DelayedFallback } from './components/DelayedFallback';
import { facilityData } from './data/mock/facilityData';

import { NetworkBarrier } from './features/Shell/NetworkBarrier';


function App() {
  const session = useAtomValue(sessionAtom);
  const toasts = useAtomValue(toastsAtom);




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




  return (
    <ToastPrimitive.Provider swipeDirection="right" swipeThreshold={80}>
      <LayoutOrchestrator />
      <HeartbeatManager />
      <SoundManager />
      <PulseEffectsManager />
      <VignetteOverlay />
      <JumpFAB />
      {/* Persistent background wrapper prevents black flash during transitions */}
      <div
        data-platform="mobile"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--surface-bg-secondary, var(--splash-bg))',
          zIndex: 0
        }}>
        <AnimatePresence mode="wait">
          <NetworkBarrier>
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
          </NetworkBarrier>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastMessage key={toast.id} {...toast} />
        ))}
      </AnimatePresence>

      <ToastContainer platform="mobile" />
      <ReloadPrompt />
    </ToastPrimitive.Provider>
  );
}

export default App;