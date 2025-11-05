// src/layouts/NotchedLayout.tsx
import { useSetAtom } from 'jotai';
import { workflowStateAtom } from '../data/atoms';
import { NavBar } from '../features/NavBar/NavBar';
import { DevMenu } from '../components/DevMenu';
import { Button } from '../components/Button';
import { ScheduleHeader } from '../features/SafetyCheckSchedule/ScheduleHeader';
import styles from './NotchedLayout.module.css';

interface NotchedLayoutProps {
  children: React.ReactNode;
}

export const NotchedLayout = ({ children }: NotchedLayoutProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);

  const handleScanClick = () => {
    setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
  };

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <h1>Safety Check</h1>
        <ScheduleHeader />
        <DevMenu />
      </header>
      <main className={styles.mainContent}>{children}</main>
      <div className={styles.navContainer}>
        <Button variant="primary" size="m" className={styles.fab} aria-label="Start Scan" onClick={handleScanClick}>
          <span className="material-symbols-rounded">qr_code_scanner</span>
        </Button>
        <NavBar />
      </div>
    </div>
  );
};