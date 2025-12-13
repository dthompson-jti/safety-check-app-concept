// src/AppShell.tsx
import { useEffect, useRef, useState } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { motion, AnimatePresence, useTransform, animate } from 'framer-motion';
import {
  workflowStateAtom,
  isSettingsModalOpenAtom,
  isDevToolsModalOpenAtom,
  isFutureIdeasModalOpenAtom,
  connectionStatusAtom,
  appViewAtom,
} from './data/atoms';
import { MainLayout } from './layouts/MainLayout';
import { AppSideMenu } from './features/Shell/AppSideMenu';
import { AppHeader } from './features/Shell/AppHeader';
import { AppFooter } from './features/Shell/AppFooter';
import { OfflineBanner } from './features/Shell/OfflineBanner';
import { ScanView } from './features/Workflow/ScanView';
import { CheckEntryView } from './features/Workflow/CheckEntryView';
import { NfcWriteView } from './features/Workflow/NfcWriteView';
import { ManualCheckSelectorSheet } from './features/Overlays/ManualCheckSelectorSheet';
import { FullScreenModal } from './components/FullScreenModal';
import { SettingsModal } from './features/Overlays/SettingsModal';
import { DeveloperModal } from './features/Overlays/DeveloperModal';
import { FutureIdeasModal } from './features/Overlays/FutureIdeasModal';
import { FacilitySelectionModal } from './features/Overlays/FacilitySelectionModal';
import { GestureProvider } from './data/GestureProvider';
import { useGestureContext } from './data/GestureContext';
import { useVisualViewport } from './data/useVisualViewport';
import styles from './AppShell.module.css';

// High-Performance Transition Configuration
// Uses a spring for a "thrown" native feel
const viewTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 40,
  restDelta: 0.001 // High precision stopping
} as const;

const AppShellContent = () => {
  const [appView, setAppView] = useAtom(appViewAtom);
  const workflowState = useAtomValue(workflowStateAtom);
  const connectionStatus = useAtomValue(connectionStatusAtom);

  const [isSettingsOpen, setIsSettingsOpen] = useAtom(isSettingsModalOpenAtom);
  const [isDevToolsOpen, setIsDevToolsOpen] = useAtom(isDevToolsModalOpenAtom);
  const [isFutureIdeasOpen, setIsFutureIdeasOpen] = useAtom(isFutureIdeasModalOpenAtom);

  const [sideMenuWidth, setSideMenuWidth] = useState(0);
  const sideMenuRef = useRef<HTMLDivElement>(null);
  const appChromeRef = useRef<HTMLDivElement>(null);

  // Gesture State
  const { filmStripProgress, sideMenuProgress } = useGestureContext();
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const initialFilmStripProgress = useRef(0);

  useEffect(() => {
    if (sideMenuRef.current) {
      setSideMenuWidth(sideMenuRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    if (isDragging.current) return;

    if (appView === 'sideMenu') {
      animate(sideMenuProgress, 1, viewTransition);
    } else {
      animate(sideMenuProgress, 0, viewTransition);
    }

    // No filmstrip progress needed since we only have one view
  }, [appView, sideMenuProgress]);

  // FIX: Reset side menu progress when entering/exiting workflow views
  // This prevents stale progress values from causing a stuck menu state
  useEffect(() => {
    if (workflowState.view !== 'none') {
      // Entering a workflow overlay - ensure menu is closed
      if (sideMenuProgress.get() > 0) {
        sideMenuProgress.set(0);
      }
      // Also ensure appView is dashboardTime when in overlay
      if (appView === 'sideMenu') {
        setAppView('dashboardTime');
      }
    }
  }, [workflowState.view, sideMenuProgress, appView, setAppView]);

  // Global Viewport Contract: Ensure --visual-viewport-height is always available
  useVisualViewport();

  useEffect(() => {
    if (workflowState.view === 'form' && 'residents' in workflowState && workflowState.residents.length > 0) {
      document.title = `Safety Check - ${workflowState.residents[0].location}`;
    } else {
      document.title = 'Safety Check App';
    }
  }, [workflowState]);

  const closeMenu = () => {
    setAppView('dashboardTime');
  };

  // --- Intent-Based Gesture Logic ---
  // This logic distinguishes between vertical scrolling and horizontal navigation swipes.
  // It ensures native scrolling performance is preserved while enabling full-screen gestures.

  const handlePointerDown = (e: React.PointerEvent) => {
    if (workflowState.view !== 'none') return;

    startX.current = e.clientX;
    startY.current = e.clientY;
    initialFilmStripProgress.current = filmStripProgress.get();
    isDragging.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // FIX: Guard against gesture handling during workflow overlays
    // This prevents stale pointer data from partially opening the side menu
    if (workflowState.view !== 'none') return;

    if (isDragging.current) {
      const deltaX = e.clientX - startX.current;
      const viewportWidth = window.innerWidth;
      const deltaProgress = deltaX / viewportWidth;

      if (appView === 'sideMenu') {
        const newProgress = Math.max(0, Math.min(1, 1 + (deltaX / sideMenuWidth)));
        sideMenuProgress.set(newProgress);
        return;
      }

      if (appView === 'dashboardTime' && deltaX > 0) {
        const newProgress = Math.max(0, Math.min(1, deltaX / sideMenuWidth));
        sideMenuProgress.set(newProgress);
        return;
      }

      if (sideMenuProgress.get() === 0) {
        const newProgress = Math.max(0, Math.min(1, initialFilmStripProgress.current - deltaProgress));
        filmStripProgress.set(newProgress);
      }
      return;
    }

    if (e.buttons > 0 || e.pointerType === 'touch') {
      const deltaX = Math.abs(e.clientX - startX.current);
      const deltaY = Math.abs(e.clientY - startY.current);
      const DRAG_THRESHOLD = 10;

      // Only capture if horizontal movement exceeds threshold AND is dominant (Intent Detection)
      if (deltaX > DRAG_THRESHOLD && deltaX > deltaY) {
        isDragging.current = true;
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;

    // 1. Cleanup Capture
    isDragging.current = false;
    (e.currentTarget as Element).releasePointerCapture(e.pointerId);

    // 2. Capture Physics Data
    const deltaX = e.clientX - startX.current;
    const currentProgress = sideMenuProgress.get();

    // 3. Deterministic Decision Matrix
    // The logic *must* result in 0 or 1. Limit ambiguous states.
    let shouldOpen = false;

    if (appView === 'sideMenu') {
      // Closing Logic:
      // - Dragged closed more than 20% (0.8 progress)
      // - OR swiped hard left (> 50px)
      shouldOpen = !(currentProgress < 0.8 || deltaX < -50);
    } else {
      // Opening Logic:
      // - Dragged open more than 20% (0.2 progress)
      // - OR swiped hard right (> 50px)
      shouldOpen = currentProgress > 0.2 || deltaX > 50;
    }

    // 4. Execution (The "Direct Method")
    const target = shouldOpen ? 1 : 0;

    // Animate physics first (Visual)
    animate(sideMenuProgress, target, viewTransition);

    // Sync state (Logical)
    if (shouldOpen) {
      setAppView('sideMenu');
    } else {
      setAppView('dashboardTime');
    }
  };

  const mainViewX = useTransform(sideMenuProgress, [0, 1], [0, sideMenuWidth]);
  const sideMenuX = useTransform(sideMenuProgress, [0, 1], [-sideMenuWidth, 0]);
  const backdropOpacity = useTransform(sideMenuProgress, [0, 1], [0, 1]);
  const backdropPointerEvents = useTransform(sideMenuProgress, (v: number) => v > 0 ? 'auto' : 'none');

  return (
    <div
      className={styles.appContainer}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ touchAction: 'pan-y' }}
    >
      <motion.div
        ref={sideMenuRef}
        className={styles.sideMenuContainer}
        style={{ x: sideMenuX }}
      >
        <AppSideMenu />
      </motion.div>

      <motion.div
        className={styles.mainViewWrapper}
        style={{ x: mainViewX }}
      >
        <MainLayout />

        <motion.div
          className={styles.backdrop}
          style={{ opacity: backdropOpacity, pointerEvents: backdropPointerEvents }}
          onClick={closeMenu}
        />

        <div ref={appChromeRef} className={styles.chromeContainer}>
          {connectionStatus !== 'online' && <OfflineBanner />}
          {/* 
            Layout Stability:
            The AppHeader is always rendered. Overlays (ScanView, etc.) will cover it via z-index.
            This prevents the layout viewport from changing size and causing content jumps.
          */}
          <AppHeader />
        </div>

        {/* 
            Layout Stability:
            The AppFooter is always rendered to maintain consistent padding for the main content.
        */}
        <AppFooter />
      </motion.div>

      <AnimatePresence>
        {workflowState.view === 'scanning' && <ScanView />}
        {workflowState.view === 'form' && <CheckEntryView checkData={workflowState} />}
        {workflowState.view === 'provisioning' && <NfcWriteView />}
      </AnimatePresence>

      <ManualCheckSelectorSheet />
      <FacilitySelectionModal />

      <FullScreenModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings"
        transitionType="slide-horizontal"
        actionType="back"
      >
        <SettingsModal />
      </FullScreenModal>

      <FullScreenModal
        isOpen={isDevToolsOpen}
        onClose={() => setIsDevToolsOpen(false)}
        title="Developer Tools"
        transitionType="slide-horizontal"
        actionType="back"
      >
        <DeveloperModal />
      </FullScreenModal>

      <FullScreenModal
        isOpen={isFutureIdeasOpen}
        onClose={() => setIsFutureIdeasOpen(false)}
        title="Future Ideas"
        transitionType="slide-horizontal"
        actionType="back"
      >
        <FutureIdeasModal />
      </FullScreenModal>
    </div>
  );
};

export const AppShell = () => {
  return (
    <GestureProvider>
      <AppShellContent />
    </GestureProvider>
  );
};