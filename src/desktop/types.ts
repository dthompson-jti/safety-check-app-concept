// src/desktop/types.ts

import { SafetyCheck, Resident } from '../types';

/** Desktop-specific view states */
export type DesktopView = 'live' | 'historical';

/** Historical check with audit fields */
export interface HistoricalCheck {
    id: string;
    residents: Resident[];
    location: string;
    scheduledTime: string;      // ISO string - when check was scheduled
    actualTime: string | null;  // ISO string or null if missed
    varianceMinutes: number;    // Positive = late, negative = early, Infinity = missed
    status: 'done' | 'late' | 'missed';
    group: string;
    unit: string;
    officerName: string;
    officerNote?: string;
    supervisorNote?: string;
    reviewStatus: 'pending' | 'verified';
}

/** Filter state for toolbar */
export interface DesktopFilter {
    facility: string;  // 'all' or facility ID
    unit: string;      // 'all' or unit ID
    search: string;    // Resident name search
    showMissedOnly: boolean;
    statusFilter: 'all' | 'missed' | 'late';  // Status filter for historical view
    dateStart: string | null; // ISO Date string (YYYY-MM-DD)
    dateEnd: string | null;   // ISO Date string (YYYY-MM-DD)
}

/** Derived live check for table display */
export interface LiveCheckRow {
    id: string;
    status: 'missed' | 'due' | 'pending';
    timerText: string;
    timerSeverity: 'alert' | 'warning' | 'neutral';
    location: string;
    residents: Resident[];
    hasHighRisk: boolean;
    riskType?: string;
    group: string;      // Group assignment
    unit: string;       // Unit identifier
    lastCheckTime: string | null;
    lastCheckOfficer: string | null;
    supervisorNote?: string;
    originalCheck: SafetyCheck;
}

/** Supervisor note reason options */
export const SUPERVISOR_NOTE_REASONS = [
    'Unit Lockdown',
    'Medical Emergency',
    'Court Appearance',
    'Transport',
    'Staff Shortage',
    'Other',
] as const;

export type SupervisorNoteReason = typeof SUPERVISOR_NOTE_REASONS[number];
