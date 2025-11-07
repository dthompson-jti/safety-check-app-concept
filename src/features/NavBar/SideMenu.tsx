// src/features/NavBar/SideMenu.tsx
import { useAtom } from 'jotai';
import { appViewAtom, AppView } from '../../data/atoms';
import { Button } from '../../components/Button';
import styles from './SideMenu.module.css';

interface NavItem {
  id: AppView;
  label: string;
  icon: string;
}

// ENHANCEMENT: Removed 'Checks' from navigation for simplification.
const navItems: NavItem[] = [
  { id: 'dashboardTime', label: 'Dashboard', icon: 'dashboard' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export const SideMenu = () => {
  const [activeView, setView] = useAtom(appViewAtom);

  const handleNavigation = (view: AppView) => {
    setView(view);
  };

  const handleCloseMenu = () => {
    setView('dashboardTime'); // Default back to the time view
  };

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
            className={`${styles.navItem} ${activeView === item.id ? styles.active : ''}`}
            onClick={() => handleNavigation(item.id)}
          >
            <span className="material-symbols-rounded">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};