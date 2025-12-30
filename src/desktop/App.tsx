import { useAtom, useAtomValue } from 'jotai';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { AnimatePresence } from 'framer-motion';
import { toastsAtom } from '../data/toastAtoms';
import { desktopViewAtom, activeDetailRecordAtom, isDetailPanelOpenAtom, selectedHistoryRowsAtom, selectedLiveRowsAtom } from './atoms';
import { DesktopHeader } from './components/DesktopHeader';
import { DesktopToolbar } from './components/DesktopToolbar';
import { LiveMonitorView } from './components/LiveMonitorView';
import { HistoricalReviewView } from './components/HistoricalReviewView';
import { SupervisorNoteModal } from './components/SupervisorNoteModal';
import { DetailPanel } from './components/DetailPanel';
import { ToastContainer } from '../components/ToastContainer';
import { ToastMessage } from '../components/Toast';
import styles from './App.module.css';

/**
 * Desktop Application Root
 * Supervisor dashboard with Live Monitor and Historical Review views.
 */
export default function App() {
    const view = useAtomValue(desktopViewAtom);
    const toasts = useAtomValue(toastsAtom);
    const activeRecord = useAtomValue(activeDetailRecordAtom);
    const [isPanelOpen, setIsPanelOpen] = useAtom(isDetailPanelOpenAtom);

    // Selection counts to handle "Select single record" state in panel
    const selectedLive = useAtomValue(selectedLiveRowsAtom);
    const selectedHistory = useAtomValue(selectedHistoryRowsAtom);
    const totalSelected = selectedLive.size + selectedHistory.size;

    const handleTogglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    return (
        <ToastPrimitive.Provider swipeDirection="right" swipeThreshold={80}>
            <div className={styles.app} data-panel-open={isPanelOpen}>
                <div className={styles.mainWrapper}>
                    <DesktopHeader
                        onTogglePanel={handleTogglePanel}
                        isPanelOpen={isPanelOpen}
                    />
                    <DesktopToolbar />

                    <main className={styles.main}>
                        <div className={styles.contentArea}>
                            <div className={styles.tableSection}>
                                {view === 'live' && <LiveMonitorView />}
                                {view === 'historical' && <HistoricalReviewView />}
                            </div>
                        </div>
                    </main>
                </div>

                <AnimatePresence>
                    {isPanelOpen && (
                        <DetailPanel record={activeRecord} selectedCount={totalSelected} />
                    )}
                </AnimatePresence>

                <SupervisorNoteModal />
            </div>

            {/* Toast System */}
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastMessage key={toast.id} {...toast} />
                ))}
            </AnimatePresence>
            <ToastContainer />
        </ToastPrimitive.Provider>
    );
}
