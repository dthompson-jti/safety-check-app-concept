// src/types.ts

export type SafetyCheckStatus =
  | 'early'      // 0-13m (internal, shows "Upcoming" in UI)
  | 'pending'    // 0-13m (internal, shows "Upcoming" in UI)
  | 'due'        // 13-15m (warning/yellow)
  | 'missed'     // 15m+ (alert/red)
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
  baseInterval: number; // Minutes between checks (e.g., 15)
}

export type ScheduleFilter = 'all' | 'due' | 'missed' | 'queued';

export type HistoryFilter = 'all' | 'missed' | 'supplemental';

// =================================================================
//                     NFC Scan Activation Types
// =================================================================

/** State machine states for NFC scanning and feedback */
export type NfcScanState =
  | 'idle'
  | 'scanning'
  | 'success'
  | 'formComplete'
  | 'readError'
  | 'timeout'
  | 'blocked'
  | 'hardwareOff';
