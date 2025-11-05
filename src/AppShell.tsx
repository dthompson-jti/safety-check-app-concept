// src/AppShell.tsx
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { activeViewAtom, AppView, layoutModeAtom, sessionAtom } from './data/atoms';

// Features
import { DashboardView } from './features/Dashboard/DashboardView';
import { SettingsView } from './features/Settings/SettingsView';

// Layouts
import { ClassicLayout } from './layouts/ClassicLayout';
import { NotchedLayout } from './layouts/NotchedLayout';
import { OverlappingLayout } from './layouts/OverlappingLayout';
import { MinimalistLayout } from './layouts/MinimalistLayout';

// Data and Hooks
import { useUrlSync } from './data/useUrlSync';

export function AppShell() {
  const activeView = useAtomValue(activeViewAtom);
  const layoutMode = useAtomValue(layoutModeAtom);
  const session = useAtomValue(sessionAtom);

  // Synchronize the `view` URL parameter with our state
  useUrlSync();

  const renderMainContent = (view: AppView) => {
    switch (view) {
      case 'dashboard':
        return <DashboardView userName={session.userName ?? 'User'} />;
      case 'checks':
        return <div>Checks View</div>;
      case 'history':
        return <div>History View</div>;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView userName={session.userName ?? 'User'} />;
    }
  };

  const mainContent = renderMainContent(activeView);

  const renderAppShell = () => {
    switch (layoutMode) {
      case 'classic':
        return <ClassicLayout>{mainContent}</ClassicLayout>;
      case 'notched':
        return <NotchedLayout>{mainContent}</NotchedLayout>;
      case 'overlapping':
        return <OverlappingLayout>{mainContent}</OverlappingLayout>;
      case 'minimalist':
        return <MinimalistLayout>{mainContent}</MinimalistLayout>;
      default:
        return <ClassicLayout>{mainContent}</ClassicLayout>;
    }
  };

  return (
    <motion.div
      key="app-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {renderAppShell()}
    </motion.div>
  );
}