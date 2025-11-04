// src/types.ts

// A simplified, generic type for list items.
// Can be expanded as the PWA's data model is defined.
export interface ListItem {
  id: string;
  title: string;
  description?: string;
}

// Example type for a Safety Check item
export interface SafetyCheck {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'complete' | 'failed';
  lastChecked: Date;
}