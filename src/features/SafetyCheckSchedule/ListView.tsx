// src/features/SafetyCheckSchedule/ListView.tsx
import { useAtomValue } from 'jotai';
import { Virtuoso } from 'react-virtuoso';
import { sortedChecksAtom } from '../../data/appDataAtoms';
import { CheckCard } from './CheckCard';
import styles from './layouts.module.css';

export const ListView = () => {
  const checks = useAtomValue(sortedChecksAtom);

  return (
    <Virtuoso
      className={styles.listContainer}
      data={checks}
      itemContent={(_index, check) => <CheckCard check={check} />}
    />
  );
};