import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { sessionAtom, appConfigAtom, userPreferencesAtom } from '../../data/atoms';
import { featureFlagsAtom } from '../../data/featureFlags';
import { useTheme } from '../../data/useTheme';
import { generateAvatarHue } from '../../data/users';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ColorSlider } from '../../components/ColorSlider';
import { Switch } from '../../components/Switch';
import { Button } from '../../components/Button';
import { useHaptics } from '../../data/useHaptics';
import styles from './UserSettingsModal.module.css';

/**
 * UserSettingsModal - Future Ideas Feature
 * 
 * A full-screen modal for user-specific settings, triggered by the Enhanced Avatar.
 * Slides in from the right with user profile header and controls.
 */
export const UserSettingsModal = () => {
    const session = useAtomValue(sessionAtom);
    const setSession = useSetAtom(sessionAtom);
    const [appConfig, setAppConfig] = useAtom(appConfigAtom);
    const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);
    const [featureFlags] = useAtom(featureFlagsAtom);
    const { theme, setTheme } = useTheme();
    const { trigger: triggerHaptic } = useHaptics();

    if (!session.user) return null;

    const { username, initials, displayName } = session.user;
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
        <motion.div
            className={styles.userSettingsContainer}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
            {/* User Profile Header */}
            <div className={styles.profileHeader}>
                <div className={styles.avatarLarge} style={{ backgroundColor: avatarColor }}>
                    {initials}
                </div>
                <h2 className={styles.userName}>{displayName}</h2>
            </div>

            {/* Settings Section */}
            <div className={styles.settingsSection}>
                <h3 className={styles.sectionTitle}>Appearance</h3>
                <div className={styles.settingsGroup}>
                    <div className={styles.settingsItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-2)' }}>
                        <label className={styles.itemLabel}>Theme</label>
                        <SegmentedControl
                            id="user-theme-toggle"
                            options={[
                                { value: 'light', label: 'Light' },
                                { value: 'dark-c', label: 'Dark' },
                            ]}
                            value={theme === 'light' ? 'light' : 'dark-c'}
                            onValueChange={handleThemeChange}
                            layout="row"
                        />
                    </div>

                    <div className={styles.settingsItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-2)' }} data-no-hover="true">
                        <ColorSlider
                            label="Avatar Color"
                            value={currentHue}
                            onChange={handleHueChange}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.settingsSection}>
                <h3 className={styles.sectionTitle}>Preferences</h3>
                <div className={styles.settingsGroup}>
                    <div className={styles.settingsItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-2)' }}>
                        <label className={styles.itemLabel}>Scan Mode</label>
                        <SegmentedControl
                            id="user-scan-mode-toggle"
                            options={[
                                { value: 'qr', label: 'QR', icon: 'qr_code_2' },
                                { value: 'nfc', label: 'NFC', icon: 'nfc' },
                            ]}
                            value={appConfig.scanMode}
                            onValueChange={handleScanModeChange}
                            itemDirection="column"
                        />
                    </div>

                    {/* Haptics: Only visible when useHapticsEnabled feature flag is on */}
                    {featureFlags.useHapticsEnabled && (
                        <div className={styles.settingsItem}>
                            <label htmlFor="user-haptics-switch" className={styles.itemLabel}>
                                Haptic Feedback
                            </label>
                            <Switch
                                id="user-haptics-switch"
                                checked={appConfig.hapticsEnabled}
                                onCheckedChange={(checked) => {
                                    triggerHaptic('light');
                                    setAppConfig(cur => ({ ...cur, hapticsEnabled: checked }));
                                }}
                            />
                        </div>
                    )}

                    {/* Audio: Only visible when useSoundEnabled feature flag is on */}
                    {featureFlags.useSoundEnabled && (
                        <div className={styles.settingsItem}>
                            <label htmlFor="user-audio-switch" className={styles.itemLabel}>
                                Audio Feedback
                            </label>
                            <Switch
                                id="user-audio-switch"
                                checked={appConfig.audioEnabled}
                                onCheckedChange={(checked) =>
                                    setAppConfig(cur => ({ ...cur, audioEnabled: checked }))
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Account Section */}
            <div className={styles.settingsSection}>
                <h3 className={styles.sectionTitle}>Account</h3>
                <Button
                    variant="secondary"
                    onClick={handleLogout}
                    className={styles.logoutButton}
                >
                    <span className="material-symbols-rounded">logout</span>
                    <span>Log Out</span>
                </Button>
            </div>
        </motion.div>
    );
};
