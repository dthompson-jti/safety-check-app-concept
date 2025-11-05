// src/components/DevMenu.tsx
import { useAtom } from 'jotai';
import { layoutModeAtom, LayoutMode, scheduleLayoutAtom, ScheduleLayout } from '../data/atoms';
import { Popover } from './Popover';
import { Button } from './Button';
import styles from './DevMenu.module.css';

const layoutOptions: { id: LayoutMode; label: string }[] = [
  { id: 'classic', label: 'Classic (FAB Bottom Right)' },
  { id: 'notched', label: 'Notched Bar' },
  { id: 'overlapping', label: 'Overlapping Bar' },
  { id: 'minimalist', label: 'Minimalist Bar' },
];

const scheduleLayoutOptions: { id: ScheduleLayout; label: string }[] = [
  { id: 'list', label: 'List View' },
  { id: 'card', label: 'Card View' },
  { id: 'priority', label: 'Priority View' },
];

export const DevMenu = () => {
  const [layoutMode, setLayoutMode] = useAtom(layoutModeAtom);
  const [scheduleLayout, setScheduleLayout] = useAtom(scheduleLayoutAtom);

  const trigger = (
    <Button variant="secondary" size="s" iconOnly aria-label="Developer Options">
      <span className="material-symbols-rounded">developer_mode</span>
    </Button>
  );

  return (
    <Popover trigger={trigger}>
      <div className={`menu-popover ${styles.devMenuPopover}`}>
        <div className={styles.popoverHeader}>Schedule Layout</div>
        {scheduleLayoutOptions.map((option) => (
          <button
            key={option.id}
            className="menu-item"
            data-state={scheduleLayout === option.id ? 'checked' : 'unchecked'}
            onClick={() => setScheduleLayout(option.id)}
          >
            <div className="checkmark-container">
              {scheduleLayout === option.id && <span className="material-symbols-rounded">check</span>}
            </div>
            <span>{option.label}</span>
          </button>
        ))}
        <div className={styles.popoverHeader} style={{ marginTop: 'var(--spacing-1)' }}>App Shell Layout</div>
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