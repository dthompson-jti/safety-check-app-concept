// src/features/Dashboard/DashboardView.tsx
import { useAtomValue } from 'jotai';
import { safetyChecksAtom } from '../../data/appDataAtoms';
import { SafetyCheck } from '../../types';

// Simple placeholder styles
const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: '16px', fontFamily: 'var(--font-family-sans)' },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' },
  listItem: { padding: '12px', backgroundColor: 'var(--surface-bg-primary)', borderRadius: '8px', border: '1px solid var(--surface-border-secondary)' },
  residentName: { fontWeight: 500 },
  checkDetails: { fontSize: '0.9rem', color: 'var(--surface-fg-tertiary)', marginTop: '4px' },
};

const CheckItem = ({ check }: { check: SafetyCheck }) => (
  <li style={styles.listItem}>
    <div style={styles.residentName}>{check.resident.name} - {check.resident.location}</div>
    <div style={styles.checkDetails}>Status: {check.status} | Time: {check.checkTime}</div>
  </li>
);

export const DashboardView = () => {
  const checks = useAtomValue(safetyChecksAtom);

  return (
    <div style={styles.container}>
      <ul style={styles.list}>
        {checks.map(check => <CheckItem key={check.id} check={check} />)}
      </ul>
    </div>
  );
};