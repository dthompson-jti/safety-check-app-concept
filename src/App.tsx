// src/App.tsx
import { useAtomValue } from 'jotai';
import { AnimatePresence } from 'framer-motion';
import { sessionAtom } from './data/atoms';

// Components
import { AppShell } from './AppShell';
import { LoginView } from './features/Login/LoginView';
import { ToastContainer } from './components/ToastContainer';

function App() {
  const session = useAtomValue(sessionAtom);

  return (
    <>
      <AnimatePresence mode="wait">
        {session.isAuthenticated ? <AppShell /> : <LoginView />}
      </AnimatePresence>
      {/* Global toast notifications sit outside the layout */}
      <ToastContainer />
    </>
  );
}

export default App;