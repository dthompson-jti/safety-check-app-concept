// src/layouts/MinimalistLayout.tsx
import { DevMenu } from '../components/DevMenu';
import { Button } from '../components/Button';
import styles from './MinimalistLayout.module.css';

interface MinimalistLayoutProps {
  children: React.ReactNode;
}

export const MinimalistLayout = ({ children }: MinimalistLayoutProps) => {
  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <Button variant="secondary" size="s" iconOnly aria-label="Open navigation menu">
          <span className="material-symbols-rounded">menu</span>
        </Button>
        <h1>Safety Check</h1>
        <DevMenu />
      </header>
      <main className={styles.mainContent}>{children}</main>
      <Button variant="primary" size="m" className={styles.fab} aria-label="Start Scan">
        <span className="material-symbols-rounded">qr_code_scanner</span>
      </Button>
    </div>
  );
};