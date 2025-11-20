// src/types.ts

// A central definition for residents, used across the application.
export interface Resident {
  id: string;
  name: string;
  location: string;
}

// All possible business statuses for a safety check.
export type SafetyCheckStatus =
  | 'pending'
  | 'due-soon'
  | 'late'
  | 'complete'
  | 'completing'
  | 'missed'
  | 'queued';

// Defines a special classification attached to a specific resident within a check.
export interface SpecialClassification {
  type: string;
  details: string;
  residentId: string;
}

/**
 * The core data structure for a single safety check.
 * This is the definitive structure used throughout the application.
 */
export interface SafetyCheck {
  id: string;
  type: 'scheduled' | 'supplemental' | 'incident';
  residents: Resident[];
  status: SafetyCheckStatus;
  dueDate: string;
  walkingOrderIndex: number;
  lastChecked?: string;
  notes?: string;
  completionStatus?: string;
  specialClassifications?: SpecialClassification[];
  incidentType?: string;
}

/**
 * Represents the filter options available in the Schedule view.
 */
export type ScheduleFilter = 'all' | 'late' | 'due-soon' | 'queued';

/**
 * DEFINITIVE FIX: The HistoryFilter type is now defined and exported from the
 * central types file, establishing a single source of truth.
 */
export type HistoryFilter = 'all' | 'lateOrMissed' | 'supplemental';