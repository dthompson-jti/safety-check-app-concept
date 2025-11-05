// src/features/Settings/SettingsView.tsx
import { useSetAtom } from 'jotai';
import { sessionAtom } from '../../data/atoms';
import { Button } from '../../components/Button';

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '16px',
    fontFamily: 'var(--font-family-sans)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    margin: 0,
    borderBottom: '1px solid var(--surface-border-secondary)',
    paddingBottom: '16px',
  },
};

export const SettingsView = () => {
  const setSession = useSetAtom(sessionAtom);

  const handleLogout = () => {
    setSession({ isAuthenticated: false, userName: null });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Settings</h2>
      <Button variant="destructive" size="m" onClick={handleLogout}>
        Log Out
      </Button>
    </div>
  );
};