// src/layouts/ClassicLayout.tsx
import { NavBar } from '../features/NavBar/NavBar';
import { DevMenu } from '../components/DevMenu';
import { Button } from '../components/Button';
import { ScheduleHeader } from '../features/SafetyCheckSchedule/ScheduleHeader';
import styles from './ClassicLayout.module.css';

interface ClassicLayoutProps {
  children: React.ReactNode;
}

export const ClassicLayout = ({ children }: ClassicLayoutProps) => {
  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <h1>Safety Check</h1>
        <ScheduleHeader />
        <DevMenu />
      </header>
      <main className={styles.mainContent}>{children}</main>
      <Button variant="primary" size="m" className={styles.fab} aria-label="Start Scan">
        <span className="material-symbols-rounded">qr_code_scanner</span>
      </Button>
      <NavBar />
    </div>
  );
};