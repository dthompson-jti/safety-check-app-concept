// src/App.tsx
import { useAtomValue } from 'jotai';
import { activeViewAtom, AppView, layoutModeAtom } from './data/atoms';

// Features
import { DashboardView } from './features/Dashboard/DashboardView';

// Layouts
import { ClassicLayout } from './layouts/ClassicLayout';
import { NotchedLayout } from './layouts/NotchedLayout';
import { OverlappingLayout } from './layouts/OverlappingLayout';
import { MinimalistLayout } from './layouts/MinimalistLayout';

// Generic Components
import { ToastContainer } from './components/ToastContainer';

// Data and Hooks
import { useUrlSync } from './data/useUrlSync';

function App() {
  const activeView = useAtomValue(activeViewAtom);
  const layoutMode = useAtomValue(layoutModeAtom);

  // Synchronize the `view` URL parameter with our state
  useUrlSync();

  const renderMainContent = (view: AppView) => {
    switch (view) {
      case 'dashboard':
        return <DashboardView />;
      case 'checks':
        // Placeholder for the "Checks" view
        return <div>Checks View</div>;
      case 'history':
        // Placeholder for the "History" view
        return <div>History View</div>;
      case 'settings':
        // Placeholder for the "Settings" view
        return <div>Settings View</div>;
      default:
        return <DashboardView />;
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
    <>
      {renderAppShell()}
      {/* Global toast notifications sit outside the layout */}
      <ToastContainer />
    </>
  );
}

export default App;