// src/layouts/MinimalistLayout.tsx
import { useSetAtom } from 'jotai';
import { workflowStateAtom } from '../data/atoms';
import { Button } from '../components/Button';
import { ScheduleHeader } from '../features/SafetyCheckSchedule/ScheduleHeader';
import styles from './MinimalistLayout.module.css';

interface MinimalistLayoutProps {
  children: React.ReactNode;
}

export const MinimalistLayout = ({ children }: MinimalistLayoutProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);

  const handleScanClick = () => {
    setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
  };

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <Button variant="secondary" size="s" iconOnly aria-label="Open navigation menu">
          <span className="material-symbols-rounded">menu</span>
        </Button>
        <h1>Safety Check</h1>
        <ScheduleHeader />
      </header>
      <main className={styles.mainContent}>{children}</main>
      <Button variant="primary" size="m" className={styles.fab} aria-label="Start Scan" onClick={handleScanClick}>
        <span className="material-symbols-rounded">qr_code_scanner</span>
      </Button>
    </div>
  );
};