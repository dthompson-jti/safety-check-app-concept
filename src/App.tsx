// src/App.tsx
import { useAtomValue } from 'jotai';
import { activeViewAtom, AppView } from './data/atoms';

// Features
import { DashboardView } from './features/Dashboard/DashboardView';
import { NavBar } from './features/NavBar/NavBar';

// Generic Components
import { ToastContainer } from './components/ToastContainer';

// Data and Hooks
import { useUrlSync } from './data/useUrlSync';

function App() {
  const activeView = useAtomValue(activeViewAtom);
  
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

  return (
    // Main app container with a mobile-first flex layout
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* The main content area takes up all available space */}
      <main style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {renderMainContent(activeView)}
      </main>

      {/* The navigation bar is fixed to the bottom */}
      <NavBar />
      
      {/* Global toast notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;