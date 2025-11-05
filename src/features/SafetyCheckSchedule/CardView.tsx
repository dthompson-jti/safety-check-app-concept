// src/features/SafetyCheckSchedule/CardView.tsx
import { useAtomValue } from 'jotai';
import { VirtuosoGrid } from 'react-virtuoso';
import { sortedChecksAtom } from '../../data/appDataAtoms';
import { CheckCard } from './CheckCard';
import styles from './layouts.module.css';

export const CardView = () => {
  const checks = useAtomValue(sortedChecksAtom);

  return (
    <VirtuosoGrid
      data={checks}
      components={{
        List: (props) => <div {...props} className={styles.cardGrid} />,
      }}
      itemContent={(_index, check) => <CheckCard check={check} />}
      className={styles.cardContainer}
    />
  );
};