// src/desktop/App.tsx

import { useState } from 'react';
import { useAtomValue } from 'jotai';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { AnimatePresence } from 'framer-motion';
import { toastsAtom } from '../data/toastAtoms';
import { desktopViewAtom } from './atoms';
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
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    return (
        <ToastPrimitive.Provider swipeDirection="right" swipeThreshold={80}>
            <div className={styles.app}>
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

                        {isPanelOpen && (
                            <DetailPanel onClose={() => setIsPanelOpen(false)} />
                        )}
                    </div>
                </main>

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
