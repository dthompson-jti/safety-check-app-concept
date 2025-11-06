// src/features/SafetyCheckSchedule/ListView.tsx
import { useAtomValue } from 'jotai';
import { Virtuoso } from 'react-virtuoso';
import { sortedChecksAtom } from '../../data/appDataAtoms';
import { CheckCard } from './CheckCard';
import styles from './layouts.module.css';

/**
 * A spacer component rendered at the top of the virtualized list.
 * Its purpose is to push the first real list item down, preventing it
 * from being obscured by the fixed FloatingHeader.
 */
const ListHeader = () => {
  // The header's height is 60px. Add an extra 16px for comfortable spacing.
  return <div style={{ height: '76px' }} />;
};

export const ListView = () => {
  const checks = useAtomValue(sortedChecksAtom);

  return (
    <Virtuoso
      className={styles.listContainer}
      data={checks}
      // The Header component from Virtuoso ensures this spacer is always
      // rendered at the top of the scrollable content.
      components={{ Header: ListHeader }}
      itemContent={(_index, check) => <CheckCard check={check} />}
    />
  );
};