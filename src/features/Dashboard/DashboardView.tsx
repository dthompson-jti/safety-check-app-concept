// src/features/Dashboard/DashboardView.tsx
import { useAtomValue } from 'jotai';
import { safetyChecksAtom, userNameAtom } from '../../data/appDataAtoms';
import { SafetyCheck } from '../../types';
import { Button } from '../../components/Button';

// Simple placeholder styles
const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: '16px', fontFamily: 'var(--font-family-sans)' },
  header: { fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' },
  subHeader: { fontSize: '1rem', color: 'var(--surface-fg-secondary)', marginBottom: '24px' },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' },
  listItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--surface-bg-primary)', borderRadius: '8px', border: '1px solid var(--surface-border-secondary)' },
  itemName: { fontWeight: 500 },
  itemStatus: { fontSize: '0.9rem', color: 'var(--surface-fg-tertiary)' },
};

const CheckItem = ({ check }: { check: SafetyCheck }) => (
  <li style={styles.listItem}>
    <div>
      <div style={styles.itemName}>{check.name}</div>
      <div style={styles.itemStatus}>Status: {check.status}</div>
    </div>
    <Button variant="secondary" size="s">Check Now</Button>
  </li>
);

export const DashboardView = () => {
  const userName = useAtomValue(userNameAtom);
  const checks = useAtomValue(safetyChecksAtom);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome, {userName}</h1>
      <p style={styles.subHeader}>Here are your outstanding safety checks.</p>
      <ul style={styles.list}>
        {checks.map(check => <CheckItem key={check.id} check={check} />)}
      </ul>
    </div>
  );
};