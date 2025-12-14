// src/components/UserAvatar.tsx
import { useAtomValue, useSetAtom } from 'jotai';
import { sessionAtom, userPreferencesAtom, isUserSettingsModalOpenAtom } from '../data/atoms';
import { featureFlagsAtom } from '../data/featureFlags';
import { generateAvatarHue, getAvatarColor } from '../data/users';
import { Popover } from './Popover';
import styles from './UserAvatar.module.css';

export const UserAvatar = () => {
    const session = useAtomValue(sessionAtom);
    const userPreferences = useAtomValue(userPreferencesAtom);
    const featureFlags = useAtomValue(featureFlagsAtom);
    const setUserSettingsOpen = useSetAtom(isUserSettingsModalOpenAtom);

    if (!session.user) {
        return null;
    }

    const { initials, displayName, username } = session.user;

    // Get color: Only use OKLCH when enhanced dropdown is enabled
    let backgroundColor: string | undefined;
    if (featureFlags.enableEnhancedAvatarDropdown) {
        const customHue = userPreferences[username]?.avatarHue;
        const hue = customHue !== undefined ? customHue : generateAvatarHue(username);
        backgroundColor = getAvatarColor(hue);
    }
    // When flag is OFF, backgroundColor is undefined -> falls back to CSS static blue

    const avatarElement = (
        <div
            className={styles.avatar}
            aria-label={`User: ${displayName}`}
            style={backgroundColor ? { backgroundColor } : undefined}
            onClick={featureFlags.enableEnhancedAvatarDropdown ? () => setUserSettingsOpen(true) : undefined}
            role={featureFlags.enableEnhancedAvatarDropdown ? "button" : undefined}
        >
            {initials}
        </div>
    );

    // Enhanced mode: Just show clickable avatar (no popover)
    if (featureFlags.enableEnhancedAvatarDropdown) {
        return avatarElement;
    }

    // Default: Simple name popover
    const popoverContent = (
        <div className={styles.popoverContent}>
            {displayName}
        </div>
    );

    return (
        <Popover trigger={avatarElement} variant="tooltip">
            {popoverContent}
        </Popover>
    );
};
