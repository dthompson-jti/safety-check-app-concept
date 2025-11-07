// src/AppShell.tsx
import { useEffect } from 'react';
import { useAtomValue, useSetAtom, useAtom } from 'jotai';
import { AnimatePresence } from 'framer-motion';
import {
  workflowStateAtom,
  currentTimeAtom,
  isHistoryModalOpenAtom,
  isSettingsModalOpenAtom,
  isDevToolsModalOpenAtom,
} from './data/atoms';
import { MainLayout } from './layouts/MainLayout';
// REORG: Updated import paths for workflow components
import { ScanView } from './features/Workflow/ScanView';
import { CheckFormView } from './features/Workflow/CheckFormView';
// REORG: Updated import paths and component names for overlay components
import { WriteNfcTagModal } from './features/Overlays/WriteNfcTagModal';
import { SelectRoomModal } from './features/Overlays/SelectRoomModal';
import { FullScreenModal } from './components/FullScreenModal';
import { HistoryOverlay } from './features/Overlays/HistoryOverlay';
import { SettingsOverlay } from './features/Overlays/SettingsOverlay';
// REORG: Correctly import the renamed component
import { DeveloperOverlay } from './features/Overlays/DeveloperOverlay';

/**
 * AppShell is the top-level component that orchestrates the entire UI.
 * It renders the main layout and conditionally displays overlay views
 * like the scanner or check form based on the global workflow state.
 */
export const AppShell = () => {
  const workflowState = useAtomValue(workflowStateAtom);
  const setCurrentTime = useSetAtom(currentTimeAtom);

  const [isHistoryOpen, setIsHistoryOpen] = useAtom(isHistoryModalOpenAtom);
  const [isSettingsOpen, setIsSettingsOpen] = useAtom(isSettingsModalOpenAtom);
  const [isDevToolsOpen, setIsDevToolsOpen] = useAtom(isDevToolsModalOpenAtom);

  // This effect starts a global timer to update the `currentTimeAtom`
  // every second. This drives all countdown timers in the application.
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup the interval when the component unmounts.
    return () => clearInterval(intervalId);
  }, [setCurrentTime]);

  useEffect(() => {
    if (workflowState.view === 'form' && workflowState.residents && workflowState.residents.length > 0) {
      const location = workflowState.residents[0].location;
      document.title = `Safety Check - ${location}`;
    } else {
      document.title = 'Safety Check App';
    }
  }, [workflowState]);

  return (
    <>
      <MainLayout />

      <AnimatePresence>
        {workflowState.view === 'scanning' && <ScanView />}
        {workflowState.view === 'form' && <CheckFormView checkData={workflowState} />}
      </AnimatePresence>

      <WriteNfcTagModal />
      <SelectRoomModal />

      {/* Render the new full-screen modals at the top level */}
      <FullScreenModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="History">
        <HistoryOverlay />
      </FullScreenModal>
      <FullScreenModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings">
        <SettingsOverlay />
      </FullScreenModal>
      <FullScreenModal isOpen={isDevToolsOpen} onClose={() => setIsDevToolsOpen(false)} title="Developer Tools">
        <DeveloperOverlay />
      </FullScreenModal>
    </>
  );
};