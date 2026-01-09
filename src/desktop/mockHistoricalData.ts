// src/desktop/mockHistoricalData.ts

import { HistoricalCheck, DesktopFilter } from './types';

/**
 * Mock historical check data representing "yesterday's" checks.
 * Demonstrates various scenarios for the Historical Review view.
 * Contains 50+ rows for scroll/density testing per PRD Section 7.
 */

const createCheck = (
    id: string,
    residentName: string,
    location: string,
    scheduledTime: string,
    actualTime: string | null,
    officerName: string,
    options: {
        officerNote?: string;
        supervisorNote?: string;
        reviewStatus?: 'pending' | 'verified';
    } = {}
): HistoricalCheck => {
    let varianceMinutes = 0;
    let status: 'done' | 'late' | 'missed' = 'done';

    if (actualTime === null) {
        varianceMinutes = Infinity;
        status = 'missed';
    } else {
        const scheduled = new Date(`2024-12-17T${scheduledTime}`);
        const actual = new Date(`2024-12-17T${actualTime}`);
        varianceMinutes = Math.round((actual.getTime() - scheduled.getTime()) / 60000);
        status = varianceMinutes > 2 ? 'late' : 'done';
    }

    return {
        id,
        residents: [{ id: `res-${id}`, name: residentName, location }],
        location,
        scheduledTime: `2024-12-17T${scheduledTime}:00`,
        actualTime: actualTime ? `2024-12-17T${actualTime}:00` : null,
        varianceMinutes,
        status,
        group: location.startsWith('A') ? 'Alpha' : location.startsWith('B') ? 'Bravo' : 'Charlie',
        unit: location.includes('-10') ? 'Unit 1' : location.includes('-20') ? 'Unit 2' : 'Unit 3',
        officerName,
        officerNote: options.officerNote,
        supervisorNote: options.supervisorNote,
        reviewStatus: options.reviewStatus ?? (status === 'done' ? 'verified' : 'pending'),
    };
};

export const historicalChecks: HistoricalCheck[] = [
    // === MORNING SHIFT (06:00 - 10:00) ===

    // Early morning - all good
    createCheck('h1', 'John Davis', 'A-101', '06:00', '06:01', 'B. Corbin'),
    createCheck('h2', 'Sarah Mitchell', 'A-102', '06:15', '06:14', 'B. Corbin'),
    createCheck('h3', 'Mike Rodriguez', 'A-103', '06:30', '06:31', 'J. Smith'),
    createCheck('h4', 'Emily Chen', 'A-104', '06:45', '06:46', 'J. Smith'),
    createCheck('h5', 'Robert Kim', 'A-105', '07:00', '07:02', 'B. Corbin'),
    createCheck('h6', 'Lisa Park', 'B-201', '07:15', '07:14', 'K. Adams'),

    // Breakfast rush - some late
    createCheck('h7', 'Dave Thompson', 'B-202', '07:30', '07:38', 'B. Corbin', {
        officerNote: 'Resident was in shower',
    }),
    createCheck('h8', 'James Wilson', 'B-203', '07:45', '07:52', 'K. Adams', {
        officerNote: 'Multiple residents in room, took extra time',
    }),
    createCheck('h9', 'Marcus Brown', 'B-204', '08:00', '08:01', 'J. Smith'),
    createCheck('h10', 'Jennifer Taylor', 'C-301', '08:15', '08:16', 'J. Smith'),

    // Morning count - missed checks
    createCheck('h11', 'Carlos Mendez', 'C-302', '08:30', null, 'B. Corbin', {
        reviewStatus: 'pending',
    }),
    createCheck('h12', 'Anna Lopez', 'C-303', '08:45', null, 'B. Corbin', {
        officerNote: 'Door jammed, maintenance called',
        reviewStatus: 'pending',
    }),
    createCheck('h13', 'Steven Clark', 'A-101', '09:00', '09:02', 'K. Adams'),
    createCheck('h14', 'Michelle Lewis', 'A-102', '09:15', '09:14', 'K. Adams'),
    createCheck('h15', 'Kevin Robinson', 'A-103', '09:30', '09:32', 'B. Corbin'),

    // Verified missed - lockdown
    createCheck('h16', 'Nancy Hall', 'A-104', '09:45', null, 'J. Smith', {
        supervisorNote: 'Unit Lockdown - verified by Shift Supervisor',
        reviewStatus: 'verified',
    }),
    createCheck('h17', 'Brian Allen', 'A-105', '10:00', null, 'J. Smith', {
        supervisorNote: 'Unit Lockdown - verified by Shift Supervisor',
        reviewStatus: 'verified',
    }),

    // === MID-MORNING (10:00 - 12:00) ===

    createCheck('h18', 'Sandra Young', 'B-201', '10:15', '10:17', 'K. Adams'),
    createCheck('h19', 'Timothy King', 'B-202', '10:30', '10:31', 'B. Corbin'),
    createCheck('h20', 'Dorothy Wright', 'B-203', '10:45', '10:44', 'B. Corbin'),
    createCheck('h21', 'William Garcia', 'B-204', '11:00', '11:09', 'J. Smith', {
        officerNote: 'Medical check in progress',
    }),
    createCheck('h22', 'Patricia Moore', 'C-301', '11:15', '11:16', 'J. Smith'),
    createCheck('h23', 'Christopher Lee', 'C-302', '11:30', '11:35', 'K. Adams'),
    createCheck('h24', 'Amanda White', 'C-303', '11:45', '11:47', 'K. Adams'),
    createCheck('h25', 'Daniel Harris', 'A-101', '12:00', '12:02', 'B. Corbin'),

    // === LUNCH PERIOD (12:00 - 14:00) ===

    createCheck('h26', 'Jessica Martinez', 'A-102', '12:15', '12:14', 'B. Corbin'),
    createCheck('h27', 'Thomas Anderson', 'A-103', '12:30', '12:32', 'J. Smith'),

    // Missed during court transport
    createCheck('h28', 'Richard Scott', 'A-104', '12:45', null, 'J. Smith', {
        supervisorNote: 'Court Appearance - resident transported',
        reviewStatus: 'verified',
    }),
    createCheck('h29', 'Barbara Jackson', 'A-105', '13:00', '13:01', 'K. Adams'),
    createCheck('h30', 'Charles Thomas', 'B-201', '13:15', '13:22', 'K. Adams', {
        officerNote: 'Slow response, resident sleeping',
    }),

    // Pending missed checks
    createCheck('h31', 'Margaret Hernandez', 'B-202', '13:30', null, 'B. Corbin', {
        reviewStatus: 'pending',
    }),
    createCheck('h32', 'Joseph Walker', 'B-203', '13:45', null, 'B. Corbin', {
        reviewStatus: 'pending',
    }),
    createCheck('h33', 'Elizabeth Hall', 'B-204', '14:00', '14:03', 'J. Smith'),

    // === AFTERNOON SHIFT (14:00 - 18:00) ===

    createCheck('h34', 'David Allen', 'C-301', '14:15', '14:16', 'J. Smith'),
    createCheck('h35', 'Susan Young', 'C-302', '14:30', '14:29', 'K. Adams'),
    createCheck('h36', 'Mark Robinson', 'C-303', '14:45', '14:48', 'K. Adams'),
    createCheck('h37', 'Linda Clark', 'A-101', '15:00', '15:01', 'B. Corbin'),
    createCheck('h38', 'Paul Lewis', 'A-102', '15:15', '15:14', 'B. Corbin'),
    createCheck('h39', 'Karen Walker', 'A-103', '15:30', '15:38', 'J. Smith', {
        officerNote: 'Recreation time, had to locate resident',
    }),
    createCheck('h40', 'Donald King', 'A-104', '15:45', '15:46', 'J. Smith'),
    createCheck('h41', 'Betty Wright', 'A-105', '16:00', '16:02', 'K. Adams'),

    // Verified missed - medical emergency
    createCheck('h42', 'George Hill', 'B-201', '16:15', null, 'K. Adams', {
        supervisorNote: 'Medical Emergency - EMT on scene',
        reviewStatus: 'verified',
    }),
    createCheck('h43', 'Helen Lopez', 'B-202', '16:30', '16:31', 'B. Corbin'),
    createCheck('h44', 'Edward Gonzalez', 'B-203', '16:45', '16:44', 'B. Corbin'),
    createCheck('h45', 'Ruth Adams', 'B-204', '17:00', '17:07', 'J. Smith', {
        officerNote: 'Phone call in progress',
    }),

    // === EVENING (17:00 - 20:00) ===

    createCheck('h46', 'Frank Nelson', 'C-301', '17:15', '17:16', 'J. Smith'),
    createCheck('h47', 'Carol Carter', 'C-302', '17:30', '17:29', 'K. Adams'),
    createCheck('h48', 'Raymond Mitchell', 'C-303', '17:45', '17:48', 'K. Adams'),
    createCheck('h49', 'Virginia Roberts', 'A-101', '18:00', '18:01', 'B. Corbin'),
    createCheck('h50', 'Jerry Turner', 'A-102', '18:15', '18:14', 'B. Corbin'),

    // Missed - pending review
    createCheck('h51', 'Alice Phillips', 'A-103', '18:30', null, 'J. Smith', {
        reviewStatus: 'pending',
    }),
    createCheck('h52', 'Henry Campbell', 'A-104', '18:45', null, 'J. Smith', {
        officerNote: 'Staffing shortage during dinner',
        reviewStatus: 'pending',
    }),
    createCheck('h53', 'Deborah Parker', 'A-105', '19:00', '19:03', 'K. Adams'),
    createCheck('h54', 'Roger Evans', 'B-201', '19:15', '19:16', 'K. Adams'),
    createCheck('h55', 'Julia Edwards', 'B-202', '19:30', '19:32', 'B. Corbin'),

    // Verified - staff shortage
    createCheck('h56', 'Lawrence Collins', 'B-203', '19:45', null, 'B. Corbin', {
        supervisorNote: 'Staff Shortage - shift overlap gap',
        reviewStatus: 'verified',
    }),
    createCheck('h57', 'Shirley Stewart', 'B-204', '20:00', '20:01', 'J. Smith'),
];

export const TOTAL_HISTORICAL_RECORDS = 5420;

export function loadHistoricalChecksPage(
    cursor: number,
    pageSize: number,
    filter?: DesktopFilter
): Promise<{ data: HistoricalCheck[]; nextCursor: number | null }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Apply filtering to the entire dataset (for mock purposes)
            let allFiltered = historicalChecks;

            if (filter) {
                allFiltered = allFiltered.filter(check => {
                    if (filter.search) {
                        const searchLower = filter.search.toLowerCase();
                        const matchesResident = check.residents.some((r) =>
                            r.name.toLowerCase().includes(searchLower)
                        );
                        const matchesLocation = check.location.toLowerCase().includes(searchLower);
                        if (!matchesResident && !matchesLocation) return false;
                    }

                    if (filter.unit !== 'all') {
                        const unitFromLocation = check.location.split('-')[0];
                        if (unitFromLocation !== filter.unit) return false;
                    }

                    if (filter.statusFilter === 'missed' && check.status !== 'missed') return false;
                    if (filter.statusFilter === 'late' && check.status !== 'late') return false;

                    if (filter.dateStart || filter.dateEnd) {
                        const checkDate = check.scheduledTime.split('T')[0];
                        if (filter.dateStart && checkDate < filter.dateStart) return false;
                        if (filter.dateEnd && checkDate > filter.dateEnd) return false;
                    }

                    return true;
                });
            }

            const totalFilteredCount = filter ? allFiltered.length : TOTAL_HISTORICAL_RECORDS;

            let data: HistoricalCheck[] = [];

            // Paging the filtered data
            if (cursor < allFiltered.length) {
                data = allFiltered.slice(cursor, Math.min(cursor + pageSize, allFiltered.length));
            }

            // If we are not filtering, we can fill with generated data up to TOTAL_HISTORICAL_RECORDS
            if (!filter && data.length < pageSize && cursor + data.length < TOTAL_HISTORICAL_RECORDS) {
                const startIndex = cursor + data.length;
                const remainingNeeded = pageSize - data.length;
                const generateCount = Math.min(remainingNeeded, TOTAL_HISTORICAL_RECORDS - startIndex);

                const generated = Array.from({ length: generateCount }, (_, i) => {
                    const idx = startIndex + i;
                    const isMissed = idx % 20 === 0;
                    const isLate = idx % 7 === 0 && !isMissed;

                    const scheduledHour = 8 + Math.floor(idx / 60) % 12;
                    const scheduledMin = idx % 60;
                    const scheduledTime = `${scheduledHour.toString().padStart(2, '0')}:${scheduledMin.toString().padStart(2, '0')}`;

                    let actualTime: string | null = null;
                    let varianceMinutes = Infinity;
                    let status: 'done' | 'late' | 'missed' = 'missed';

                    if (!isMissed) {
                        const actualMin = (scheduledMin + (isLate ? 5 : 1)) % 60;
                        const actualHour = scheduledHour + (scheduledMin + (isLate ? 5 : 1) >= 60 ? 1 : 0);
                        actualTime = `${actualHour.toString().padStart(2, '0')}:${actualMin.toString().padStart(2, '0')}`;
                        varianceMinutes = isLate ? 5 : 1;
                        status = isLate ? 'late' : 'done';
                    }

                    return {
                        id: `gen-hist-${idx}`,
                        residents: [{ id: `res-gen-h-${idx}`, name: `Historical Resident ${idx}`, location: `Room ${idx % 100}` }],
                        location: `Room ${idx % 100}`,
                        scheduledTime: `2024-12-17T${scheduledTime}:00`,
                        actualTime: actualTime ? `2024-12-17T${actualTime}:00` : null,
                        varianceMinutes,
                        status,
                        group: (idx % 3 === 0) ? 'Alpha' : (idx % 3 === 1) ? 'Bravo' : 'Charlie',
                        unit: `Unit ${(idx % 3) + 1}`,
                        officerName: 'B. Corbin',
                        officerNote: undefined,
                        supervisorNote: undefined,
                        reviewStatus: (status === 'done' ? 'verified' : 'pending') as 'verified' | 'pending',
                    };
                });
                data = [...data, ...generated];
            }

            const nextCursor = cursor + data.length < totalFilteredCount ? cursor + data.length : null;
            resolve({ data, nextCursor });
        }, 1500); // Simulate network delay
    });
}

/**
 * Calculates total counts for the Historical View tab badges based on filters.
 * Returns the count of 'missed' checks.
 */
export function getHistoricalCounts(filter: DesktopFilter): { unreviewed: number } {
    // 1. Filter the base checks
    const filteredBase = historicalChecks.filter(check => {
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            const matchesResident = check.residents.some(r => r.name.toLowerCase().includes(searchLower));
            const matchesLocation = check.location.toLowerCase().includes(searchLower);
            if (!matchesResident && !matchesLocation) return false;
        }

        if (filter.unit !== 'all') {
            const unitFromLocation = check.location.split('-')[0];
            if (unitFromLocation !== filter.unit) return false;
        }

        if (filter.dateStart || filter.dateEnd) {
            const checkDate = check.scheduledTime.split('T')[0];
            if (filter.dateStart && checkDate < filter.dateStart) return false;
            if (filter.dateEnd && checkDate > filter.dateEnd) return false;
        }

        return check.status === 'missed' && !check.supervisorNote;
    });

    let unreviewed = filteredBase.length;

    // 2. Account for generated checks if not filtering strictly by something that breaks the idx % 20 logic
    if (!filter.search && filter.unit === 'all' && !filter.dateStart && !filter.dateEnd) {
        const remaining = TOTAL_HISTORICAL_RECORDS - historicalChecks.length;
        unreviewed += Math.floor(remaining / 20); // idx % 20 === 0
    }

    return { unreviewed };
}
