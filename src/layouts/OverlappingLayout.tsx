// src/layouts/OverlappingLayout.tsx
import { useSetAtom } from 'jotai';
import { isSelectRoomModalOpenAtom, footerHeightAtom } from '../data/atoms';
import { NavBar } from '../features/NavBar/NavBar';
import { Button } from '../components/Button';
import { Tooltip } from '../components/Tooltip';
import { ScheduleHeader } from '../features/SafetyCheckSchedule/ScheduleHeader';
import styles from './OverlappingLayout.module.css';
import { Popover } from '../components/Popover';
import { ActionMenu, ActionMenuItem } from '../components/ActionMenu';
import { useLayoutEffect, useRef } from 'react';

interface OverlappingLayoutProps {
  children: React.ReactNode;
}

export const OverlappingLayout = ({ children }: OverlappingLayoutProps) => {
  const setIsSelectRoomModalOpen = useSetAtom(isSelectRoomModalOpenAtom);
  const setFooterHeight = useSetAtom(footerHeightAtom);
  const footerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const measureFooter = () => {
      if (footerRef.current) {
        // The effective height is the nav bar height plus its top and bottom margin
        setFooterHeight(footerRef.current.offsetHeight + 32);
      }
    };
    measureFooter();
    const resizeObserver = new ResizeObserver(measureFooter);
    if (footerRef.current) {
      resizeObserver.observe(footerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [setFooterHeight]);


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
      <footer ref={footerRef} className={styles.navContainer}>
        <NavBar />
      </footer>
    </div>
  );
};