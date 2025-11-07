// src/features/NavBar/SideMenu.tsx
import { useAtom, useSetAtom } from 'jotai';
import {
  appViewAtom,
  AppView,
  isHistoryModalOpenAtom,
  isSettingsModalOpenAtom,
  isDevToolsModalOpenAtom,
} from '../../data/atoms';
import { Button } from '../../components/Button';
import styles from './SideMenu.module.css';

interface NavItem {
  id: AppView | 'history' | 'settings' | 'devtools';
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'dashboardTime', label: 'Dashboard', icon: 'dashboard' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const devNavItems: NavItem[] = [{ id: 'devtools', label: 'Developer Tools', icon: 'construction' }];

export const SideMenu = () => {
  const [activeView, setView] = useAtom(appViewAtom);
  const setIsHistoryOpen = useSetAtom(isHistoryModalOpenAtom);
  const setIsSettingsOpen = useSetAtom(isSettingsModalOpenAtom);
  const setIsDevToolsOpen = useSetAtom(isDevToolsModalOpenAtom);

  const handleNavigation = (id: NavItem['id']) => {
    switch (id) {
      case 'history':
        setIsHistoryOpen(true);
        break;
      case 'settings':
        setIsSettingsOpen(true);
        break;
      case 'devtools':
        setIsDevToolsOpen(true);
        break;
      default:
        setView(id);
    }
  };

  const handleCloseMenu = () => {
    setView('dashboardTime'); // Default back to the time view
  };

  const isDashboard = activeView === 'dashboardTime' || activeView === 'dashboardRoute';

  return (
    <aside className={styles.sideMenu}>
      <div className={styles.header}>
        <Button variant="tertiary" size="m" iconOnly onClick={handleCloseMenu} aria-label="Close menu">
          <span className="material-symbols-rounded">close</span>
        </Button>
        <h3>eSupervision</h3>
        <Button variant="tertiary" size="m" iconOnly onClick={handleCloseMenu} aria-label="Close menu">
          <span className="material-symbols-rounded">double_arrow</span>
        </Button>
      </div>
      <nav className={styles.navList}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${isDashboard && item.id === 'dashboardTime' ? styles.active : ''}`}
            onClick={() => handleNavigation(item.id)}
          >
            <span className="material-symbols-rounded">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
        <div className={styles.separator} />
        {devNavItems.map((item) => (
          <button key={item.id} className={styles.navItem} onClick={() => handleNavigation(item.id)}>
            <span className="material-symbols-rounded">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};