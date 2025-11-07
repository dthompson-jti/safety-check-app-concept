// src/features/Header/FloatingHeader.tsx
import { useAtom, useSetAtom } from 'jotai';
import { appViewAtom, isSelectRoomModalOpenAtom } from '../../data/atoms';
import { PillToggle } from '../../components/PillToggle';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { Popover } from '../../components/Popover';
import { ActionMenu, ActionMenuItem } from '../../components/ActionMenu';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import styles from './FloatingHeader.module.css';

/**
 * The main, persistent header for the application.
 * It is fixed to the top of the viewport and provides primary navigation,
 * view controls, and top-level actions.
 */
export const FloatingHeader = () => {
  const [view, setView] = useAtom(appViewAtom);
  const setIsSelectRoomModalOpen = useSetAtom(isSelectRoomModalOpenAtom);

  const isDashboard = view === 'dashboardTime' || view === 'dashboardRoute';

  const supplementalCheckItems: (ActionMenuItem | 'separator')[] = [
    {
      id: 'supplemental-check',
      icon: 'add_comment',
      label: 'Supplemental Check',
      onClick: () => setIsSelectRoomModalOpen(true),
    },
    {
      id: 'placeholder-action',
      icon: 'build_circle',
      label: 'Another Action',
      onClick: () => {},
      disabled: true,
    },
  ];

  const handleMenuClick = () => {
    // If we're on a non-carousel view, go to the dashboard.
    // Otherwise, toggle to the side menu.
    if (!isDashboard && view !== 'sideMenu') {
      setView('dashboardTime');
    } else {
      setView('sideMenu');
    }
  };

  return (
    <header className={styles.header}>
      <Tooltip content="Open Navigation">
        <Button
          variant="tertiary"
          size="m"
          iconOnly
          onClick={handleMenuClick}
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-rounded">menu</span>
        </Button>
      </Tooltip>

      <div className={styles.centerContent}>{isDashboard ? <PillToggle /> : <ConnectionStatusIndicator />}</div>

      <Popover
        trigger={
          <Tooltip content="Add Actions">
            <Button variant="tertiary" size="m" iconOnly aria-label="Add supplemental check">
              <span className="material-symbols-rounded">add</span>
            </Button>
          </Tooltip>
        }
      >
        <div className="menu-popover">
          <ActionMenu items={supplementalCheckItems} />
        </div>
      </Popover>
    </header>
  );
};