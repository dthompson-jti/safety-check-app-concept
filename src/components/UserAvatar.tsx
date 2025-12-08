// src/components/UserAvatar.tsx
import { useAtomValue } from 'jotai';
import { sessionAtom } from '../data/atoms';
import { Tooltip } from './Tooltip';
import styles from './UserAvatar.module.css';

export const UserAvatar = () => {
    const session = useAtomValue(sessionAtom);

    // Extract initials from userName
    const getInitials = (name: string | null): string => {
        if (!name) return '--';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const initials = getInitials(session.userName);
    const fullName = session.userName || 'Unknown User';

    return (
        <Tooltip content={fullName} side="bottom" delay={200}>
            <div className={styles.avatar} aria-label={`User: ${fullName}`}>
                {initials}
            </div>
        </Tooltip>
    );
};
