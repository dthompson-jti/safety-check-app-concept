// src/features/Schedule/ScheduleListView.tsx
import { useAtomValue } from 'jotai';
import { AnimatePresence } from 'framer-motion';
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
const ListFooter = () => <div style={{ height: '128px' }} />;

export const ScheduleListView = ({ viewType }: ScheduleListViewProps) => {
  const checks = useAtomValue(viewType === 'time' ? timeSortedChecksAtom : routeSortedChecksAtom);
  const { scheduleViewMode } = useAtomValue(appConfigAtom);

  return (
    <Virtuoso
      data={checks}
      components={{
        Header: ListHeader,
        Footer: ListFooter,
        // Wrap the list in AnimatePresence to handle exit animations
        List: ({ children, ...props }) => (
          <div {...props}>
            <AnimatePresence>{children}</AnimatePresence>
          </div>
        ),
      }}
      // Use the check ID as the key for stable identity
      itemContent={(_index, check) => {
        const content =
          scheduleViewMode === 'card' ? (
            <CheckCard key={check.id} check={check} />
          ) : (
            <CheckListItem key={check.id} check={check} />
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