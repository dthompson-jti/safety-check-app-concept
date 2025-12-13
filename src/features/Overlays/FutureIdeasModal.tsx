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
                    These are just conceptual ideas for a potential future version.  Nothing here is expected for v1.
                </div>

                {/* Original Features */}
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

                {/* Late Check Concepts */}
                <h3 style={{ marginTop: 'var(--spacing-5)', marginBottom: 'var(--spacing-3)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--surface-fg-secondary)' }}>
                    Late Check Concepts
                </h3>

                {/* Global Atmosphere */}
                <div className={styles.settingsGroup}>
                    <div className={styles.settingsItem}>
                        <label htmlFor="feat-vignette-switch" className={styles.itemLabel}>Active Vignette</label>
                        <Switch
                            id="feat-vignette-switch"
                            checked={featureFlags.feat_vignette}
                            onCheckedChange={handleSwitch((c) => setFeatureFlags(cur => ({ ...cur, feat_vignette: c })))}
                        />
                    </div>
                    <div className={styles.settingsItem}>
                        <label htmlFor="feat-glass-tint-switch" className={styles.itemLabel}>Glass Tinting</label>
                        <Switch
                            id="feat-glass-tint-switch"
                            checked={featureFlags.feat_glass_tint}
                            onCheckedChange={handleSwitch((c) => setFeatureFlags(cur => ({ ...cur, feat_glass_tint: c })))}
                        />
                    </div>
                </div>

                {/* Card Visuals */}
                <div className={styles.settingsGroup} style={{ marginTop: 'var(--spacing-4)' }}>
                    <div className={styles.settingsItem}>
                        <label htmlFor="feat-card-gradient-switch" className={styles.itemLabel}>Magma Gradient</label>
                        <Switch
                            id="feat-card-gradient-switch"
                            checked={featureFlags.feat_card_gradient}
                            onCheckedChange={handleSwitch((c) => setFeatureFlags(cur => ({ ...cur, feat_card_gradient: c })))}
                        />
                    </div>
                    <div className={styles.settingsItem}>
                        <label htmlFor="feat-card-border-switch" className={styles.itemLabel}>Fluid Borders</label>
                        <Switch
                            id="feat-card-border-switch"
                            checked={featureFlags.feat_card_border}
                            onCheckedChange={handleSwitch((c) => setFeatureFlags(cur => ({ ...cur, feat_card_border: c })))}
                        />
                    </div>
                    <div className={styles.settingsItem}>
                        <label htmlFor="feat-hazard-texture-switch" className={styles.itemLabel}>Hazard Texture</label>
                        <Switch
                            id="feat-hazard-texture-switch"
                            checked={featureFlags.feat_hazard_texture}
                            onCheckedChange={handleSwitch((c) => setFeatureFlags(cur => ({ ...cur, feat_hazard_texture: c })))}
                        />
                    </div>
                    <div className={styles.settingsItem}>
                        <label htmlFor="feat-invert-card-switch" className={styles.itemLabel}>Invert Card</label>
                        <Switch
                            id="feat-invert-card-switch"
                            checked={featureFlags.feat_invert_card}
                            onCheckedChange={handleSwitch((c) => setFeatureFlags(cur => ({ ...cur, feat_invert_card: c })))}
                        />
                    </div>
                    <div className={styles.settingsItem}>
                        <label htmlFor="feat-invert-badge-switch" className={styles.itemLabel}>Invert Badge</label>
                        <Switch
                            id="feat-invert-badge-switch"
                            checked={featureFlags.feat_invert_badge}
                            onCheckedChange={handleSwitch((c) => setFeatureFlags(cur => ({ ...cur, feat_invert_badge: c })))}
                        />
                    </div>
                </div>

                {/* Badge Pulse - Simple Toggle */}
                <div className={styles.settingsGroup} style={{ marginTop: 'var(--spacing-4)' }}>
                    <div className={styles.settingsItem}>
                        <label htmlFor="feat-badge-pulse-switch" className={styles.itemLabel}>Badge Pulse</label>
                        <Switch
                            id="feat-badge-pulse-switch"
                            checked={featureFlags.feat_badge_mode === 'pulse'}
                            onCheckedChange={handleSwitch((c) => setFeatureFlags(cur => ({ ...cur, feat_badge_mode: c ? 'pulse' : 'none' })))}
                        />
                    </div>
                </div>

                {/* Navigation */}
                <div className={styles.settingsGroup} style={{ marginTop: 'var(--spacing-4)' }}>
                    <div className={styles.settingsItem}>
                        <label htmlFor="feat-jump-fab-switch" className={styles.itemLabel}>Jump FAB</label>
                        <Switch
                            id="feat-jump-fab-switch"
                            checked={featureFlags.feat_jump_fab}
                            onCheckedChange={handleSwitch((c) => setFeatureFlags(cur => ({ ...cur, feat_jump_fab: c })))}
                        />
                    </div>
                </div>

                {/* System */}
                <div className={styles.settingsGroup} style={{ marginTop: 'var(--spacing-4)' }}>
                    <div className={styles.settingsItem}>
                        <label htmlFor="feat-bio-sync-switch" className={styles.itemLabel}>Bio-Sync Mode</label>
                        <Switch
                            id="feat-bio-sync-switch"
                            checked={featureFlags.feat_bio_sync}
                            onCheckedChange={handleSwitch((c) => setFeatureFlags(cur => ({ ...cur, feat_bio_sync: c })))}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
