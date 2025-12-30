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
        supervisorNote?: string;
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
        supervisorNote: options.supervisorNote,
        originalCheck: null as never,
    };
};

// Generate realistic times relative to now
const now = new Date();
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();

const generateData = (): LiveCheckRow[] => {
    const data: LiveCheckRow[] = [];

    // 1. Critical Missed Checks (Some with supervisor notes)
    data.push(createLiveCheck('live-1', 'Jeff Siemens', '102', 'missed', 'Overdue 5m', {
        lastCheckTime: minutesAgo(35),
    }));
    data.push(createLiveCheck('live-2', 'Brett Corbin', '102', 'missed', 'Overdue 3m', {
        hasHighRisk: true,
        riskType: 'Suicide Watch',
        lastCheckTime: minutesAgo(33),
    }));
    data.push(createLiveCheck('live-3', 'Dave Thompson', '101', 'missed', 'Overdue 1m', {
        lastCheckTime: minutesAgo(31),
        supervisorNote: 'Unit Lockdown - shift lead notified',
    }));

    // 2. Due Checks
    for (let i = 4; i <= 10; i++) {
        data.push(createLiveCheck(`live-${i}`, `Resident ${i}`, `20${i}`, 'due', 'Due in 2m', {
            lastCheckTime: minutesAgo(28),
        }));
    }

    // 3. Pending Checks (Large dataset for loading simulation)
    const names = ['Jalpa Mazmudar', 'Aggressive Andy', 'Michael Scott', 'Jim Halpert', 'Pam Beesly', 'Dwight Schrute', 'Angela Martin', 'Kevin Malone', 'Oscar Martinez', 'Stanley Hudson'];
    const rooms = ['101', '102', '201', '202', '301', '302', '401', '402'];

    for (let i = 11; i <= 124; i++) {
        const name = names[i % names.length];
        const room = rooms[i % rooms.length];
        const isHighRisk = i % 15 === 0;

        data.push(createLiveCheck(
            `live-${i}`,
            `${name} ${Math.floor(i / 10)}`,
            `${room}`,
            'pending',
            `Due in ${10 + (i % 50)}m`,
            {
                lastCheckTime: minutesAgo(16),
                hasHighRisk: isHighRisk,
                riskType: isHighRisk ? 'Random Assessment' : undefined
            }
        ));
    }

    return data;
};

export const mockLiveChecks: LiveCheckRow[] = generateData();

// Export the total count constant
export const TOTAL_LIVE_RECORDS = 8914;

// Pagination helper to simulate async fetch
export function loadLiveChecksPage(
    cursor: number,
    pageSize: number
): Promise<{ data: LiveCheckRow[]; nextCursor: number | null }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            let data: LiveCheckRow[] = [];

            // If we've already loaded the base 124 realistic rows, generate fake ones
            if (cursor < mockLiveChecks.length) {
                data = mockLiveChecks.slice(cursor, Math.min(cursor + pageSize, mockLiveChecks.length));
            }

            // Fill remaining with generated data if still within total limit
            const remainingNeeded = pageSize - data.length;
            if (remainingNeeded > 0 && cursor + data.length < TOTAL_LIVE_RECORDS) {
                const startIndex = cursor + data.length;
                const generateCount = Math.min(remainingNeeded, TOTAL_LIVE_RECORDS - startIndex);

                const generated = Array.from({ length: generateCount }, (_, i) => {
                    const idx = startIndex + i;
                    const status = (['pending', 'due', 'missed'] as const)[idx % 3];
                    const timerSeverity: 'alert' | 'warning' | 'neutral' = status === 'missed' ? 'alert' : status === 'due' ? 'warning' : 'neutral';

                    return {
                        id: `gen-live-${idx}`,
                        status,
                        timerText: `Due in ${10 + (idx % 50)}m`,
                        timerSeverity,
                        location: `${100 + (idx % 200)}`,
                        residents: [{ id: `res-gen-${idx}`, name: `Resident ${idx}`, location: `${100 + (idx % 200)}` }],
                        hasHighRisk: idx % 15 === 0,
                        riskType: idx % 15 === 0 ? 'Random Assessment' : undefined,
                        lastCheckTime: new Date(Date.now() - 16 * 60000).toISOString(),
                        lastCheckOfficer: 'Brett Corbin',
                        supervisorNote: undefined,
                        originalCheck: null as never,
                    };
                });
                data = [...data, ...generated];
            }

            const nextCursor = cursor + data.length < TOTAL_LIVE_RECORDS ? cursor + data.length : null;
            resolve({ data, nextCursor });
        }, 1500); // Simulate network delay
    });
}
