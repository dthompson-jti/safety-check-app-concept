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

// Helper to group checks for Time View.
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
    // To prevent items from jumping groups during animation, we first determine the
    // item's *temporal* category based on its due date, independent of its `status`.
    const dueTime = new Date(check.dueDate).getTime();
    let temporalCategory: 'Late' | 'Due Soon' | 'Upcoming';

    if (dueTime < now) {
      temporalCategory = 'Late';
    } else if (dueTime < threeMinutesFromNow) {
      temporalCategory = 'Due Soon';
    } else {
      temporalCategory = 'Upcoming';
    }

    // A check with status 'completing' will be placed in its original temporal group,
    // ensuring it doesn't move before its exit animation.
    if (check.status === 'complete' || check.status === 'supplemental') {
      groups.Completed.push(check);
    } else {
      groups[temporalCategory].push(check);
    }
  });

  return Object.entries(groups)
    .map(([title, checks]) => ({ title, checks }))
    .filter(g => g.checks.length > 0);
};

// Helper to group checks for Route View
const groupChecksByRoute = (checks: SafetyCheck[]) => {
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
    if (group.title === 'Completed') return;

    itemsToRender.push({ type: 'header', id: group.title, title: group.title });
    group.checks.forEach(check => {
      itemsToRender.push({ type: 'check', id: check.id, check });
    });
  });
  
  return (
    <div className={styles.scrollContainer} data-view-mode={scheduleViewMode}>
      <div style={{ height: '16px' }} />
      <AnimatePresence mode="popLayout">
        {itemsToRender.map(item => {
          if (item.type === 'header') {
            const group = groups.find(g => g.title === item.title);
            if (!group || group.checks.length === 0) return null;
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