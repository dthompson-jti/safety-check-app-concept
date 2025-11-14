// src/features/Schedule/ScheduleListView.tsx
import { useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { timeSortedChecksAtom, routeSortedChecksAtom } from '../../data/appDataAtoms';
import {
  appConfigAtom,
  completingChecksAtom,
  isScheduleLoadingAtom,
  scheduleSearchQueryAtom,
  isScheduleRefreshingAtom,
  scheduleFilterAtom,
} from '../../data/atoms';
import { SafetyCheck, ScheduleFilter } from '../../types';
import { CheckCard } from './CheckCard';
import { CheckListItem } from './CheckListItem';
import { CheckSkeleton } from '../../components/CheckSkeleton';
import { NoSearchResults } from '../../components/EmptyStateMessage';
import { FilterIndicatorChip } from '../../components/FilterIndicatorChip';
import { FilteredEmptyState } from '../../components/FilteredEmptyState';
import styles from './ScheduleLayouts.module.css';

interface ScheduleListViewProps {
  viewType: 'time' | 'route';
}

const SKELETON_COUNT = 8;

const filterLabelMap: Record<Exclude<ScheduleFilter, 'all'>, string> = {
  late: 'Late',
  'due-soon': 'Due Soon',
  queued: 'Queued',
};

const groupChecksByTime = (checks: SafetyCheck[]) => {
  const groups: Record<string, SafetyCheck[]> = { Late: [], 'Due Soon': [], Upcoming: [] };
  const now = new Date().getTime();
  const threeMinutesFromNow = now + 3 * 60 * 1000;

  checks.forEach(check => {
    if (['complete', 'supplemental', 'missed', 'queued'].includes(check.status)) {
      return;
    }
    const dueTime = new Date(check.dueDate).getTime();
    if (dueTime < now) {
      groups.Late.push(check);
    } else if (dueTime < threeMinutesFromNow) {
      groups['Due Soon'].push(check);
    } else {
      groups.Upcoming.push(check);
    }
  });

  return Object.entries(groups)
    .map(([title, checks]) => ({ title, checks }))
    .filter(g => g.checks.length > 0);
};

const groupChecksByRoute = (checks: SafetyCheck[]) => {
    const actionable = checks.filter(c => !['complete', 'supplemental', 'missed', 'queued'].includes(c.status));
    const groups: { title: string, checks: SafetyCheck[] }[] = [];
    if (actionable.length > 0) {
        groups.push({ title: 'Upcoming', checks: actionable });
    }
    return groups;
};

export const ScheduleListView = ({ viewType }: ScheduleListViewProps) => {
  const checks = useAtomValue(viewType === 'time' ? timeSortedChecksAtom : routeSortedChecksAtom);
  const { scheduleViewMode, isSlowLoadEnabled } = useAtomValue(appConfigAtom);
  const completingChecks = useAtomValue(completingChecksAtom);
  const [isLoading, setIsLoading] = useAtom(isScheduleLoadingAtom);
  const isRefreshing = useAtomValue(isScheduleRefreshingAtom);
  const searchQuery = useAtomValue(scheduleSearchQueryAtom);
  const [filter, setFilter] = useAtom(scheduleFilterAtom);
  const setIsRefreshing = useSetAtom(isScheduleRefreshingAtom);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setIsLoading(false), isSlowLoadEnabled ? 3000 : 750);
      return () => clearTimeout(timer);
    }
  }, [isLoading, setIsLoading, isSlowLoadEnabled]);
  
  const handleClearFilter = () => {
    setIsRefreshing(true);
    setFilter('all');
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const showSkeletons = isLoading;
  const isFilterActive = filter !== 'all';

  const renderContent = () => {
    if (showSkeletons) {
      return (
        <>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <CheckSkeleton key={index} variant={scheduleViewMode} />
          ))}
        </>
      );
    }

    if (checks.length === 0) {
      if (searchQuery) return <NoSearchResults query={searchQuery} />;
      if (isFilterActive) return <FilteredEmptyState filterLabel={filterLabelMap[filter]} onClear={handleClearFilter} />;
    }
    
    const groups = viewType === 'time' ? groupChecksByTime(checks) : groupChecksByRoute(checks);

    return (
      <>
        <AnimatePresence>
          {groups.flatMap(group => [
            <motion.div
              key={group.title}
              className={styles.headerWrapper}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className={styles.priorityGroupHeader}>{group.title}</h2>
            </motion.div>,
            ...group.checks.map(check => {
              if (completingChecks.has(check.id)) return null;
              return scheduleViewMode === 'card' 
                ? <CheckCard key={check.id} check={check} />
                : <CheckListItem key={check.id} check={check} />;
            })
          ])}
        </AnimatePresence>
        <div style={{ height: '128px' }} />
      </>
    );
  };
  
  return (
    <div 
      className={styles.scrollContainer} 
      data-view-mode={scheduleViewMode}
      data-refreshing={isRefreshing}
    >
      {/* DEFINITIVE FIX: Add a static spacer div to push content below the floating header. */}
      <div style={{ height: 'var(--header-height)' }} />
      {/* DEFINITIVE FIX: Add a key and set mode="wait" to ensure AnimatePresence
          correctly handles filter changes, preventing the chip from disappearing. */}
      <AnimatePresence mode="wait">
        {isFilterActive && <FilterIndicatorChip key={filter} filterLabel={filterLabelMap[filter]} onClear={handleClearFilter} />}
      </AnimatePresence>
      {renderContent()}
    </div>
  );
};