// src/types.ts
export interface Resident {
  id: string;
  name: string;
  location: string;
}

export type SafetyCheckStatus = 'late' | 'due-soon' | 'pending' | 'complete' | 'missed' | 'supplemental';

export interface SafetyCheck {
  id: string;
  residents: Resident[];
  status: SafetyCheckStatus;
  dueDate: string;
  walkingOrderIndex: number;
  lastChecked?: string;
  completionStatus?: string;
  notes?: string;
  specialClassification?: {
    type: string;
    details: string;
    // DEFINITIVE FIX: Add residentId to pinpoint which resident the classification applies to.
    residentId: string; 
  };
}