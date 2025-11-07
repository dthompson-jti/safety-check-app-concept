// src/features/Overlays/HistoryOverlay.tsx
import { useAtom, useAtomValue } from 'jotai';
import { GroupedVirtuoso } from 'react-virtuoso';
import { HistoryFilter, historyFilterAtom } from '../../data/atoms';
import { groupedHistoryAtom } from '../../data/appDataAtoms';
import { IconToggleGroup } from '../../components/IconToggleGroup';
import { FullScreenPlaceholder } from '../../components/FullScreenPlaceholder';
// REORG: Updated import path for local component
import { HistoryCard } from './HistoryCard';
// REORG: Updated import path for CSS module
import styles from './HistoryOverlay.module.css';

const filterOptions: { value: HistoryFilter; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: 'list' },
  { value: 'lateOrMissed', label: 'Late/Missed', icon: 'error' },
  { value: 'supplemental', label: 'Supplemental', icon: 'add_circle' },
];

export const HistoryOverlay = () => {
  const [filter, setFilter] = useAtom(historyFilterAtom);
  const historyData = useAtomValue(groupedHistoryAtom);

  if (historyData.flattenedChecks.length === 0) {
    return (
      <div className={styles.historyViewContainer}>
        <header className={styles.header}>
          <div className={styles.filterControls}>
            <IconToggleGroup
              options={filterOptions}
              value={filter}
              onValueChange={(val) => setFilter(val)}
              id="history-filter"
            />
          </div>
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
        <div className={styles.filterControls}>
          <IconToggleGroup
            options={filterOptions}
            value={filter}
            onValueChange={(val) => setFilter(val)}
            id="history-filter"
          />
        </div>
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