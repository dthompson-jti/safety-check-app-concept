// src/desktop/mockLiveData.ts

import { LiveCheckRow } from './types';

/**
 * Mock live check data for the desktop Live Monitor view.
 * This bypasses the main app's facility context requirements.
 */

const createLiveCheck = (
    id: string,
    residentName: string,
    location: string,
    status: 'missed' | 'due' | 'pending',
    timerText: string,
    options: {
        hasHighRisk?: boolean;
        riskType?: string;
        lastCheckTime?: string;
    } = {}
): LiveCheckRow => {
    const timerSeverity = status === 'missed' ? 'alert' : status === 'due' ? 'warning' : 'neutral';

    return {
        id,
        status,
        timerText,
        timerSeverity,
        location,
        residents: [{ id: `res-${id}`, name: residentName, location }],
        hasHighRisk: options.hasHighRisk || false,
        riskType: options.riskType,
        lastCheckTime: options.lastCheckTime || null,
        lastCheckOfficer: 'Brett Corbin',
        originalCheck: null as never, // Mock doesn't need original check
    };
};

// Generate realistic times relative to now
const now = new Date();
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();

export const mockLiveChecks: LiveCheckRow[] = [
    // Missed checks (highest priority)
    createLiveCheck('live-1', 'Jeff Siemens', '102', 'missed', 'Overdue 5m', {
        lastCheckTime: minutesAgo(35),
    }),
    createLiveCheck('live-2', 'Brett Corbin', '102', 'missed', 'Overdue 3m', {
        hasHighRisk: true,
        riskType: 'Suicide Watch',
        lastCheckTime: minutesAgo(33),
    }),
    createLiveCheck('live-3', 'Dave Thompson', '101', 'missed', 'Overdue 1m', {
        lastCheckTime: minutesAgo(31),
    }),

    // Due checks (warning state)
    createLiveCheck('live-4', 'Dave Thompson', '101', 'due', 'Due in 2m', {
        lastCheckTime: minutesAgo(28),
    }),
    createLiveCheck('live-5', 'Dave Thompson', '101', 'due', 'Due in 2m', {
        lastCheckTime: minutesAgo(28),
    }),

    // Upcoming checks (pending state)
    createLiveCheck('live-6', 'Dave Thompson', '101', 'pending', 'Due in 14m', {
        lastCheckTime: minutesAgo(16),
    }),
    createLiveCheck('live-7', 'Jalpa Mazmudar', '101', 'pending', 'Due in 14m', {
        hasHighRisk: true,
        riskType: 'Suicide Watch',
        lastCheckTime: minutesAgo(16),
    }),
    createLiveCheck('live-8', 'Dave Thompson', '101', 'pending', 'Due in 14m', {
        lastCheckTime: minutesAgo(16),
    }),
    createLiveCheck('live-9', 'Dave Thompson', '101', 'pending', 'Due in 14m', {
        lastCheckTime: minutesAgo(16),
    }),
    createLiveCheck('live-10', 'Aggressive Andy', '101', 'pending', 'Due in 14m', {
        lastCheckTime: minutesAgo(16),
    }),
    createLiveCheck('live-11', 'Dave Thompson', '101', 'pending', 'Due in 14m', {
        lastCheckTime: minutesAgo(16),
    }),
    createLiveCheck('live-12', 'Dave Thompson', '101', 'pending', 'Due in 14m', {
        lastCheckTime: minutesAgo(16),
    }),
    createLiveCheck('live-13', 'Dave Thompson', '101', 'pending', 'Due in 14m', {
        lastCheckTime: minutesAgo(16),
    }),
    createLiveCheck('live-14', 'Dave Thompson', '101', 'pending', 'Due in 14m', {
        lastCheckTime: minutesAgo(16),
    }),
    createLiveCheck('live-15', 'Dave Thompson', '101', 'pending', 'Due in 14m', {
        lastCheckTime: minutesAgo(16),
    }),
];
