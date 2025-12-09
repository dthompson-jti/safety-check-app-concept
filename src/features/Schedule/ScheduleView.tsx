// src/features/Schedule/ScheduleView.tsx
import { useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence, motion, Transition } from 'framer-motion';
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
import { ScheduleSkeleton } from '../../components/ScheduleSkeleton';
import { EmptyStateMessage } from '../../components/EmptyStateMessage';
import { FilterIndicatorChip } from './FilterIndicatorChip';
import { FilteredEmptyState } from '../../components/FilteredEmptyState';
import styles from './ScheduleView.module.css';

const listTransition: Transition = {
  type: 'tween',
  duration: 0.25,
  ease: [0.25, 1, 0.5, 1],
};

interface ScheduleViewProps {
  viewType: 'time' | 'route';
}

const SKELETON_COUNT = 8;

const filterLabelMap: Record<Exclude<ScheduleFilter, 'all'>, string> = {
  late: 'Late',
  'due-soon': 'Due Soon',
  queued: 'Queued',
};

const groupChecksByTime = (checks: SafetyCheck[]) => {
  // PRD-02: Group by status - Late, Due, Due Soon, Upcoming (early/pending)
  const groups: Record<string, SafetyCheck[]> = {
    Late: [],
    Due: [],
    'Due Soon': [],
    Upcoming: []
  };

  checks.forEach(check => {
    if (['complete', 'supplemental', 'missed', 'queued'].includes(check.status)) {
      return;
    }

    // Animation-spec.md "Ghost Item Contract (Rule B)":
    // 'completing' checks must remain in their ORIGINAL visual position
    // so AnimatePresence can animate them out when they transition to 'complete'.
    // We compute their display group based on timing, not actual status.
    let displayStatus = check.status;

    if (check.status === 'completing') {
      // Compute what the status WOULD have been based on timing windows
      // (matches logic in appDataAtoms.ts lines 271-298)
      const intervalMs = check.baseInterval * 60 * 1000;
      const dueTime = new Date(check.dueDate).getTime();
      const windowStartTime = dueTime - intervalMs;
      const elapsedMs = Date.now() - windowStartTime;
      const elapsedMinutes = elapsedMs / (60 * 1000);

      if (elapsedMinutes < 7) displayStatus = 'early';
      else if (elapsedMinutes < 11) displayStatus = 'pending';
      else if (elapsedMinutes < 13) displayStatus = 'due-soon';
      else if (elapsedMinutes < 15) displayStatus = 'due';
      else displayStatus = 'late';
    }

    switch (displayStatus) {
      case 'late':
        groups.Late.push(check);
        break;
      case 'due':
        groups.Due.push(check);
        break;
      case 'due-soon':
        groups['Due Soon'].push(check);
        break;
      case 'early':
      case 'pending':
      default:
        groups.Upcoming.push(check);
        break;
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
    groups.push({ title: 'Walking Order', checks: actionable });
  }
  return groups;
};

export const ScheduleView = ({ viewType }: ScheduleViewProps) => {
  const checks = useAtomValue(viewType === 'time' ? timeSortedChecksAtom : routeSortedChecksAtom);
  const { isSlowLoadEnabled } = useAtomValue(appConfigAtom);
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
          {/* Skeleton Header to match layout */}
          <div className={styles.headerWrapper}>
            <div className={styles.priorityGroupHeader} style={{ width: '100px', height: '1.5rem', backgroundColor: 'transparent', marginBottom: 'var(--spacing-2)' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--surface-bg-tertiary)', borderRadius: 'var(--radius-sm)', opacity: 0.3 }} />
            </div>
          </div>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <ScheduleSkeleton key={index} />
          ))}
        </>
      );
    }

    if (checks.length === 0) {
      if (searchQuery) return <EmptyStateMessage title="No Results Found" message={`Your search for "${searchQuery}" did not return any results.`} />;
      if (isFilterActive) return <FilteredEmptyState filterLabel={filterLabelMap[filter]} onClear={handleClearFilter} />;
      // Fallback for empty state if no search/filter
      return <EmptyStateMessage title="All Checks Complete" message="There are no checks due at this time." />;
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
              transition={listTransition}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className={styles.priorityGroupHeader}>{group.title}</h2>
            </motion.div>,
            ...group.checks.map(check => {
              if (completingChecks.has(check.id)) return null;
              return <CheckCard key={check.id} check={check} transition={listTransition} />;
            })
          ])}
        </AnimatePresence>
        <div style={{ height: 'calc(var(--footer-height, 96px) + var(--spacing-4))' }} />
      </>
    );
  };

  return (
    <div
      className={styles.scrollContainer}
      data-refreshing={isRefreshing}
    >
      <div style={{ height: 'var(--header-height)' }} />
      <AnimatePresence mode="wait">
        {isFilterActive && <FilterIndicatorChip key={filter} filterLabel={filterLabelMap[filter]} onClear={handleClearFilter} />}
      </AnimatePresence>
      {renderContent()}
    </div>
  );
};