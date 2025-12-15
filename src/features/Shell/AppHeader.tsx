// src/features/Shell/AppHeader.tsx
import { useRef, useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { appViewAtom } from '../../data/atoms';
import { headerHeightAtom } from '../../data/layoutAtoms';
import { lateCheckCountAtom } from '../../data/appDataAtoms';
import { useLayoutRegistration } from '../../data/useLayoutRegistration';
import { useWaapiSync } from '../../hooks/useWaapiSync';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { StatusBar } from './StatusBar';
import { UserAvatar } from '../../components/UserAvatar';
import styles from './AppHeader.module.css';

export const AppHeader = () => {
  const [appView, setAppView] = useAtom(appViewAtom);
  const lateCount = useAtomValue(lateCheckCountAtom);

  // Use centralized layout registration instead of manual measurement
  // This prevents conflicts with LayoutOrchestrator
  const layoutRef = useLayoutRegistration(headerHeightAtom);

  // Separate ref for WAAPI sync (animating element)
  const animRef = useRef<HTMLElement | null>(null);

  // Combine refs: layout needs the header, WAAPI sync needs the header
  const combinedRef = useCallback((node: HTMLElement | null) => {
    layoutRef.current = node;
    animRef.current = node;
  }, [layoutRef]);

  // Sync pulse animations when late checks exist
  useWaapiSync(animRef, { isEnabled: lateCount > 0 });

  const handleMenuClick = () => {
    setAppView(appView === 'sideMenu' ? 'dashboardTime' : 'sideMenu');
  };

  return (
    <header className={styles.header} ref={combinedRef}>
      <div className={styles.headerContent}>
        <div className={styles.leftActions}>
          <Tooltip content="Open navigation">
            <Button variant="tertiary" size="lg" iconOnly onClick={handleMenuClick} aria-label="Open navigation menu">
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