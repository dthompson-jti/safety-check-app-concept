// src/features/History/HistoryView.tsx
import { useAtom, useAtomValue } from 'jotai';
import { GroupedVirtuoso } from 'react-virtuoso';
import { HistoryFilter, historyFilterAtom } from '../../data/atoms';
import { groupedHistoryAtom } from '../../data/appDataAtoms';
import { IconToggleGroup } from '../../components/IconToggleGroup';
import { FullScreenPlaceholder } from '../../components/FullScreenPlaceholder';
import { HistoryCard } from './HistoryCard';
import styles from './HistoryView.module.css';

const filterOptions: { value: HistoryFilter; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: 'list' },
  { value: 'lateOrMissed', label: 'Late/Missed', icon: 'error' },
  { value: 'supplemental', label: 'Supplemental', icon: 'add_circle' },
];

export const HistoryView = () => {
  const [filter, setFilter] = useAtom(historyFilterAtom);
  // FIX: Get the entire object from the atom first to allow for type guarding.
  const historyData = useAtomValue(groupedHistoryAtom);

  // This check now acts as a type guard. If this condition is false,
  // TypeScript knows that groupCounts, groups, and flattenedChecks exist.
  if (historyData.flattenedChecks.length === 0) {
    return (
      <div className={styles.historyViewContainer}>
        <header className={styles.header}>
          <h2>History</h2>
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

  // FIX: Destructure the properties *after* the type guard.
  const { groupCounts, groups, flattenedChecks } = historyData;

  return (
    <div className={styles.historyViewContainer}>
      <header className={styles.header}>
        <h2>History</h2>
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