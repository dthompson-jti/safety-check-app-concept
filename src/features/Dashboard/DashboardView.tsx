// src/features/Dashboard/DashboardView.tsx
import { ListView } from '../SafetyCheckSchedule/ListView';

export const DashboardView = () => {
  // The Dashboard now exclusively uses the ListView.
  // The sorting is handled by the new PillToggle in the header,
  // which updates the `scheduleViewAtom`, automatically re-sorting the list.
  return <ListView />;
};