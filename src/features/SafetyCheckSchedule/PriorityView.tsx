// src/features/SafetyCheckSchedule/PriorityView.tsx
import { useAtomValue } from 'jotai';
import { GroupedVirtuoso } from 'react-virtuoso';
import { groupedChecksAtom } from '../../data/appDataAtoms';
import { CheckCard } from './CheckCard';
import styles from './layouts.module.css';
import { SafetyCheckStatus } from '../../types';

const groupOrder: SafetyCheckStatus[] = ['late', 'missed', 'pending', 'complete', 'supplemental'];

export const PriorityView = () => {
  const groupedChecks = useAtomValue(groupedChecksAtom);

  const groups = groupOrder.filter(status => groupedChecks[status].length > 0);
  const groupCounts = groups.map(status => groupedChecks[status].length);

  if (groups.length === 0) {
    return <div>No checks to display.</div>;
  }

  return (
    <GroupedVirtuoso
      groupCounts={groupCounts}
      groupContent={index => {
        const status = groups[index];
        // FIX: Add a stable, unique key to the group header element.
        return <h2 key={status} className={styles.priorityGroupHeader}>{status.replace('-', ' ')}</h2>;
      }}
      itemContent={index => {
        let accumulated = 0;
        for (let i = 0; i < groups.length; i++) {
          const status = groups[i];
          const count = groupedChecks[status].length;
          if (index < accumulated + count) {
            const itemIndex = index - accumulated;
            return <CheckCard check={groupedChecks[status][itemIndex]} />;
          }
          accumulated += count;
        }
        return null;
      }}
    />
  );
};