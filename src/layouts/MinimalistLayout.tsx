// src/layouts/MinimalistLayout.tsx
import { useSetAtom } from 'jotai';
import { workflowStateAtom, isSideMenuOpenAtom } from '../data/atoms';
import { Button } from '../components/Button';
import { Tooltip } from '../components/Tooltip';
import { ScheduleHeader } from '../features/SafetyCheckSchedule/ScheduleHeader';
import styles from './MinimalistLayout.module.css';
import { SideMenu } from '../features/NavBar/SideMenu';

interface MinimalistLayoutProps {
  children: React.ReactNode;
}

export const MinimalistLayout = ({ children }: MinimalistLayoutProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const setIsSideMenuOpen = useSetAtom(isSideMenuOpenAtom);

  const handleScanClick = () => {
    setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
  };

  return (
    <>
      <SideMenu />
      <div className={styles.appShell}>
        <header className={styles.header}>
          <Tooltip content="Open Navigation">
            <Button
              variant="secondary"
              size="s"
              iconOnly
              aria-label="Open navigation menu"
              onClick={() => setIsSideMenuOpen(true)}
            >
              <span className="material-symbols-rounded">menu</span>
            </Button>
          </Tooltip>
          <h1>Safety Check</h1>
          <div className={styles.headerActions}>
            <ScheduleHeader />
          </div>
        </header>
        <main className={styles.mainContent}>{children}</main>
        <Button
          variant="primary"
          size="m"
          className={styles.fab}
          aria-label="Start Scan"
          onClick={handleScanClick}
        >
          <span className="material-symbols-rounded">qr_code_scanner</span>
        </Button>
      </div>
    </>
  );
};