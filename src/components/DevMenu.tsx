// src/components/DevMenu.tsx
import { useAtom } from 'jotai';
import { layoutModeAtom, LayoutMode } from '../data/atoms';
import { Popover } from './Popover';
import { Button } from './Button';
import styles from './DevMenu.module.css';

const layoutOptions: { id: LayoutMode; label: string }[] = [
  { id: 'classic', label: 'Classic (FAB Bottom Right)' },
  { id: 'notched', label: 'Notched Bar' },
  { id: 'overlapping', label: 'Overlapping Bar' },
  { id: 'minimalist', label: 'Minimalist Bar' },
];

export const DevMenu = () => {
  const [layoutMode, setLayoutMode] = useAtom(layoutModeAtom);

  const trigger = (
    <Button variant="secondary" size="s" iconOnly aria-label="Developer Options">
      <span className="material-symbols-rounded">developer_mode</span>
    </Button>
  );

  return (
    <Popover trigger={trigger}>
      <div className={`menu-popover ${styles.devMenuPopover}`}>
        <div className={styles.popoverHeader}>Developer Options</div>
        {layoutOptions.map((option) => (
          <button
            key={option.id}
            className="menu-item"
            data-state={layoutMode === option.id ? 'checked' : 'unchecked'}
            onClick={() => setLayoutMode(option.id)}
          >
            <div className="checkmark-container">
              {layoutMode === option.id && <span className="material-symbols-rounded">check</span>}
            </div>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </Popover>
  );
};