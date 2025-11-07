// src/types.ts
export interface Resident {
  id: string;
  name: string;
  location: string;
}

export type SafetyCheckStatus = 'late' | 'due-soon' | 'pending' | 'complete' | 'missed' | 'supplemental';

export interface SafetyCheck {
  id: string;
  residents: Resident[]; // MODIFIED: Changed from a single resident to an array
  status: SafetyCheckStatus;
  dueDate: string;
  walkingOrderIndex: number;
  lastChecked?: string;
  // NOTE: Storing the multi-resident outcome as a single string for prototype simplicity.
  completionStatus?: string;
  notes?: string;
  specialClassification?: {
    type: string;
    details: string;
  };
}