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

/**
 * A spacer component rendered at the bottom of the virtualized list.
 * Its purpose is to provide enough scrollable space so the last item
 * can be scrolled fully above the FloatingFooter.
 */
const ListFooter = () => {
  // Footer container (20+56+20=96) + extra margin (16px) = 112px
  return <div style={{ height: '112px' }} />;
};

export const ListView = () => {
  const checks = useAtomValue(sortedChecksAtom);

  return (
    <Virtuoso
      className={styles.listContainer}
      data={checks}
      // Virtuoso's Header and Footer components ensure these spacers are
      // always rendered at the top and bottom of the scrollable content.
      components={{ Header: ListHeader, Footer: ListFooter }}
      itemContent={(_index, check) => <CheckCard check={check} />}
    />
  );
};