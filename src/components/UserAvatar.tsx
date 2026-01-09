// src/components/UserAvatar.tsx
import { useAtomValue, useSetAtom } from 'jotai';
import { sessionAtom, userPreferencesAtom, isUserSettingsModalOpenAtom, isSettingsModalOpenAtom } from '../data/atoms';
import { featureFlagsAtom } from '../data/featureFlags';
import { generateAvatarHue, getAvatarColor } from '../data/users';
import styles from './UserAvatar.module.css';

export const UserAvatar = ({ className }: { className?: string }) => {
    const session = useAtomValue(sessionAtom);
    const userPreferences = useAtomValue(userPreferencesAtom);
    const featureFlags = useAtomValue(featureFlagsAtom);
    const setUserSettingsOpen = useSetAtom(isUserSettingsModalOpenAtom);
    const setSettingsOpen = useSetAtom(isSettingsModalOpenAtom);

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

    const handleAvatarClick = () => {
        if (featureFlags.enableEnhancedAvatarDropdown) {
            setUserSettingsOpen(true);
        } else {
            setSettingsOpen(true);
        }
    };

    return (
        <div
            className={`${styles.avatar} ${className || ''}`}
            aria-label={`User: ${displayName}`}
            style={backgroundColor ? { backgroundColor } : undefined}
            onClick={handleAvatarClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAvatarClick();
                }
            }}
        >
            {initials}
        </div>
    );
};
