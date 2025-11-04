// src/features/NavBar/NavBar.tsx
import { useAtom } from 'jotai';
import { activeViewAtom, AppView } from '../../data/atoms';
import styles from './NavBar.module.css';

interface NavItem {
  id: AppView;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'checks', label: 'Checks', icon: 'checklist' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export const NavBar = () => {
  const [activeView, setActiveView] = useAtom(activeViewAtom);

  return (
    <nav className={styles.navBar}>
      {navItems.map(item => {
        const isActive = activeView === item.id;
        const buttonClasses = `${styles.navButton} ${isActive ? styles.active : ''}`;
        
        return (
          <button key={item.id} className={buttonClasses} onClick={() => setActiveView(item.id)}>
            <span className="material-symbols-rounded">{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};