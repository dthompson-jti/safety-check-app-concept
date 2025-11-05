// src/features/Dashboard/DashboardView.tsx
import { useAtomValue } from 'jotai';
import { scheduleLayoutAtom } from '../../data/atoms';
import { ListView } from '../SafetyCheckSchedule/ListView';
import { CardView } from '../SafetyCheckSchedule/CardView';
import { PriorityView } from '../SafetyCheckSchedule/PriorityView';

export const DashboardView = () => {
  const layout = useAtomValue(scheduleLayoutAtom);

  switch (layout) {
    case 'list':
      return <ListView />;
    case 'card':
      return <CardView />;
    case 'priority':
      return <PriorityView />;
    default:
      return <ListView />;
  }
};