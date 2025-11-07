// src/layouts/MainLayout.tsx
import { useAtomValue } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, appViewAtom } from '../data/atoms';
import { FloatingHeader } from '../features/Header/FloatingHeader';
import { FloatingFooter } from '../features/Footer/FloatingFooter';
import { SideMenu } from '../features/NavBar/SideMenu';
import { DashboardView } from '../features/Dashboard/DashboardView';
import { HistoryView } from '../features/History/HistoryView';
import { FullScreenPlaceholder } from '../components/FullScreenPlaceholder';
import styles from './MainLayout.module.css';

const viewMap: Record<AppView, number> = {
  sideMenu: 0,
  dashboardTime: 1,
  dashboardRoute: 2,
  history: 1,
  settings: 1,
  checks: 1,
};

const ContentPanels = () => {
  const view = useAtomValue(appViewAtom);
  const isCarouselView = ['sideMenu', 'dashboardTime', 'dashboardRoute'].includes(view);
  const viewIndex = viewMap[view];

  if (!isCarouselView) {
    // Render non-carousel views directly in the main content area
    return (
      <main className={styles.mainContent}>
        {view === 'history' && <HistoryView />}
        {view === 'checks' && <FullScreenPlaceholder icon="checklist" title="Checks" message="This view has not been implemented." />}
        {view === 'settings' && <FullScreenPlaceholder icon="settings" title="Settings" message="This view has not been implemented." />}
      </main>
    );
  }

  // Render the sliding carousel for dashboard and menu views
  return (
    <motion.div
      className={styles.filmStrip}
      animate={{ x: `-${viewIndex * (100 / 3)}%` }}
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }}
    >
      <div className={styles.panel}>
        <SideMenu />
      </div>
      <div className={styles.panel}>
        <main className={styles.mainContent}>
          <DashboardView key="time" viewType="time" />
        </main>
      </div>
      <div className={styles.panel}>
        <main className={styles.mainContent}>
          <DashboardView key="route" viewType="route" />
        </main>
      </div>
    </motion.div>
  );
};


export const MainLayout = () => {
  const view = useAtomValue(appViewAtom);
  const isChromeVisible = view !== 'sideMenu';

  return (
    <div className={styles.appViewContainer}>
      <AnimatePresence>
        {isChromeVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FloatingHeader />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.contentWrapper}>
        <ContentPanels />
      </div>

      <AnimatePresence>
        {isChromeVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FloatingFooter />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};