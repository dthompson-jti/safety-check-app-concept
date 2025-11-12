// src/types.ts
// (Assuming this is the location of the type definitions)

export type SafetyCheckStatus =
  | 'pending'
  | 'due-soon'
  | 'late'
  | 'missed'
  | 'complete'
  | 'supplemental'
  | 'completing'; // <-- ADDED: A transient status for animation orchestration.

// ... rest of the types
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
  completionStatus?: string;
  notes?: string;
  specialClassification?: SpecialClassification;
}