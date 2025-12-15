// src/features/Shell/AppHeader.tsx
import { useAtom } from 'jotai';
import { appViewAtom } from '../../data/atoms';
import { headerHeightAtom } from '../../data/layoutAtoms';
import { useLayoutRegistration } from '../../data/useLayoutRegistration';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { StatusBar } from './StatusBar';
import { UserAvatar } from '../../components/UserAvatar';
import styles from './AppHeader.module.css';

export const AppHeader = () => {
  const [appView, setAppView] = useAtom(appViewAtom);

  // Use centralized layout registration instead of manual measurement
  // This prevents conflicts with LayoutOrchestrator
  const headerRef = useLayoutRegistration(headerHeightAtom);

  const handleMenuClick = () => {
    setAppView(appView === 'sideMenu' ? 'dashboardTime' : 'sideMenu');
  };

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={styles.headerContent}>
        <div className={styles.leftActions}>
          <Tooltip content="Open navigation">
            <Button variant="tertiary" size="m" iconOnly onClick={handleMenuClick} aria-label="Open navigation menu">
              <span className="material-symbols-rounded">menu</span>
            </Button>
          </Tooltip>
        </div>

        <div className={styles.centerContent}>
          <StatusBar />
        </div>

        <div className={styles.rightActions}>
          <UserAvatar />
        </div>
      </div>
    </header>
  );
};