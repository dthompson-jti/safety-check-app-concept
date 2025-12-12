// src/components/UserMenu.tsx
import { useSetAtom } from 'jotai';
import { sessionAtom } from '../data/atoms';
import { Button } from './Button';
import styles from './UserMenu.module.css';

interface UserMenuProps {
    displayName: string;
}

/**
 * UserMenu Component
 * 
 * Enhanced avatar dropdown with high-craft styling:
 * - 6px margin from trigger
 * - Concentric border radii (14px outer, 8px inner)
 * - User name display
 * - Logout button
 */
export const UserMenu = ({ displayName }: UserMenuProps) => {
    const setSession = useSetAtom(sessionAtom);

    const handleLogout = () => {
        setSession({ isAuthenticated: false, user: null });
    };

    return (
        <div className={styles.menuContainer}>
            <div className={styles.userName}>{displayName}</div>
            <Button
                variant="secondary"
                size="s"
                onClick={handleLogout}
                style={{ width: '100%' }}
            >
                Log Out
            </Button>
        </div>
    );
};
