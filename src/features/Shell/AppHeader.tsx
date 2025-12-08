// src/features/Shell/AppHeader.tsx
import { useLayoutEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { appViewAtom } from '../../data/atoms';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { StatusBar } from './StatusBar';
import { UserAvatar } from '../../components/UserAvatar';
import styles from './AppHeader.module.css';

export const AppHeader = () => {
  const [appView, setAppView] = useAtom(appViewAtom);
  const headerRef = useRef<HTMLElement>(null);

  // Component Variable Contract:
  // Measures the header's actual height and sets a CSS variable.
  // This allows sticky headers in the list to position themselves perfectly.
  useLayoutEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }
    return () => {
      resizeObserver.disconnect();
      document.documentElement.style.removeProperty('--header-height');
    };
  }, []);

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