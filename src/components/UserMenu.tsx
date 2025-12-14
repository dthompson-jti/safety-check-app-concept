// src/components/UserMenu.tsx
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { sessionAtom, appConfigAtom, userPreferencesAtom } from '../data/atoms';
import { useTheme } from '../data/useTheme';
import { generateAvatarHue } from '../data/users';
import { Button } from './Button';
import { SegmentedControl } from './SegmentedControl';
import { ColorSlider } from './ColorSlider';
import { useHaptics } from '../data/useHaptics';
import styles from './UserMenu.module.css';

interface UserMenuProps {
    displayName: string;
}

/**
 * UserMenu Component
 * 
 * Enhanced avatar dropdown with high-craft styling:
 * - Centered header with avatar initials + name on secondary background
 * - Appearance toggle (Light/Dark)
 * - Scan Mode duplicate control
 * - Avatar color slider (no swatch preview)
 * - Divider before logout
 */
export const UserMenu = ({ displayName }: UserMenuProps) => {
    const session = useAtomValue(sessionAtom);
    const setSession = useSetAtom(sessionAtom);
    const [appConfig, setAppConfig] = useAtom(appConfigAtom);
    const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);
    const { theme, setTheme } = useTheme();
    const { trigger: triggerHaptic } = useHaptics();

    if (!session.user) return null;

    const { username, initials } = session.user;
    const customHue = userPreferences[username]?.avatarHue;
    const currentHue = customHue !== undefined ? customHue : generateAvatarHue(username);
    const avatarColor = `oklch(0.65 0.18 ${currentHue})`;

    const handleLogout = () => {
        setSession({ isAuthenticated: false, user: null });
    };

    const handleThemeChange = (value: string) => {
        triggerHaptic('light');
        setTheme(value as 'light' | 'dark-a' | 'dark-b' | 'dark-c');
    };

    const handleScanModeChange = (value: string) => {
        triggerHaptic('light');
        setAppConfig(cur => ({ ...cur, scanMode: value as 'qr' | 'nfc' }));
    };

    const handleHueChange = (hue: number) => {
        setUserPreferences(cur => ({
            ...cur,
            [username]: { ...cur[username], avatarHue: hue }
        }));
    };

    return (
        <div className={styles.menuContainer}>
            {/* Centered Header with Avatar + Name */}
            <div className={styles.header}>
                <div className={styles.avatarLarge} style={{ backgroundColor: avatarColor }}>{initials}</div>
                <div className={styles.displayName}>{displayName}</div>
            </div>

            {/* Appearance Toggle */}
            <div className={styles.section}>
                <label className={styles.sectionLabel}>Appearance</label>
                <SegmentedControl
                    id="user-menu-appearance"
                    options={[
                        { value: 'light', label: 'Light' },
                        { value: 'dark-c', label: 'Dark' },
                    ]}
                    value={theme === 'light' ? 'light' : 'dark-c'}
                    onValueChange={handleThemeChange}
                    layout="row"
                />
            </div>

            {/* Scan Mode Duplicate */}
            <div className={styles.section}>
                <label className={styles.sectionLabel}>Scan Mode</label>
                <SegmentedControl
                    id="user-menu-scan-mode"
                    options={[
                        { value: 'qr', label: 'QR', icon: 'qr_code_2' },
                        { value: 'nfc', label: 'NFC', icon: 'nfc' },
                    ]}
                    value={appConfig.scanMode}
                    onValueChange={handleScanModeChange}
                    layout="row"
                />
            </div>

            {/* Avatar Color Slider */}
            <div className={styles.section} onPointerDown={(e) => e.stopPropagation()}>
                <ColorSlider
                    value={currentHue}
                    onChange={handleHueChange}
                    label="Avatar Color"
                />
            </div>

            {/* Divider */}
            <div className={styles.divider} />

            {/* Logout Button */}
            <Button
                variant="secondary"
                size="m"
                onClick={handleLogout}
                style={{ width: '100%' }}
            >
                <span className="material-symbols-rounded">logout</span>
                <span>Log Out</span>
            </Button>
        </div>
    );
};
