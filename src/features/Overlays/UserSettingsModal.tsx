import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { sessionAtom, appConfigAtom, userPreferencesAtom } from '../../data/atoms';
import { futureIdeasUnlockedAtom } from '../../data/featureFlags';
import { useTheme, Theme } from '../../data/useTheme';
import { generateAvatarHue, getAvatarColor } from '../../data/users';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ColorSlider } from '../../components/ColorSlider';
import { Switch } from '../../components/Switch';
import { Button } from '../../components/Button';
import { useHaptics } from '../../data/useHaptics';
import styles from './UserSettingsModal.module.css';

/**
 * UserSettingsModal - Promoted to Standard Production Feature
 * 
 * A full-screen modal for user settings, triggered by the Avatar.
 * Slides in from the right with user profile header and controls.
 */
export const UserSettingsModal = () => {
    const session = useAtomValue(sessionAtom);
    const setSession = useSetAtom(sessionAtom);
    const [appConfig, setAppConfig] = useAtom(appConfigAtom);
    const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);
    const isExperimentalEnabled = useAtomValue(futureIdeasUnlockedAtom);
    const { theme, setTheme } = useTheme();
    const { trigger: triggerHaptic } = useHaptics();

    if (!session.user) return null;

    const { username, initials, displayName } = session.user;
    const customHue = userPreferences[username]?.avatarHue;
    const currentHue = customHue !== undefined ? customHue : generateAvatarHue(username);
    const avatarColor = getAvatarColor(currentHue);

    const handleLogout = () => {
        setSession({ isAuthenticated: false, user: null });
    };

    const handleThemeChange = (value: string) => {
        triggerHaptic('light');
        setTheme(value as Theme);
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

            {/* Appearance Section */}
            <div className={styles.settingsSection}>
                <div className={styles.settingsGroup}>
                    <div className={styles.settingsItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-2)' }}>
                        <label className={styles.itemLabel}>Theme</label>
                        <SegmentedControl
                            id="user-theme-toggle"
                            options={[
                                { value: 'system', label: 'System', icon: 'desktop_windows' },
                                { value: 'light', label: 'Light', icon: 'light_mode' },
                                { value: 'dark', label: 'Dark', icon: 'dark_mode' },
                            ]}
                            value={theme}
                            onValueChange={handleThemeChange}
                            layout="row"
                            itemDirection="column"
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

            {/* Preferences Section */}
            <div className={styles.settingsSection}>
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

                    {/* Experimental Section: Haptics & Sound (Only visible if Future Ideas unlocked via logo) */}
                    {isExperimentalEnabled && (
                        <div className={styles.experimentalSection} style={{ marginTop: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
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

                            <div className={styles.settingsItem}>
                                <label htmlFor="user-audio-switch" className={styles.itemLabel}>
                                    Audio Feedback
                                </label>
                                <Switch
                                    id="user-audio-switch"
                                    checked={appConfig.audioEnabled}
                                    onCheckedChange={(checked) => {
                                        triggerHaptic('light');
                                        setAppConfig(cur => ({ ...cur, audioEnabled: checked }));
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Account Section */}
            <div className={styles.settingsSection}>
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
