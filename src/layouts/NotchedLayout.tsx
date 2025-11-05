// src/layouts/NotchedLayout.tsx
import { useSetAtom } from 'jotai';
import { workflowStateAtom, isSelectRoomModalOpenAtom, footerHeightAtom } from '../data/atoms';
import { NavBar } from '../features/NavBar/NavBar';
import { Button } from '../components/Button';
import { Tooltip } from '../components/Tooltip';
import { ScheduleHeader } from '../features/SafetyCheckSchedule/ScheduleHeader';
import styles from './NotchedLayout.module.css';
import { useLayoutEffect, useRef, useState } from 'react';
import { Popover } from '../components/Popover';
import { ActionMenu, ActionMenuItem } from '../components/ActionMenu';

interface NotchedLayoutProps {
  children: React.ReactNode;
}

const useResponsiveClipPath = (containerRef: React.RefObject<HTMLElement | null>) => {
  const [clipPath, setClipPath] = useState('none');

  useLayoutEffect(() => {
    const calculatePath = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        const cr = w * 0.03;
        const n_w = w * 0.12;
        const n_h = w * 0.06;
        const n_r = w * 0.05;
        
        const center = w / 2;
        const p1_x = center - n_w;
        const p2_x = center - n_r;
        const p3_x = center + n_r;
        const p4_x = center + n_w;

        const path = `M0,${cr} C0,${cr/2} ${cr/2},0 ${cr},0 L${p1_x},0 C${p1_x+5},0 ${p2_x},${n_h} ${center},${n_h} C${p3_x},${n_h} ${p4_x-5},0 ${p4_x},0 L${w-cr},0 C${w-(cr/2)},0 ${w},${cr/2} ${w},${cr} V64 H0 Z`;

        setClipPath(`path("${path}")`);
      }
    };
    
    calculatePath();
    
    const resizeObserver = new ResizeObserver(calculatePath);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();

  }, [containerRef]);

  return clipPath;
};


export const NotchedLayout = ({ children }: NotchedLayoutProps) => {
  const setWorkflowState = useSetAtom(workflowStateAtom);
  const setIsSelectRoomModalOpen = useSetAtom(isSelectRoomModalOpenAtom);
  const setFooterHeight = useSetAtom(footerHeightAtom);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const responsiveClipPath = useResponsiveClipPath(navContainerRef);

  useLayoutEffect(() => {
    const measureFooter = () => {
      if (navContainerRef.current) {
        setFooterHeight(navContainerRef.current.offsetHeight);
      }
    };
    measureFooter();
    const resizeObserver = new ResizeObserver(measureFooter);
    if (navContainerRef.current) {
      resizeObserver.observe(navContainerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [setFooterHeight]);

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

      {/* DEFINITIVE FIX: The FAB is now a SIBLING of the footer, not a child. */}
      {/* This allows the z-index to work correctly. */}
      <Button variant="primary" size="m" className={styles.fab} aria-label="Start Scan" onClick={handleScanClick}>
        <span className="material-symbols-rounded">qr_code_scanner</span>
      </Button>
      
      <footer 
        ref={navContainerRef}
        className={styles.navContainer}
        style={{ clipPath: responsiveClipPath }}
      >
        <NavBar />
      </footer>
    </div>
  );
};