// src/features/Schedule/ScheduleListView.tsx
import { useAtomValue } from 'jotai';
import { Virtuoso } from 'react-virtuoso';
import { timeSortedChecksAtom, routeSortedChecksAtom } from '../../data/appDataAtoms';
import { appConfigAtom } from '../../data/atoms';
import { CheckCard } from './CheckCard';
import { CheckListItem } from './CheckListItem';
import styles from './ScheduleLayouts.module.css';

interface ScheduleListViewProps {
  viewType: 'time' | 'route';
}

const ListHeader = () => <div style={{ height: '16px' }} />;
const ListFooter = () => <div style={{ height: '112px' }} />;

export const ScheduleListView = ({ viewType }: ScheduleListViewProps) => {
  const checks = useAtomValue(viewType === 'time' ? timeSortedChecksAtom : routeSortedChecksAtom);
  const { scheduleViewMode } = useAtomValue(appConfigAtom);

  return (
    <Virtuoso
      className={styles.listContainer}
      data={checks}
      components={{ Header: ListHeader, Footer: ListFooter }}
      itemContent={(_index, check) => {
        const content =
          scheduleViewMode === 'card' ? (
            <CheckCard check={check} />
          ) : (
            <CheckListItem check={check} />
          );

        return (
          <div className={scheduleViewMode === 'card' ? styles.cardWrapper : ''}>
            {content}
          </div>
        );
      }}
    />
  );
};