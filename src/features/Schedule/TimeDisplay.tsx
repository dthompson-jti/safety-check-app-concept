// src/features/Schedule/TimeDisplay.tsx
import { memo } from 'react';
import { useAtomValue } from 'jotai';
import {
    throttledTickerAtom,
    slowTickerAtom
} from '../../data/atoms';
import { formatTime } from '../../data/useAdaptiveCountdown';
import { SafetyCheckStatus } from '../../types';

interface TimeDisplayProps {
    dueTime: Date;
    status: SafetyCheckStatus;
}

// Sub-component for 10fps updates (Human readable, performant)
const FastTimer = ({ dueTime }: { dueTime: Date }) => {
    const now = useAtomValue(throttledTickerAtom);
    return <>{formatTime(dueTime, now)}</>;
};

// Sub-component for 1fps updates
const SlowTimer = ({ dueTime }: { dueTime: Date }) => {
    const now = useAtomValue(slowTickerAtom);
    return <>{formatTime(dueTime, now)}</>;
};

/**
 * Smart component that switches between update frequencies based on urgency.
 * This prevents the entire list from re-rendering at 60fps.
 */
export const TimeDisplay = memo(({ dueTime, status }: TimeDisplayProps) => {
    // Simplified 3-state model: early/pending (Upcoming), due, missed
    const isActionable = status === 'early' || status === 'pending' || status === 'due' || status === 'missed';

    if (!isActionable) {
        return null;
    }

    if (status === 'missed') {
        return <span>Missed</span>;
    }

    // Optimization: Only use 10fps timer for 'due' items (urgent)
    const isUrgent = status === 'due';

    return isUrgent ? <FastTimer dueTime={dueTime} /> : <SlowTimer dueTime={dueTime} />;
});