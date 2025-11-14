// src/features/Shell/ScheduleSearchBar.tsx
import { useAtom } from 'jotai';
import { scheduleSearchQueryAtom } from '../../data/atoms';
import { SearchInput } from '../../components/SearchInput';
import styles from './ScheduleSearchBar.module.css';

export const ScheduleSearchBar = () => {
  const [query, setQuery] = useAtom(scheduleSearchQueryAtom);

  return (
    <div className={styles.searchBarContainer}>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search rooms or residents..."
        variant="integrated"
        autoFocus
      />
    </div>
  );
};