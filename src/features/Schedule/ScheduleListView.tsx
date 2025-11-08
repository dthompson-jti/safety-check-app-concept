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
// Increase footer height to ensure last item can scroll well above the footer
const ListFooter = () => <div style={{ height: '128px' }} />;

export const ScheduleListView = ({ viewType }: ScheduleListViewProps) => {
  const checks = useAtomValue(viewType === 'time' ? timeSortedChecksAtom : routeSortedChecksAtom);
  const { scheduleViewMode } = useAtomValue(appConfigAtom);

  return (
    <Virtuoso
      data={checks}
      components={{ Header: ListHeader, Footer: ListFooter }}
      itemContent={(_index, check) => {
        const content =
          scheduleViewMode === 'card' ? (
            <CheckCard check={check} />
          ) : (
            <CheckListItem check={check} />
          );

        // The wrapper with horizontal margins is now only applied for card view
        return (
          <div className={scheduleViewMode === 'card' ? styles.cardWrapper : ''}>
            {content}
          </div>
        );
      }}
    />
  );
};