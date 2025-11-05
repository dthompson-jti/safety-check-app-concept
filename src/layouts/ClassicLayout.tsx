// src/layouts/ClassicLayout.tsx
import { useSetAtom } from 'jotai';
import { workflowStateAtom, isSelectRoomModalOpenAtom } from '../data/atoms';
import { NavBar } from '../features/NavBar/NavBar';
import { Button } from '../components/Button';
import { Tooltip } from '../components/Tooltip';
import { ScheduleHeader } from '../features/SafetyCheckSchedule/ScheduleHeader';
import styles from './ClassicLayout.module.css';
import { Popover } from '../components/Popover';
import { ActionMenu, ActionMenuItem } from '../components/ActionMenu';

interface ClassicLayoutProps {
  children: React.ReactNode;
}

export const ClassicLayout = ({ children }: ClassicLayoutProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const setIsSelectRoomModalOpen = useSetAtom(isSelectRoomModalOpenAtom);

  const handleScanClick = () => {
    setWorkflowState({ view: 'scanning', isManualSelectionOpen: false });
  };
  
  const actionMenuItems: ActionMenuItem[] = [
    {
      id: 'supplemental',
      icon: 'add_comment',
      label: 'Add Supplemental Check',
      onClick: () => setIsSelectRoomModalOpen(true),
    }
  ];

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <h1>Safety Check</h1>
        <div className={styles.headerActions}>
          <ScheduleHeader />
          <Popover
            trigger={
              <Tooltip content="More Actions">
                <Button variant="secondary" size="s" iconOnly aria-label="More actions">
                  <span className="material-symbols-rounded">more_vert</span>
                </Button>
              </Tooltip>
            }
          >
            <ActionMenu items={actionMenuItems} />
          </Popover>
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