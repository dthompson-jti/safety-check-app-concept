// src/features/SafetyCheckSchedule/ListView.tsx
import { useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import { Virtuoso } from 'react-virtuoso';
import { timeSortedChecksAtom, routeSortedChecksAtom } from '../../data/appDataAtoms';
import { CheckCard } from './CheckCard';
import styles from './layouts.module.css';

interface ListViewProps {
  viewType: 'time' | 'route';
}

/**
 * A spacer component rendered at the top of the virtualized list.
 * Its purpose is to push the first real list item down, preventing it
 * from being obscured by the fixed FloatingHeader.
 */
const ListHeader = () => {
  // The header's height is 60px. Add an extra 16px for comfortable spacing.
  return <div style={{ height: '76px' }} />;
};

/**
 * A spacer component rendered at the bottom of the virtualized list.
 * Its purpose is to provide enough scrollable space so the last item
 * can be scrolled fully above the FloatingFooter.
 */
const ListFooter = () => {
  // Footer container (20+56+20=96) + extra margin (16px) = 112px
  return <div style={{ height: '112px' }} />;
};

export const ListView = ({ viewType }: ListViewProps) => {
  // Consume the appropriate stable, pre-sorted atom based on the viewType prop.
  // This is the key to preventing the vertical re-shuffling animation.
  const checks = useAtomValue(viewType === 'time' ? timeSortedChecksAtom : routeSortedChecksAtom);

  return (
    <Virtuoso
      className={styles.listContainer}
      data={checks}
      components={{ Header: ListHeader, Footer: ListFooter }}
      itemContent={(_index, check) => (
        <motion.div className={styles.cardWrapper}>
          <CheckCard check={check} />
        </motion.div>
      )}
    />
  );
};