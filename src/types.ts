// src/types.ts

// A simplified, generic type for list items.
// Can be expanded as the PWA's data model is defined.
export interface ListItem {
  id: string;
  title: string;
  description?: string;
}

// Type for a Resident
export interface Resident {
  id: string;
  name: string;
  location: string; // e.g., "Room 101"
}

// Expanded type for a Safety Check item
export type SafetyCheckStatus = 'pending' | 'complete' | 'late' | 'missed' | 'supplemental';

export interface SafetyCheck {
  id: string;
  resident: Resident;
  status: SafetyCheckStatus;
  dueDate: string; // ISO 8601 timestamp string
  walkingOrderIndex: number;
  specialClassification?: {
    type: 'SR'; // "Special Resident"
    details: string; // e.g., "Fall Risk"
  };
  // Fields for recording the outcome of a check
  lastChecked?: string; // ISO 8601 timestamp of completion
  notes?: string;
  completionStatus?: string; // e.g., 'Awake', 'Sleeping'
}