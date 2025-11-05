// src/features/SafetyCheckSchedule/PriorityView.tsx
import { useAtomValue } from 'jotai';
import { GroupedVirtuoso } from 'react-virtuoso';
import { groupedChecksAtom } from '../../data/appDataAtoms';
import { CheckCard } from './CheckCard';
import styles from './layouts.module.css';
import { SafetyCheckStatus } from '../../types';

const groupOrder: SafetyCheckStatus[] = ['overdue', 'due-soon', 'upcoming', 'complete'];

export const PriorityView = () => {
  const groupedChecks = useAtomValue(groupedChecksAtom);

  const groupCounts = groupOrder.map(status => groupedChecks[status].length);
  const groups = groupOrder.filter(status => groupedChecks[status].length > 0);

  if (groups.length === 0) {
    return <div>No checks to display.</div>;
  }

  return (
    <GroupedVirtuoso
      groupCounts={groupCounts.filter(count => count > 0)}
      groupContent={index => {
        const status = groups[index];
        return <h2 className={styles.priorityGroupHeader}>{status.replace('-', ' ')}</h2>;
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