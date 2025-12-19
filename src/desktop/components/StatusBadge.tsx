// src/desktop/components/StatusBadge.tsx
import React from 'react';
import styles from './StatusBadge.module.css';

export type StatusBadgeType = 'missed' | 'due' | 'pending' | 'complete' | 'late' | 'verified';

interface StatusBadgeProps {
    status: StatusBadgeType;
    label?: string;
}

const getStatusConfig = (status: StatusBadgeType): { label: string; icon: string | null } => {
    switch (status) {
        case 'missed':
            return { label: 'Missed', icon: 'notifications_active' };
        case 'due':
            return { label: 'Due', icon: 'schedule' };
        case 'pending':
            return { label: 'Upcoming', icon: 'event' };
        case 'complete':
        case 'verified':
            return { label: 'Completed', icon: 'check_circle' };
        case 'late':
            return { label: 'Late', icon: 'history' };
        default:
            return { label: status, icon: null };
    }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label: customLabel }) => {
    const config = getStatusConfig(status);
    const label = customLabel || config.label;

    return (
        <div className={styles.badge} data-status={status}>
            {config.icon && (
                <span className={`material-symbols-rounded ${styles.icon}`}>
                    {config.icon}
                </span>
            )}
            <span className={styles.label}>{label}</span>
        </div>
    );
};
