// src/desktop/atoms.ts

import { atom } from 'jotai';
import { DesktopView, DesktopFilter, HistoricalCheck } from './types';
import { historicalChecks } from './mockHistoricalData';
// We'll need access to live data for the polymorphic resolver. 
// Ideally this should be exported from real stores, but for now we might need to rely on the view pushing data or a shared store.
// To keep it simple and clean: The View will push the *full object* to the panel atom when clicked.
// This avoids complex lookups in mock data.

/** Current desktop view: 'live' or 'historical' */
export const desktopViewAtom = atom<DesktopView>('live');

/** Desktop filter state */
export const desktopFilterAtom = atom<DesktopFilter>({
    facility: 'all',
    unit: 'all',
    search: '',
    showMissedOnly: false,
    statusFilter: 'all',
    dateStart: null,
    dateEnd: null,
});

/** Selected row IDs for bulk actions (Historical view) */
export const selectedHistoryRowsAtom = atom<Set<string>>(new Set<string>());

/** Selected row IDs for live monitor */
export const selectedLiveRowsAtom = atom<Set<string>>(new Set<string>());

/** Historical checks data (mock) */
export const historicalChecksAtom = atom<HistoricalCheck[]>(historicalChecks);

/** Derived: filtered historical checks */
export const filteredHistoricalChecksAtom = atom((get) => {
    const checks = get(historicalChecksAtom);
    const filter = get(desktopFilterAtom);

    return checks.filter((check) => {
        // Search filter
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            const matchesResident = check.residents.some((r) =>
                r.name.toLowerCase().includes(searchLower)
            );
            const matchesLocation = check.location.toLowerCase().includes(searchLower);
            if (!matchesResident && !matchesLocation) return false;
        }

        // Unit filter - extract unit letter from location (e.g., "A-101" → "A")
        if (filter.unit !== 'all') {
            const unitFromLocation = check.location.split('-')[0];
            if (unitFromLocation !== filter.unit) return false;
        }

        // Status filter
        if (filter.statusFilter === 'missed' && check.status !== 'missed') {
            return false;
        }
        if (filter.statusFilter === 'late' && check.status !== 'late') {
            return false;
        }

        // Date Range Filter
        if (filter.dateStart || filter.dateEnd) {
            const checkDate = check.scheduledTime.split('T')[0]; // Extract YYYY-MM-DD
            if (filter.dateStart && checkDate < filter.dateStart) return false;
            if (filter.dateEnd && checkDate > filter.dateEnd) return false;
        }

        return true;
    });
});

/** Supervisor note modal state */
export const supervisorNoteModalAtom = atom<{
    isOpen: boolean;
    selectedIds: string[];
}>({
    isOpen: false,
    selectedIds: [],
});

// ============================================================================
// INFO PANEL STATE (UNIFIED)
// ============================================================================

/**
 * The normalized data shape for the Detail Panel.
 * Adapts both LiveCheckRow and HistoricalCheck into a single interface.
 */
export interface PanelData {
    id: string;
    source: 'live' | 'historical';
    residentName: string;
    location: string;
    status: 'missed' | 'due' | 'pending' | 'done' | 'late' | 'completing' | 'complete' | 'queued';
    timeScheduled: string;
    timeActual: string | null;
    varianceMinutes?: number;
    officerName: string;
    officerNote?: string;
    supervisorNote?: string;
    reviewStatus?: 'pending' | 'verified';
    // Potential future fields
    riskType?: string;
    hasHighRisk?: boolean;
}

/** 
 * Holds the currently open record for the detail panel.
 * If null, panel is closed.
 */
export const activeDetailRecordAtom = atom<PanelData | null>(null);

/** Visibility state for the detail panel (independent of data) */
export const isDetailPanelOpenAtom = atom<boolean>(false);

/** Panel width for resize functionality (min: 320, max: 600) */
export const panelWidthAtom = atom<number>(400);

// ============================================================================
// AUTO-REFRESH STATE
// ============================================================================

/** Auto-refresh configuration */
export interface AutoRefreshState {
    isPaused: boolean;
    intervalSeconds: number;
    lastRefreshTime: number; // timestamp (ms)
}

export const autoRefreshAtom = atom<AutoRefreshState>({
    isPaused: false,
    intervalSeconds: 30,
    lastRefreshTime: Date.now(),
});

/** Derived: Time until next refresh (in seconds) */
export const nextRefreshSecondsAtom = atom((get) => {
    const { isPaused, intervalSeconds, lastRefreshTime } = get(autoRefreshAtom);

    if (isPaused) return null; // null = paused

    const elapsed = (Date.now() - lastRefreshTime) / 1000;
    const remaining = Math.max(0, intervalSeconds - elapsed);
    return Math.ceil(remaining);
});

// ============================================================================
// DESKTOP STATUS COUNTS
// ============================================================================

import { getLiveCounts } from './mockLiveData';
import { getHistoricalCounts } from './mockHistoricalData';

/** Desktop-specific counts for header tabs - now pulling from desktop mock data */
export const desktopTabCountsAtom = atom((get) => {
    const filter = get(desktopFilterAtom);

    const live = getLiveCounts({ search: filter.search });
    const history = getHistoricalCounts(filter);

    return {
        // Live View badges
        missed: live.missed,     // 🔔 red bell
        due: live.due,           // ⏰ amber clock

        // Historical View badge
        unreviewed: history.unreviewed, // 👤⚠ gray
    };
});
