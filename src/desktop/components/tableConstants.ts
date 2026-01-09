/**
 * Standard column layout constants for Desktop Data Tables.
 * These ensure consistent widths, min-widths, and resize behavior across views.
 * 
 * Usage:
 * const columns = [
 *   {
 *     id: 'select',
 *     ...COLUMN_WIDTHS.CHECKBOX
 *   },
 *   {
 *     id: 'resident',
 *     ...COLUMN_WIDTHS.RESIDENT
 *   }
 * ]
 */

export const COLUMN_WIDTHS = {
    // Utility Columns
    CHECKBOX: {
        size: 44,
        minSize: 44,
        maxSize: 44,
        enableResizing: false,
    },
    ACTIONS: {
        size: 48,
        minSize: 48,
        maxSize: 48,
        enableResizing: false,
    },

    // Content Columns
    STATUS: {
        size: 130,
        minSize: 130, // Fits "Upcoming" badge comfortably
    },
    TIMESTAMP: {
        size: 180,
        minSize: 160, // Fits merged "MM/DD/YYYY  HH:MM AM/PM" comfortably
    },
    RESIDENT: {
        size: 250,
        minSize: 200, // Names need space
    },
    LOCATION: {
        size: 90,
        minSize: 70,
    },
    VARIANCE: {
        size: 120,
        minSize: 100,
    },
    OFFICER: {
        size: 130,
        minSize: 100,
    },
    NOTES: {
        size: 200,
        minSize: 150,
    },
    GROUP: {
        size: 100,
        minSize: 80,
    },
    UNIT: {
        size: 80,
        minSize: 60,
    },
    ALERT_ICON: {
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
    },
} as const;
