// src/components/UserAvatar.tsx
import { useAtomValue, useSetAtom } from 'jotai';
import { sessionAtom, userPreferencesAtom, isUserSettingsModalOpenAtom } from '../data/atoms';
import { generateAvatarHue, getAvatarColor } from '../data/users';
import styles from './UserAvatar.module.css';

export const UserAvatar = ({ className }: { className?: string }) => {
    const session = useAtomValue(sessionAtom);
    const userPreferences = useAtomValue(userPreferencesAtom);
    const setUserSettingsOpen = useSetAtom(isUserSettingsModalOpenAtom);

    if (!session.user) {
        return null;
    }

    const { initials, displayName, username } = session.user;

    // Get color: Dynamic color is now a standard feature
    const customHue = userPreferences[username]?.avatarHue;
    const hue = customHue !== undefined ? customHue : generateAvatarHue(username);
    const backgroundColor = getAvatarColor(hue);

    const handleAvatarClick = () => {
        setUserSettingsOpen(true);
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
