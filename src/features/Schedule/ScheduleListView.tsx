// src/features/Schedule/ScheduleListView.tsx
import { useAtomValue } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { timeSortedChecksAtom, routeSortedChecksAtom } from '../../data/appDataAtoms';
import { appConfigAtom, completingChecksAtom } from '../../data/atoms';
import { SafetyCheck } from '../../types';
import { CheckCard } from './CheckCard';
import { CheckListItem } from './CheckListItem';
import styles from './ScheduleLayouts.module.css';

interface ScheduleListViewProps {
  viewType: 'time' | 'route';
}

type HeaderItem = { type: 'header'; id: string; title: string };
type CheckRenderItem = { type: 'check'; id: string; check: SafetyCheck };
type RenderItem = HeaderItem | CheckRenderItem;

// Helper to group checks for Time View
const groupChecksByTime = (checks: SafetyCheck[]) => {
  const groups: Record<string, SafetyCheck[]> = {
    Late: [],
    'Due Soon': [],
    Upcoming: [],
    Completed: [],
  };
  const now = new Date().getTime();
  const threeMinutesFromNow = now + 3 * 60 * 1000;

  checks.forEach(check => {
    // For grouping, determine the check's *temporal* status, ignoring its completion state.
    const dueTime = new Date(check.dueDate).getTime();
    let temporalStatus: 'late' | 'due-soon' | 'pending';

    if (dueTime < now) {
      temporalStatus = 'late';
    } else if (dueTime < threeMinutesFromNow) {
      temporalStatus = 'due-soon';
    } else {
      temporalStatus = 'pending';
    }

    // Now, use the actual status to decide the final group.
    if (check.status === 'complete' || check.status === 'supplemental') {
      groups.Completed.push(check);
    } else if (temporalStatus === 'late') {
      groups.Late.push(check);
    } else if (temporalStatus === 'due-soon') {
      groups['Due Soon'].push(check);
    } else { // temporalStatus is 'pending'
      groups.Upcoming.push(check);
    }
  });

  return Object.entries(groups)
    .map(([title, checks]) => ({ title, checks }))
    .filter(g => g.checks.length > 0);
};

// Helper to group checks for Route View
const groupChecksByRoute = (checks: SafetyCheck[]) => {
    // A 'completing' check is still considered "actionable" for grouping purposes.
    const actionable = checks.filter(c => c.status !== 'complete' && c.status !== 'supplemental');
    const completed = checks.filter(c => c.status === 'complete' || c.status === 'supplemental');
    const groups: { title: string, checks: SafetyCheck[] }[] = [];
    if (actionable.length > 0) {
        groups.push({ title: 'Upcoming', checks: actionable });
    }
    if (completed.length > 0) {
        groups.push({ title: 'Completed', checks: completed });
    }
    return groups;
};

// Main Component
export const ScheduleListView = ({ viewType }: ScheduleListViewProps) => {
  const checks = useAtomValue(viewType === 'time' ? timeSortedChecksAtom : routeSortedChecksAtom);
  const { scheduleViewMode } = useAtomValue(appConfigAtom);
  const completingChecks = useAtomValue(completingChecksAtom);

  const itemsToRender: RenderItem[] = [];
  const groups = viewType === 'time' ? groupChecksByTime(checks) : groupChecksByRoute(checks);

  groups.forEach(group => {
    // Hide the "Completed" group from the main list view.
    if (group.title === 'Completed') return;

    itemsToRender.push({ type: 'header', id: group.title, title: group.title });
    group.checks.forEach(check => {
      itemsToRender.push({ type: 'check', id: check.id, check });
    });
  });
  
  return (
    <div className={styles.scrollContainer}>
      <div style={{ height: '16px' }} />
      <AnimatePresence mode="popLayout">
        {itemsToRender.map(item => {
          if (item.type === 'header') {
            const group = groups.find(g => g.title === item.title);
            if (!group || group.checks.length === 0) {
              return null;
            }
            return (
              <motion.div
                key={item.id}
                className={styles.headerWrapper}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.2 }}
              >
                <h2 className={styles.priorityGroupHeader}>{item.title}</h2>
              </motion.div>
            );
          } else { // item.type is 'check'
            const { check } = item;
            
            // If the check is in the process of exiting, don't render it.
            // AnimatePresence will handle animating it out based on its `exit` prop.
            if (completingChecks.has(check.id)) {
              return null;
            }

            return scheduleViewMode === 'card' 
              ? <CheckCard key={item.id} check={check} />
              : <CheckListItem key={item.id} check={check} />;
          }
        })}
      </AnimatePresence>
      <div style={{ height: '128px' }} />
    </div>
  );
};