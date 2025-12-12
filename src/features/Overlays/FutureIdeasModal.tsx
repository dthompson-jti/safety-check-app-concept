// src/features/Overlays/FutureIdeasModal.tsx
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { featureFlagsAtom } from '../../data/featureFlags';
import { appConfigAtom } from '../../data/atoms';
import { useHaptics } from '../../data/useHaptics';
import { useTheme } from '../../data/useTheme';
import { Switch } from '../../components/Switch';
import styles from './DeveloperModal.module.css';

export const FutureIdeasModal = () => {
    const [featureFlags, setFeatureFlags] = useAtom(featureFlagsAtom);
    const [appConfig, setAppConfig] = useAtom(appConfigAtom);
    const { trigger: triggerHaptic } = useHaptics();
    const { theme, setTheme } = useTheme();

    // CRITICAL: Reset actual settings when feature flags are disabled
    useEffect(() => {
        // When dark mode feature is disabled, reset theme to light
        if (!featureFlags.enableDarkMode && theme !== 'light') {
            setTheme('light');
        }

        // When sound feature is disabled, turn off audio
        if (!featureFlags.useSoundEnabled && appConfig.audioEnabled) {
            setAppConfig(cur => ({ ...cur, audioEnabled: false }));
        }

        // When haptics feature is disabled, turn off haptics
        if (!featureFlags.useHapticsEnabled && appConfig.hapticsEnabled) {
            setAppConfig(cur => ({ ...cur, hapticsEnabled: false }));
        }
    }, [featureFlags.enableDarkMode, featureFlags.useSoundEnabled, featureFlags.useHapticsEnabled, theme, setTheme, appConfig.audioEnabled, appConfig.hapticsEnabled, setAppConfig]);

    const handleSwitch = (setter: (val: boolean) => void) => (checked: boolean) => {
        triggerHaptic('light');
        setter(checked);
    };

    return (
        <motion.div
            className={styles.container}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
            {/* Future Ideas Section */}
            <div className={styles.settingSection}>
                <div className={styles.warningBlock} style={{
                    padding: 'var(--spacing-3)',
                    marginBottom: 'var(--spacing-3)',
                    backgroundColor: 'var(--color-surface-tertiary)',
                    border: '1px solid var(--color-control-tertiary-border)',
                    borderRadius: 'var(--radius-3)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.4'
                }}>
                    <strong>Experimental Features</strong><br />
                    These are ideas being explored for a future version. Do not build unless Jeff asks.
                </div>
                <div className={styles.settingsGroup}>
                    <div className={styles.settingsItem}>
                        <label htmlFor="use-sound-switch" className={styles.itemLabel}>Use Sound</label>
                        <Switch
                            id="use-sound-switch"
                            checked={featureFlags.useSoundEnabled}
                            onCheckedChange={handleSwitch((c) => setFeatureFlags(cur => ({ ...cur, useSoundEnabled: c })))}
                        />
                    </div>
                    <div className={styles.settingsItem}>
                        <label htmlFor="use-haptics-switch" className={styles.itemLabel}>Use Haptics</label>
                        <Switch
                            id="use-haptics-switch"
                            checked={featureFlags.useHapticsEnabled}
                            onCheckedChange={handleSwitch((c) => setFeatureFlags(cur => ({ ...cur, useHapticsEnabled: c })))}
                        />
                    </div>
                    <div className={styles.settingsItem}>
                        <label htmlFor="enable-dark-mode-switch" className={styles.itemLabel}>Enable Dark Mode</label>
                        <Switch
                            id="enable-dark-mode-switch"
                            checked={featureFlags.enableDarkMode}
                            onCheckedChange={handleSwitch((c) => setFeatureFlags(cur => ({ ...cur, enableDarkMode: c })))}
                        />
                    </div>
                    <div className={styles.settingsItem}>
                        <label htmlFor="enable-enhanced-avatar-switch" className={styles.itemLabel}>Enhanced Avatar Dropdown</label>
                        <Switch
                            id="enable-enhanced-avatar-switch"
                            checked={featureFlags.enableEnhancedAvatarDropdown}
                            onCheckedChange={handleSwitch((c) => setFeatureFlags(cur => ({ ...cur, enableEnhancedAvatarDropdown: c })))}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
