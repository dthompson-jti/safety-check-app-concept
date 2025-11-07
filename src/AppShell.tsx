// src/AppShell.tsx
import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence } from 'framer-motion';
import { activeViewAtom, workflowStateAtom, currentTimeAtom } from './data/atoms';
import { MainLayout } from './layouts/MainLayout';
import { DashboardView } from './features/Dashboard/DashboardView';
import { HistoryView } from './features/History/HistoryView';
import { ScanView } from './features/Scanning/ScanView';
import { CheckFormView } from './features/CheckForm/CheckFormView';
import { ToastContainer } from './components/ToastContainer';
import { WriteNfcTagModal } from './features/Admin/WriteNfcTagModal';
import { SelectRoomModal } from './features/Admin/SelectRoomModal';
import { FullScreenPlaceholder } from './components/FullScreenPlaceholder';

/**
 * AppShell is the top-level component that orchestrates the entire UI.
 * It renders the main layout and conditionally displays overlay views
 * like the scanner or check form based on the global workflow state.
 */
export const AppShell = () => {
  const activeView = useAtomValue(activeViewAtom);
  const workflowState = useAtomValue(workflowStateAtom);
  const setCurrentTime = useSetAtom(currentTimeAtom);

  // FIX: This effect starts a global timer to update the `currentTimeAtom`
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

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'history':
        return <HistoryView />;
      case 'checks':
        return <FullScreenPlaceholder icon="checklist" title="Checks" message="This view has not been implemented." />;
      case 'settings':
         return <FullScreenPlaceholder icon="settings" title="Settings" message="This view has not been implemented." />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      <MainLayout>
        {renderActiveView()}
      </MainLayout>

      <AnimatePresence>
        {workflowState.view === 'scanning' && <ScanView />}
        {workflowState.view === 'form' && <CheckFormView checkData={workflowState} />}
      </AnimatePresence>

      <ToastContainer />
      <WriteNfcTagModal />
      <SelectRoomModal />
    </>
  );
};