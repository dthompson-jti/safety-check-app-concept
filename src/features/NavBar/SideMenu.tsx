// src/features/NavBar/SideMenu.tsx
import { useAtom, useSetAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { activeViewAtom, AppView, isSelectRoomModalOpenAtom, isSideMenuOpenAtom } from '../../data/atoms';
import styles from './SideMenu.module.css';

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

export const SideMenu = () => {
  const [isOpen, setIsOpen] = useAtom(isSideMenuOpenAtom);
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  // FIX: Corrected the atom name passed to useSetAtom.
  const setIsSelectRoomModalOpen = useSetAtom(isSelectRoomModalOpenAtom);

  const handleNavigation = (view: AppView) => {
    setActiveView(view);
    setIsOpen(false);
  };

  const handleSupplementalCheck = () => {
    setIsSelectRoomModalOpen(true);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
          />
          <motion.aside
            className={styles.sideMenu}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
          >
            <div className={styles.header}>
              <h3>eSupervision</h3>
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
              <div className={styles.separator} />
              <button className={styles.navItem} onClick={handleSupplementalCheck}>
                <span className="material-symbols-rounded">add_comment</span>
                <span>Supplemental Check</span>
              </button>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};