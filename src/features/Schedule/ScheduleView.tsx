// src/features/Schedule/ScheduleView.tsx
import { useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence, motion, Transition } from 'framer-motion';
import { safetyChecksAtom, timeSortedChecksAtom, routeSortedChecksAtom } from '../../data/appDataAtoms';
import {
  appConfigAtom,
  isScheduleLoadingAtom,
  scheduleSearchQueryAtom,
  isScheduleRefreshingAtom,
  scheduleFilterAtom,
  selectedFacilityGroupAtom,
  selectedFacilityAtom,
  selectedFacilityUnitAtom,
} from '../../data/atoms';
import { SafetyCheck, ScheduleFilter } from '../../types';
import { CheckCard } from './CheckCard';
import { ScheduleSkeleton } from '../../components/ScheduleSkeleton';
import { EmptyStateMessage } from '../../components/EmptyStateMessage';
import { FilterIndicatorChip } from './FilterIndicatorChip';
import { FilteredEmptyState } from '../../components/FilteredEmptyState';
import { getFacilityContextForLocation } from '../../data/mock/facilityUtils';
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
  missed: 'Missed',
  due: 'Due',
  queued: 'Queued',
};

// Alternatives worth trying: 'checklist', 'fact_check', 'assignment_turned_in', 'task_alt'
const EMPTY_FACILITY_ICON = 'info';

const groupChecksByTime = (checks: SafetyCheck[]) => {
  // Simplified 3-state model: Missed, Due, Upcoming
  const groups: Record<string, SafetyCheck[]> = {
    Missed: [],
    Due: [],
    Upcoming: []
  };

  checks.forEach(check => {
    // Skip terminal states except missed (which we now show)
    if (['complete', 'supplemental', 'queued'].includes(check.status)) {
      return;
    }

    // Animation-spec.md "Ghost Item Contract (Rule B)":
    // 'completing' checks must remain in their ORIGINAL visual position
    // so AnimatePresence can animate them out when they transition to 'complete'.
    // We compute their display group based on timing, not actual status.
    let displayStatus = check.status;

    if (check.status === 'completing') {
      // Compute what the status WOULD have been based on timing windows
      // This ensures the card stays in its original group during animation
      const intervalMs = check.baseInterval * 60 * 1000;
      const dueTime = new Date(check.dueDate).getTime();
      const windowStartTime = dueTime - intervalMs;
      const elapsedMs = Date.now() - windowStartTime;
      const elapsedMinutes = elapsedMs / (60 * 1000);

      if (elapsedMinutes < 13) displayStatus = 'pending';
      else if (elapsedMinutes < 15) displayStatus = 'due';
      else displayStatus = 'missed'; // Keep in Missed group during animation
    }

    switch (displayStatus) {
      case 'missed':
        groups.Missed.push(check);
        break;
      case 'due':
        groups.Due.push(check);
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
  const allChecks = useAtomValue(safetyChecksAtom);
  const appConfig = useAtomValue(appConfigAtom);
  const { isSlowLoadEnabled } = appConfig;
  const [isLoading, setIsLoading] = useAtom(isScheduleLoadingAtom);
  const isRefreshing = useAtomValue(isScheduleRefreshingAtom);
  const searchQuery = useAtomValue(scheduleSearchQueryAtom);
  const [filter, setFilter] = useAtom(scheduleFilterAtom);
  const selectedGroupId = useAtomValue(selectedFacilityGroupAtom);
  const selectedFacilityId = useAtomValue(selectedFacilityAtom);
  const selectedUnitId = useAtomValue(selectedFacilityUnitAtom);
  const setIsRefreshing = useSetAtom(isScheduleRefreshingAtom);

  const hasAnyChecksInSelectedUnit = Boolean(selectedGroupId && selectedFacilityId && selectedUnitId) && allChecks.some((check) => {
    if (check.type === 'supplemental' || !check.residents[0]) return false;
    const context = getFacilityContextForLocation(check.residents[0].location);
    return context?.groupId === selectedGroupId
      && context?.facilityId === selectedFacilityId
      && context?.unitId === selectedUnitId;
  });

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
      let emptyState;

      if (searchQuery) {
        emptyState = <EmptyStateMessage title="No Results Found" message={`Your search for "${searchQuery}" did not return any results.`} />;
      } else if (isFilterActive) {
        emptyState = <FilteredEmptyState filterLabel={filterLabelMap[filter]} onClear={handleClearFilter} />;
      } else if (selectedGroupId && selectedFacilityId && selectedUnitId && !hasAnyChecksInSelectedUnit) {
        emptyState = (
          <EmptyStateMessage
            icon={EMPTY_FACILITY_ICON}
            iconFilled={false}
            titleTone="quaternary"
            title="This unit has no scheduled safety checks."
          />
        );
      } else {
        // Fallback for empty state if no search/filter
        emptyState = <EmptyStateMessage title="All Checks Complete" message="There are no checks due at this time." />;
      }

      return <div className={styles.emptyStateWrapper}>{emptyState}</div>;
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
              // Animation-spec.md Ghost Item Contract: completing checks MUST render
              // so AnimatePresence can animate their exit transition
              return <CheckCard key={check.id} check={check} transition={listTransition} isReadOnly={appConfig.isViewOnlyMode} />;
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
