// src/desktop/components/LiveMonitorView.tsx

import { useMemo, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { ColumnDef } from '@tanstack/react-table';
import { timeSortedChecksAtom } from '../../data/appDataAtoms';
import { desktopFilterAtom } from '../atoms';
import { LiveCheckRow } from '../types';
import { SafetyCheck } from '../../types';
import { DataTable } from './DataTable';
import { addToastAtom } from '../../data/toastAtoms';
import styles from './DataTable.module.css';

/** Transform SafetyCheck to LiveCheckRow for display */
const transformToLiveRow = (check: SafetyCheck): LiveCheckRow => {
    const now = Date.now();
    const dueTime = new Date(check.dueDate).getTime();
    const intervalMs = check.baseInterval * 60 * 1000;
    const windowStartTime = dueTime - intervalMs;
    const elapsedMs = now - windowStartTime;
    const elapsedMinutes = Math.floor(elapsedMs / 60000);

    let status: 'missed' | 'due' | 'pending' = 'pending';
    let timerText = '';
    let timerSeverity: 'alert' | 'warning' | 'neutral' = 'neutral';

    if (check.status === 'missed' || elapsedMinutes >= 15) {
        status = 'missed';
        const overdueMinutes = elapsedMinutes - 15;
        timerText = `Overdue ${overdueMinutes}m`;
        timerSeverity = 'alert';
    } else if (check.status === 'due' || elapsedMinutes >= 13) {
        status = 'due';
        const dueInMinutes = 15 - elapsedMinutes;
        timerText = `Due in ${dueInMinutes}m`;
        timerSeverity = 'warning';
    } else {
        status = 'pending';
        timerText = `${15 - elapsedMinutes}m`;
        timerSeverity = 'neutral';
    }

    const hasHighRisk = check.specialClassifications && check.specialClassifications.length > 0;
    const riskType = hasHighRisk ? check.specialClassifications?.[0]?.type : undefined;

    return {
        id: check.id,
        status,
        timerText,
        timerSeverity,
        location: check.residents[0]?.location || 'Unknown',
        residents: check.residents,
        hasHighRisk: hasHighRisk || false,
        riskType,
        lastCheckTime: check.lastChecked || null,
        lastCheckOfficer: null, // Would come from check history in real app
        originalCheck: check,
    };
};

export const LiveMonitorView = () => {
    const checks = useAtomValue(timeSortedChecksAtom);
    const filter = useAtomValue(desktopFilterAtom);
    const addToast = useSetAtom(addToastAtom);

    // Transform and filter checks
    const liveRows = useMemo(() => {
        const actionableChecks = checks.filter(
            (c) => !['complete', 'completing', 'queued'].includes(c.status)
        );

        let rows = actionableChecks.map(transformToLiveRow);

        // Apply search filter
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            rows = rows.filter((row) => {
                const matchesResident = row.residents.some((r) =>
                    r.name.toLowerCase().includes(searchLower)
                );
                const matchesLocation = row.location.toLowerCase().includes(searchLower);
                return matchesResident || matchesLocation;
            });
        }

        // Sort by urgency
        rows.sort((a, b) => {
            const statusOrder = { missed: 0, due: 1, pending: 2 };
            return statusOrder[a.status] - statusOrder[b.status];
        });

        return rows;
    }, [checks, filter.search]);

    const handleAlert = useCallback((row: LiveCheckRow) => {
        addToast({
            message: `Alert dispatched for ${row.location}`,
            icon: 'notifications_active',
            variant: 'info',
        });
    }, [addToast]);

    const columns: ColumnDef<LiveCheckRow>[] = useMemo(
        () => [
            {
                id: 'status',
                header: 'Status',
                size: 60,
                cell: ({ row }) => (
                    <div className={`${styles.statusIcon} ${styles[row.original.status]}`}>
                        {row.original.status === 'missed' && '🔴'}
                        {row.original.status === 'due' && '🟠'}
                        {row.original.status === 'pending' && '⚪'}
                    </div>
                ),
            },
            {
                id: 'timer',
                header: 'Timer',
                size: 100,
                cell: ({ row }) => (
                    <span className={`${styles.timerCell} ${styles[row.original.timerSeverity]}`}>
                        {row.original.timerText}
                    </span>
                ),
            },
            {
                id: 'location',
                header: 'Location',
                accessorKey: 'location',
                size: 120,
            },
            {
                id: 'resident',
                header: 'Resident',
                cell: ({ row }) => (
                    <div className={styles.residentCell}>
                        <span>{row.original.residents.map((r) => r.name).join(', ')}</span>
                        {row.original.hasHighRisk && (
                            <span className={styles.riskIcon} title={row.original.riskType}>
                                ⚠️
                            </span>
                        )}
                    </div>
                ),
            },
            {
                id: 'lastCheck',
                header: 'Last Check',
                size: 160,
                cell: ({ row }) => {
                    if (!row.original.lastCheckTime) return '—';
                    const lastTime = new Date(row.original.lastCheckTime);
                    const minutesAgo = Math.floor((Date.now() - lastTime.getTime()) / 60000);
                    return `${minutesAgo}m ago`;
                },
            },
            {
                id: 'action',
                header: '',
                size: 80,
                cell: ({ row }) =>
                    row.original.status !== 'pending' && (
                        <button
                            className={styles.actionButton}
                            onClick={() => handleAlert(row.original)}
                        >
                            Alert
                        </button>
                    ),
            },
        ],
        [handleAlert]
    );

    return (
        <DataTable
            data={liveRows}
            columns={columns}
            getRowId={(row) => row.id}
        />
    );
};
