// src/types.ts

export type SafetyCheckStatus =
  | 'pending'
  | 'due-soon'
  | 'late'
  | 'missed'
  | 'completing'
  | 'complete'
  | 'queued';

export type SafetyCheckType = 'scheduled' | 'supplemental';

export interface SpecialClassification {
  type: string;
  details: string;
  residentId: string;
}

export interface Resident {
  id: string;
  name: string;
  location: string;
}

export interface SafetyCheck {
  id: string;
  type: SafetyCheckType;
  residents: Resident[];
  status: SafetyCheckStatus;
  dueDate: string; // ISO Date String
  walkingOrderIndex: number;
  specialClassifications?: SpecialClassification[];
  
  // Optional fields for completed/historical checks
  lastChecked?: string; // ISO Date String
  completionStatus?: string;
  notes?: string;
  incidentType?: string; // For supplemental checks

  // Lifecycle Fields
  generationId: number; // 1, 2, 3... The iteration count for this room
  baseInterval: number; // Minutes between checks
}

export type ScheduleFilter = 'all' | 'late' | 'due-soon' | 'queued';

export type HistoryFilter = 'all' | 'lateOrMissed' | 'supplemental';