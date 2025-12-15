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
import { useRef, useEffect } from 'react'; // Added useEffect and useRef
import { sessionAtom } from '../../data/atoms'; // Added sessionAtom

export const AppHeader = () => {
  const [appView, setAppView] = useAtom(appViewAtom);
  const [session] = useAtom(sessionAtom); // Added session atom usage
  const user = session.user; // Added user declaration

  // Use centralized layout registration instead of manual measurement
  // This prevents conflicts with LayoutOrchestrator
  const layoutRef = useLayoutRegistration(headerHeightAtom); // Renamed headerRef to layoutRef to avoid conflict

  const debugHeaderRef = useRef<HTMLDivElement>(null); // Added a separate ref for debugging

  // Combine refs: one for layout registration, one for debugging
  const combinedHeaderRef = (node: HTMLDivElement | null) => {
    // Assign to layoutRef (which is a callback ref from useLayoutRegistration)
    if (typeof layoutRef === 'function') {
      layoutRef(node);
    } else if (layoutRef) {
      (layoutRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
    // Assign to debugHeaderRef
    debugHeaderRef.current = node;
  };

  // Debug: Check what the header actually sees
  useEffect(() => {
    const checkStyle = () => {
      if (debugHeaderRef.current) { // Using debugHeaderRef here
        const computed = window.getComputedStyle(debugHeaderRef.current);
        const beforeComputed = window.getComputedStyle(debugHeaderRef.current, '::before');
        console.log(`[AppHeader] Computed Delay: ${computed.animationDelay} | Before Delay: ${beforeComputed.animationDelay} | Var: ${computed.getPropertyValue('--glass-sync-delay')}`);
      }
    };
    // Check initially and periodically
    checkStyle();
    const interval = setInterval(checkStyle, 2000);
    return () => clearInterval(interval);
  }, []); // Added useEffect for logging

  const handleMenuClick = () => {
    setAppView(appView === 'sideMenu' ? 'dashboardTime' : 'sideMenu');
  };

  return (
    <header className={styles.header} ref={combinedHeaderRef}>
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