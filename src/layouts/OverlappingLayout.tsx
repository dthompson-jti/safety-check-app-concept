// src/layouts/OverlappingLayout.tsx
import { NavBar } from '../features/NavBar/NavBar';
import { DevMenu } from '../components/DevMenu';
import { ScheduleHeader } from '../features/SafetyCheckSchedule/ScheduleHeader';
import styles from './OverlappingLayout.module.css';

interface OverlappingLayoutProps {
  children: React.ReactNode;
}

export const OverlappingLayout = ({ children }: OverlappingLayoutProps) => {
  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <h1>Safety Check</h1>
        <ScheduleHeader />
        <DevMenu />
      </header>
      <main className={styles.mainContent}>{children}</main>
      <div className={styles.navContainer}>
        <NavBar />
      </div>
    </div>
  );
};