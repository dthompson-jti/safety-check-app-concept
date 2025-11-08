// src/features/Overlays/HistoryOverlay.tsx
import { useAtom, useAtomValue } from 'jotai';
import { GroupedVirtuoso } from 'react-virtuoso';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { HistoryFilter, historyFilterAtom } from '../../data/atoms';
import { groupedHistoryAtom, historyCountsAtom } from '../../data/appDataAtoms';
import { FullScreenPlaceholder } from '../../components/FullScreenPlaceholder';
import { HistoryCard } from './HistoryCard';
import styles from './HistoryOverlay.module.css';

const filterOptions: { value: HistoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'lateOrMissed', label: 'Late/Missed' },
  { value: 'supplemental', label: 'Supplemental' },
];

export const HistoryOverlay = () => {
  const [filter, setFilter] = useAtom(historyFilterAtom);
  const historyData = useAtomValue(groupedHistoryAtom);
  const counts = useAtomValue(historyCountsAtom);

  const handleFilterChange = (value: HistoryFilter) => {
    if (value) { // Radix onValueChange can be empty if all are deselected
      setFilter(value);
    }
  };

  const renderFilterControls = () => (
    <div className={styles.filterControls}>
      <ToggleGroup.Root
        type="single"
        value={filter}
        onValueChange={handleFilterChange}
        className={styles.filterToggleGroup}
        aria-label="Filter history"
      >
        {filterOptions.map((option) => (
          <ToggleGroup.Item
            key={option.value}
            value={option.value}
            className={styles.filterToggleButton}
          >
            {option.label}
            <span className={styles.countBadge}>{counts[option.value]}</span>
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
    </div>
  );

  if (historyData.flattenedChecks.length === 0) {
    return (
      <div className={styles.historyViewContainer}>
        <header className={styles.header}>
          {renderFilterControls()}
        </header>
        <FullScreenPlaceholder
          icon="manage_search"
          title="No History Found"
          message="There are no historical checks that match the current filter."
        />
      </div>
    );
  }

  const { groupCounts, groups, flattenedChecks } = historyData;

  return (
    <div className={styles.historyViewContainer}>
      <header className={styles.header}>
        {renderFilterControls()}
      </header>
      <GroupedVirtuoso
        groupCounts={groupCounts}
        groupContent={(index) => <h3 className={styles.dateHeader}>{groups[index]}</h3>}
        itemContent={(index) => <HistoryCard check={flattenedChecks[index]} />}
        className={styles.list}
      />
    </div>
  );
};