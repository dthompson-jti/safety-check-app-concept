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

// Example type for a Safety Check item
export interface SafetyCheck {
  id: string;
  resident: Resident;
  status: 'pending' | 'in-progress' | 'complete' | 'failed';
  checkTime: string; // e.g., "10:00 PM"
}