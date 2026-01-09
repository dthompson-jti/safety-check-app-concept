// src/desktop/components/CountdownWidget.tsx

import { useState, useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { Popover } from '../../components/Popover';
import { Switch } from '../../components/Switch';
import { autoRefreshAtom, nextRefreshSecondsAtom } from '../atoms';
import { slowTickerAtom } from '../../data/atoms';
import styles from './CountdownWidget.module.css';

export const CountdownWidget = () => {
    const [autoRefresh, setAutoRefresh] = useAtom(autoRefreshAtom);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // Subscribe to slow ticker for countdown updates (1fps)
    useAtomValue(slowTickerAtom);
    const remainingSeconds = useAtomValue(nextRefreshSecondsAtom);

    // Format last refresh time
    const lastRefreshedTime = new Date(autoRefresh.lastRefreshTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    // Toggle pause/resume
    const handleTogglePause = useCallback(() => {
        setAutoRefresh((prev) => ({
            ...prev,
            isPaused: !prev.isPaused,
        }));
    }, [setAutoRefresh]);

    // Manual refresh
    const handleRefreshNow = useCallback(() => {
        setAutoRefresh((prev) => ({
            ...prev,
            lastRefreshTime: Date.now(),
        }));
        setIsPopoverOpen(false);
        // Actual data refresh would be triggered here in a real scenario
        console.log('Manual refresh triggered');
    }, [setAutoRefresh]);

    // Trigger widget button
    const trigger = (
        <button className={styles.trigger} aria-label="Refresh options">
            <span className="material-symbols-rounded">refresh</span>
            <span className={styles.countdownText}>
                {autoRefresh.isPaused ? 'Paused' : `${remainingSeconds ?? 0}s`}
            </span>
            <span className={`material-symbols-rounded ${styles.caret}`}>
                expand_more
            </span>
        </button>
    );

    return (
        <Popover
            trigger={trigger}
            open={isPopoverOpen}
            onOpenChange={setIsPopoverOpen}
        >
            <div className={styles.popoverContent}>
                {/* Header: Auto-Refresh Toggle */}
                <div className={styles.popoverRow}>
                    <span className={styles.popoverLabel}>Auto-Refresh</span>
                    <Switch
                        checked={!autoRefresh.isPaused}
                        onCheckedChange={handleTogglePause}
                    />
                </div>

                <div className={styles.divider} />

                {/* Info rows */}
                <div className={styles.infoSection}>
                    <div className={styles.infoRow}>
                        <span className="material-symbols-rounded">update</span>
                        <span>Last refreshed: {lastRefreshedTime}</span>
                    </div>
                    {!autoRefresh.isPaused && (
                        <div className={styles.infoRow}>
                            <span className="material-symbols-rounded">timer</span>
                            <span>Next refresh: in {remainingSeconds}s</span>
                        </div>
                    )}
                </div>

                {/* Progress Ring */}
                {!autoRefresh.isPaused && (
                    <div className={styles.progressContainer}>
                        <svg className={styles.progressRing} viewBox="0 0 36 36">
                            {/* Background circle */}
                            <circle
                                className={styles.progressBg}
                                cx="18"
                                cy="18"
                                r="15.5"
                                fill="none"
                                strokeWidth="3"
                            />
                            {/* Foreground progress */}
                            <circle
                                className={styles.progressFg}
                                cx="18"
                                cy="18"
                                r="15.5"
                                fill="none"
                                strokeWidth="3"
                                strokeLinecap="round"
                                style={{
                                    strokeDasharray: '97.4', // circumference = 2 * PI * r
                                    strokeDashoffset: (remainingSeconds !== null)
                                        ? 97.4 * (1 - (remainingSeconds / autoRefresh.intervalSeconds))
                                        : 0,
                                }}
                            />
                        </svg>
                        <span className={styles.progressText}>
                            {remainingSeconds}<span className={styles.progressUnit}>s</span>
                        </span>
                    </div>
                )}

                <div className={styles.divider} />

                {/* Action buttons */}
                <div className={styles.actionButtons}>
                    <button
                        className="btn"
                        data-variant="primary"
                        data-size="s"
                        onClick={handleRefreshNow}
                    >
                        Refresh Now
                    </button>
                    <button
                        className="btn"
                        data-variant="secondary"
                        data-size="s"
                        onClick={handleTogglePause}
                    >
                        {autoRefresh.isPaused ? 'Resume' : 'Pause'}
                    </button>
                </div>
            </div>
        </Popover>
    );
};
