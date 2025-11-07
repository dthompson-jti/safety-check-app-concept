// src/AppShell.tsx
import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence } from 'framer-motion';
import { workflowStateAtom, currentTimeAtom } from './data/atoms';
import { MainLayout } from './layouts/MainLayout';
import { ScanView } from './features/Scanning/ScanView';
import { CheckFormView } from './features/CheckForm/CheckFormView';
import { WriteNfcTagModal } from './features/Admin/WriteNfcTagModal';
import { SelectRoomModal } from './features/Admin/SelectRoomModal';

/**
 * AppShell is the top-level component that orchestrates the entire UI.
 * It renders the main layout and conditionally displays overlay views
 * like the scanner or check form based on the global workflow state.
 */
export const AppShell = () => {
  const workflowState = useAtomValue(workflowStateAtom);
  const setCurrentTime = useSetAtom(currentTimeAtom);

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
    </>
  );
}