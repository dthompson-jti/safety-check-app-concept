// src/features/Settings/DeveloperSettingsView.tsx
import { useAtom } from 'jotai';
import { layoutModeAtom, LayoutMode, scheduleLayoutAtom, ScheduleLayout } from '../../data/atoms';
import { Button } from '../../components/Button';
import { Select, SelectItem } from '../../components/Select';
import styles from './SettingsView.module.css';

interface DeveloperSettingsViewProps {
  onBack: () => void;
}

export const DeveloperSettingsView = ({ onBack }: DeveloperSettingsViewProps) => {
  const [layoutMode, setLayoutMode] = useAtom(layoutModeAtom);
  const [scheduleLayout, setScheduleLayout] = useAtom(scheduleLayoutAtom);

  return (
    <div className={styles.detailViewWrapper}>
      <header className={styles.detailHeader}>
        <Button variant="secondary" size="s" iconOnly onClick={onBack} aria-label="Back">
          <span className="material-symbols-rounded">arrow_back</span>
        </Button>
        <h2>Developer Options</h2>
      </header>

      <div className={styles.formGroup}>
        <label>App Shell Layout</label>
        <Select
          value={layoutMode}
          onValueChange={(val) => setLayoutMode(val as LayoutMode)}
        >
          <SelectItem value="classic">Classic (FAB)</SelectItem>
          <SelectItem value="notched">Notched Bar</SelectItem>
          <SelectItem value="overlapping">Overlapping Bar</SelectItem>
          <SelectItem value="minimalist">Minimalist Bar</SelectItem>
        </Select>
      </div>

      <div className={styles.formGroup}>
        <label>Schedule View Layout</label>
        <Select
          value={scheduleLayout}
          onValueChange={(val) => setScheduleLayout(val as ScheduleLayout)}
        >
          <SelectItem value="list">List View</SelectItem>
          <SelectItem value="card">Card View</SelectItem>
          <SelectItem value="priority">Priority View</SelectItem>
        </Select>
      </div>
    </div>
  );
};