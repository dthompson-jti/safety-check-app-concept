// src/features/Dashboard/DashboardView.tsx
import { ListView } from '../SafetyCheckSchedule/ListView';

interface DashboardViewProps {
  viewType: 'time' | 'route';
}

export const DashboardView = ({ viewType }: DashboardViewProps) => {
  return <ListView viewType={viewType} />;
};