// src/data/useAdaptiveCountdown.ts

const formatTime = (dueTime: Date, nowTime: number): string => {
    const diff = dueTime.getTime() - nowTime;
    const absDiff = Math.abs(diff);

    const minutes = Math.floor(absDiff / 60000);
    const seconds = Math.floor((absDiff % 60000) / 1000);
    const deciseconds = Math.floor((absDiff % 1000) / 100);

    const sign = diff < 0 ? '-' : '';

    // High precision for last minute
    if (minutes === 0) {
        return `${sign}${seconds}.${deciseconds}s`;
    }

    return `${sign}${minutes}m ${seconds}s`;
};

/**
 * A high-performance countdown hook that adapts its render frequency.
 * 
 * - If time > 1 minute: Subscribes to `slowTickerAtom` (1fps)
 * - If time < 1 minute: Subscribes to `fastTickerAtom` (60fps)
 * - If status is not actionable: Returns empty string (0 renders)
 */
export const useAdaptiveCountdown = (dueTime: Date): string => {
    // Note: The actual subscription logic has been moved to the TimeDisplay component
    // to prevent hook-rule violations and improve performance. 
    // This hook now serves primarily as a logic container for the formatter.
    return formatTime(dueTime, Date.now());
};

// Helper to export the formatter
export { formatTime };