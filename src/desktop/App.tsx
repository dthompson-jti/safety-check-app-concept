import { useAtom, useAtomValue } from 'jotai';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { AnimatePresence } from 'framer-motion';
import { toastsAtom } from '../data/toastAtoms';
import { desktopViewAtom, activeDetailRecordAtom, isDetailPanelOpenAtom, selectedHistoryRowsAtom, selectedLiveRowsAtom, panelWidthAtom } from './atoms';
import { isDevToolsModalOpenAtom } from '../data/atoms';
import { FullScreenModal } from '../components/FullScreenModal';
import { DeveloperModal } from '../features/Overlays/DeveloperModal';
import { DesktopHeader } from './components/DesktopHeader';
import { DesktopToolbar } from './components/DesktopToolbar';
import { LiveMonitorView } from './components/LiveMonitorView';
import { HistoricalReviewView } from './components/HistoricalReviewView';
import { SupervisorNoteModal } from './components/SupervisorNoteModal';
import { DetailPanel } from './components/DetailPanel';
import { ToastContainer } from '../components/ToastContainer';
import { ToastMessage } from '../components/Toast';
import styles from './App.module.css';
import './desktop-overrides.css';

/**
 * Desktop Application Root
 * Supervisor dashboard with Live Monitor and Historical Review views.
 */
export default function App() {
    const view = useAtomValue(desktopViewAtom);
    const toasts = useAtomValue(toastsAtom);
    const activeRecord = useAtomValue(activeDetailRecordAtom);
    const [isPanelOpen, setIsPanelOpen] = useAtom(isDetailPanelOpenAtom);
    const [isDevToolsOpen, setIsDevToolsOpen] = useAtom(isDevToolsModalOpenAtom);

    // Selection counts to handle "Select single record" state in panel
    const selectedLive = useAtomValue(selectedLiveRowsAtom);
    const selectedHistory = useAtomValue(selectedHistoryRowsAtom);
    const totalSelected = selectedLive.size + selectedHistory.size;

    // Panel width for grid layout
    const panelWidth = useAtomValue(panelWidthAtom);

    const showPanel = view === 'historical' && isPanelOpen;

    return (
        <ToastPrimitive.Provider swipeDirection="right" swipeThreshold={80}>
            <div
                className={styles.app}
                data-platform="desktop"
                data-panel-open={showPanel}
                style={{ '--panel-width': `${panelWidth}px` } as React.CSSProperties}
            >
                <div className={styles.mainWrapper}>
                    <DesktopHeader
                        onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
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
                    {showPanel && (
                        <DetailPanel record={activeRecord} selectedCount={totalSelected} />
                    )}
                </AnimatePresence>

                <SupervisorNoteModal />

                <FullScreenModal
                    isOpen={isDevToolsOpen}
                    onClose={() => setIsDevToolsOpen(false)}
                    title="Developer Tools"
                    transitionType="slide-horizontal"
                    actionType="back"
                >
                    <DeveloperModal />
                </FullScreenModal>

                {/* Toast System */}
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastMessage key={toast.id} {...toast} />
                    ))}
                </AnimatePresence>
                <ToastContainer platform="desktop" />
            </div>
        </ToastPrimitive.Provider>
    );
}
