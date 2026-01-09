// src/desktop/components/DesktopTabGroup.tsx

import { useAtom, useAtomValue } from 'jotai';
import { desktopViewAtom, desktopTabCountsAtom } from '../atoms';
import { DesktopView } from '../types';
import styles from './DesktopTabGroup.module.css';

interface TabProps {
    id: DesktopView;
    label: string;
    isActive: boolean;
    onClick: () => void;
    children?: React.ReactNode; // For badge content
}

const Tab = ({ id, label, isActive, onClick, children }: TabProps) => (
    <button
        className={styles.tab}
        data-active={isActive}
        onClick={onClick}
        role="tab"
        aria-selected={isActive}
        aria-controls={`${id}-panel`}
    >
        <span className={styles.tabLabel}>{label}</span>
        {children && (
            <div className={styles.badgePill}>
                {children}
            </div>
        )}
    </button>
);

interface StatusBadgeProps {
    icon: string;
    count: number;
    status: 'missed' | 'due' | 'neutral';
}

const StatusBadge = ({ icon, count, status }: StatusBadgeProps) => (
    <span
        className={styles.statusBadge}
        data-status={status}
        data-empty={count === 0 ? 'true' : undefined}
    >
        <span className="material-symbols-rounded">{icon}</span>
        <span className={styles.badgeCount}>{count}</span>
    </span>
);

export const DesktopTabGroup = () => {
    const [view, setView] = useAtom(desktopViewAtom);
    const counts = useAtomValue(desktopTabCountsAtom);

    return (
        <nav className={styles.tabGroup} role="tablist" aria-label="View selector">
            {/* Live View Tab */}
            <Tab
                id="live"
                label="Live View"
                isActive={view === 'live'}
                onClick={() => setView('live')}
            >
                <StatusBadge icon="notifications_active" count={counts.missed} status="missed" />
                <StatusBadge icon="schedule" count={counts.due} status="due" />
            </Tab>

            {/* Historical Tab */}
            <Tab
                id="historical"
                label="Historical"
                isActive={view === 'historical'}
                onClick={() => setView('historical')}
            >
                <StatusBadge icon="person_alert" count={counts.unreviewed} status="missed" />
            </Tab>
        </nav>
    );
};
