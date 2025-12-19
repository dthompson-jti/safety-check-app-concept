// src/desktop/mockHistoricalData.ts

import { HistoricalCheck } from './types';

/**
 * Mock historical check data representing "yesterday's" checks.
 * Demonstrates various scenarios for the Historical Review view.
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
        officerName,
        officerNote: options.officerNote,
        supervisorNote: options.supervisorNote,
        reviewStatus: options.reviewStatus ?? (status === 'done' ? 'verified' : 'pending'),
    };
};

export const historicalChecks: HistoricalCheck[] = [
    // Good checks - on time
    createCheck('h1', 'John Davis', 'A-101', '08:00', '08:01', 'B. Corbin'),
    createCheck('h2', 'Sarah Mitchell', 'A-102', '08:15', '08:14', 'B. Corbin'),
    createCheck('h3', 'Mike Rodriguez', 'A-103', '08:30', '08:31', 'J. Smith'),
    createCheck('h4', 'Emily Chen', 'A-104', '08:45', '08:46', 'J. Smith'),

    // Late checks
    createCheck('h5', 'Dave Thompson', 'A-105', '09:00', '09:08', 'B. Corbin', {
        officerNote: 'Resident was in shower',
    }),
    createCheck('h6', 'James Wilson', 'B-201', '09:15', '09:22', 'K. Adams', {
        officerNote: 'Multiple residents in room, took extra time',
    }),
    createCheck('h7', 'Lisa Park', 'B-202', '09:30', '09:38', 'K. Adams'),

    // Missed checks - pending review
    createCheck('h8', 'Carlos Mendez', 'B-203', '09:45', null, 'B. Corbin', {
        reviewStatus: 'pending',
    }),
    createCheck('h9', 'Robert Kim', 'B-204', '10:00', null, 'B. Corbin', {
        reviewStatus: 'pending',
    }),
    createCheck('h10', 'Anna Lopez', 'C-301', '10:15', null, 'J. Smith', {
        officerNote: 'Door jammed, maintenance called',
        reviewStatus: 'pending',
    }),

    // Missed checks - already verified
    createCheck('h11', 'Marcus Brown', 'C-302', '10:30', null, 'J. Smith', {
        supervisorNote: 'Unit Lockdown - verified by Shift Supervisor',
        reviewStatus: 'verified',
    }),
    createCheck('h12', 'Jennifer Taylor', 'C-303', '10:45', null, 'K. Adams', {
        supervisorNote: 'Court Appearance - resident transported',
        reviewStatus: 'verified',
    }),

    // Afternoon checks - mix
    createCheck('h13', 'William Garcia', 'A-101', '11:00', '11:02', 'B. Corbin'),
    createCheck('h14', 'Patricia Moore', 'A-102', '11:15', '11:16', 'B. Corbin'),
    createCheck('h15', 'Christopher Lee', 'A-103', '11:30', '11:35', 'J. Smith'),
    createCheck('h16', 'Amanda White', 'A-104', '11:45', '11:47', 'J. Smith'),
    createCheck('h17', 'Daniel Harris', 'A-105', '12:00', '12:12', 'K. Adams', {
        officerNote: 'Medical check in progress',
    }),

    // More missed for bulk action testing
    createCheck('h18', 'Steven Clark', 'B-201', '12:15', null, 'B. Corbin', {
        reviewStatus: 'pending',
    }),
    createCheck('h19', 'Michelle Lewis', 'B-202', '12:30', null, 'B. Corbin', {
        reviewStatus: 'pending',
    }),
    createCheck('h20', 'Kevin Robinson', 'B-203', '12:45', null, 'J. Smith', {
        reviewStatus: 'pending',
    }),

    // Afternoon on-time
    createCheck('h21', 'Nancy Hall', 'B-204', '13:00', '13:01', 'K. Adams'),
    createCheck('h22', 'Brian Allen', 'C-301', '13:15', '13:14', 'K. Adams'),
    createCheck('h23', 'Sandra Young', 'C-302', '13:30', '13:32', 'B. Corbin'),
    createCheck('h24', 'Timothy King', 'C-303', '13:45', '13:46', 'B. Corbin'),
    createCheck('h25', 'Dorothy Wright', 'A-101', '14:00', '14:03', 'J. Smith'),
];
