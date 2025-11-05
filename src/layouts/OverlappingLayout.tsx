// src/layouts/OverlappingLayout.tsx
import { useSetAtom } from 'jotai';
import { isSelectRoomModalOpenAtom } from '../data/atoms';
import { NavBar } from '../features/NavBar/NavBar';
import { Button } from '../components/Button';
import { Tooltip } from '../components/Tooltip';
import { ScheduleHeader } from '../features/SafetyCheckSchedule/ScheduleHeader';
import styles from './OverlappingLayout.module.css';

interface OverlappingLayoutProps {
  children: React.ReactNode;
}

export const OverlappingLayout = ({ children }: OverlappingLayoutProps) => {
  const setIsSelectRoomModalOpen = useSetAtom(isSelectRoomModalOpenAtom);

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
      <div className={styles.navContainer}>
        <NavBar />
      </div>
    </div>
  );
};