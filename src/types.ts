// src/types.ts

// =================================================================
//                 TYPES FROM ORIGINAL PROJECT
// =================================================================

export interface BoundData {
  nodeId: string;
  nodeName: string;
  fieldId: string;
  fieldName: string;
  path: string;
}

export interface AppearanceProperties {
  type: 'transparent' | 'primary' | 'secondary' | 'tertiary' | 'info' | 'warning' | 'error';
  bordered: boolean;
  padding: 'none' | 'sm' | 'md' | 'lg';
}

interface BaseComponent {
  id: string;
  parentId: string;
}

export interface LayoutComponent extends BaseComponent {
  componentType: 'layout';
  name: string;
  children: string[];
  properties: {
    arrangement: 'stack' | 'grid';
    gap: 'none' | 'sm' | 'md' | 'lg';
    distribution: 'start' | 'center' | 'end' | 'space-between';
    verticalAlign: 'start' | 'center' | 'end' | 'stretch';
    columnLayout: string;
    appearance: AppearanceProperties;
  };
}

export interface FormComponent extends BaseComponent {
  componentType: 'widget' | 'field';
  origin?: 'data' | 'general';
  binding: BoundData | null;
  properties: {
    label: string;
    content?: string;
    fieldName: string;
    required: boolean;
    placeholder?: string;
    controlType: 'text-input' | 'dropdown' | 'radio-buttons' | 'plain-text' | 'link' | 'checkbox';
    href?: string;
    target?: '_self' | '_blank';
  };
}

export type CanvasComponent = LayoutComponent | FormComponent;

export interface DraggableComponent {
  id: string;
  name: string;
  type: string;
  icon: string;
  iconColor?: string;
  nodeId?: string;
  nodeName?: string;
  path?: string;
}

export interface ComponentGroup {
  title: string;
  components: DraggableComponent[];
}

export interface ComponentNode {
  id: string;
  name: string;
  connections: number;
}

export interface DropdownItem {
  id: string;
  name: string;
  icon: string;
  iconColor?: string;
}

// =================================================================
//              NEW TYPES FOR SAFETY CHECK FEATURE
// =================================================================

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
export type SafetyCheckStatus = 'overdue' | 'due-soon' | 'upcoming' | 'complete';

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