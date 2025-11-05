// src/features/SafetyCheckSchedule/ScheduleHeader.tsx
import { useAtom } from 'jotai';
import { sortModeAtom, SortMode } from '../../data/atoms';
import { Select, SelectItem } from '../../components/Select';
import styles from './layouts.module.css';

export const ScheduleHeader = () => {
  const [sortMode, setSortMode] = useAtom(sortModeAtom);

  return (
    <div className={styles.scheduleHeader}>
      <label htmlFor="sort-by">Sort by:</label>
      <Select
        value={sortMode}
        onValueChange={(value) => setSortMode(value as SortMode)}
        placeholder="Sort by..."
      >
        <SelectItem value="dueTime">Due Time</SelectItem>
        <SelectItem value="walkingOrder">Walking Order</SelectItem>
      </Select>
    </div>
  );
};