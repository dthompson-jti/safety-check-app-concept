// src/features/Header/FloatingHeader.tsx
import { useSetAtom } from 'jotai';
import { isSelectRoomModalOpenAtom, isSideMenuOpenAtom } from '../../data/atoms';
import { PillToggle } from '../../components/PillToggle';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import styles from './FloatingHeader.module.css';

/**
 * The main, persistent header for the application.
 * It is fixed to the top of the viewport and provides primary navigation,
 * view controls, and top-level actions.
 */
export const FloatingHeader = () => {
  const setIsSideMenuOpen = useSetAtom(isSideMenuOpenAtom);
  const setIsSelectRoomModalOpen = useSetAtom(isSelectRoomModalOpenAtom);

  return (
    <header className={styles.header}>
      {/* The side menu trigger, using the standard tertiary button style */}
      <Tooltip content="Open Navigation">
        <Button 
          variant="tertiary" 
          size="m" 
          iconOnly 
          onClick={() => setIsSideMenuOpen(true)} 
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-rounded">menu</span>
        </Button>
      </Tooltip>
      
      {/* A wrapper for absolute centering of the toggle, ensuring a stable layout. */}
      <div className={styles.centerContent}>
        <PillToggle />
      </div>

      {/* The trigger for adding a new, unscheduled check */}
      <Tooltip content="Add Supplemental Check">
        <Button 
          variant="tertiary" 
          size="m" 
          iconOnly 
          onClick={() => setIsSelectRoomModalOpen(true)} 
          aria-label="Add supplemental check"
        >
          <span className="material-symbols-rounded">add</span>
        </Button>
      </Tooltip>
    </header>
  );
};