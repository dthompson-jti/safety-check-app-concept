// src/layouts/ClassicLayout.tsx
import { useSetAtom } from 'jotai';
import { workflowStateAtom, isSelectRoomModalOpenAtom } from '../data/atoms';
import { NavBar } from '../features/NavBar/NavBar';
import { Button } from '../components/Button';
import { Tooltip } from '../components/Tooltip';
import { ScheduleHeader } from '../features/SafetyCheckSchedule/ScheduleHeader';
import styles from './ClassicLayout.module.css';

interface ClassicLayoutProps {
  children: React.ReactNode;
}

export const ClassicLayout = ({ children }: ClassicLayoutProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const setIsSelectRoomModalOpen = useSetAtom(isSelectRoomModalOpenAtom);

  const handleScanClick = () => {
    setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
  };

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <h1>Safety Check</h1>
        <div className={styles.headerActions}>
          <Tooltip content="Add Supplemental Check">
            <Button
              variant="secondary"
              size="s"
              iconOnly
              onClick={() => setIsSelectRoomModalOpen(true)}
              aria-label="Add Supplemental Check"
            >
              <span className="material-symbols-rounded">add</span>
            </Button>
          </Tooltip>
          <ScheduleHeader />
        </div>
      </header>
      <main className={styles.mainContent}>{children}</main>
      <Button variant="primary" size="m" className={styles.fab} aria-label="Start Scan" onClick={handleScanClick}>
        <span className="material-symbols-rounded">qr_code_scanner</span>
      </Button>
      <NavBar />
    </div>
  );
};