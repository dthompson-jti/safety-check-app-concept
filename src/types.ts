// src/types.ts

export type SafetyCheckStatus =
  | 'pending'
  | 'due-soon'
  | 'late'
  | 'complete'
  | 'completing' // Transient state for animation
  | 'missed'
  | 'supplemental'
  | 'queued'; // NEW: For offline mode

export interface Resident {
  id: string;
  name: string;
  location: string;
}

export interface SpecialClassification {
  type: string;
  details: string;
  residentId: string;
}

export interface SafetyCheck {
  id: string;
  residents: Resident[];
  status: SafetyCheckStatus;
  dueDate: string;
  walkingOrderIndex: number;
  lastChecked?: string;
  notes?: string;
  completionStatus?: string;
  specialClassification?: SpecialClassification;
}