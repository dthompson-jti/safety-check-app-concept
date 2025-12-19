// src/desktop/components/LiveMonitorView.tsx

import { useMemo, useCallback, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { desktopFilterAtom } from '../atoms';
import { LiveCheckRow } from '../types';
import { mockLiveChecks } from '../mockLiveData';
import { DataTable } from './DataTable';
import { BulkActionFooter } from './BulkActionFooter';
import { addToastAtom } from '../../data/toastAtoms';
import styles from './DataTable.module.css';

export const LiveMonitorView = () => {
    const filter = useAtomValue(desktopFilterAtom);
    const addToast = useSetAtom(addToastAtom);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    // Filter and sort mock data
    const liveRows = useMemo(() => {
        let rows = [...mockLiveChecks];

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

        // Apply unit filter (mock data uses room numbers like "101", "102")
        // For demo purposes, we'll keep all data visible unless specific unit filter

        // Sort by urgency, then by risk level (high risk first within same urgency)
        rows.sort((a, b) => {
            const statusOrder: Record<'missed' | 'due' | 'pending', number> = { missed: 0, due: 1, pending: 2 };
            const statusDiff = statusOrder[a.status] - statusOrder[b.status];
            if (statusDiff !== 0) return statusDiff;
            // High risk residents bubble to top
            if (a.hasHighRisk && !b.hasHighRisk) return -1;
            if (!a.hasHighRisk && b.hasHighRisk) return 1;
            return 0;
        });

        return rows;
    }, [filter.search]);

    // Convert Set to TanStack's RowSelectionState
    const rowSelection: RowSelectionState = useMemo(() => {
        const selection: RowSelectionState = {};
        selectedRows.forEach((id) => {
            selection[id] = true;
        });
        return selection;
    }, [selectedRows]);

    const handleRowSelectionChange = useCallback(
        (updaterOrValue: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
            const newSelection = typeof updaterOrValue === 'function'
                ? updaterOrValue(rowSelection)
                : updaterOrValue;
            const newSet = new Set(Object.keys(newSelection).filter((k) => newSelection[k]));
            setSelectedRows(newSet);
        },
        [rowSelection]
    );

    const handleAlert = useCallback((row: LiveCheckRow) => {
        addToast({
            message: `Alert dispatched for ${row.location}`,
            icon: 'notifications_active',
            variant: 'info',
        });
    }, [addToast]);

    const handleBulkComment = () => {
        addToast({
            message: `Comment added for ${selectedRows.size} checks`,
            icon: 'check_circle',
            variant: 'success',
        });
        setSelectedRows(new Set());
    };

    const columns: ColumnDef<LiveCheckRow>[] = useMemo(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <div
                        className={styles.checkbox}
                        onClick={table.getToggleAllRowsSelectedHandler()}
                        data-state={table.getIsAllRowsSelected() ? 'checked' : 'unchecked'}
                    >
                        {table.getIsAllRowsSelected() && (
                            <span className="material-symbols-rounded">check</span>
                        )}
                    </div>
                ),
                cell: ({ row }) => (
                    <div
                        className={styles.checkbox}
                        onClick={row.getToggleSelectedHandler()}
                        data-state={row.getIsSelected() ? 'checked' : 'unchecked'}
                    >
                        {row.getIsSelected() && (
                            <span className="material-symbols-rounded">check</span>
                        )}
                    </div>
                ),
                size: 48,
            },
            {
                id: 'resident',
                header: 'Resident',
                cell: ({ row }) => (
                    <div className={styles.residentCell}>
                        {row.original.hasHighRisk && (
                            <span
                                className={styles.riskIcon}
                                title={row.original.riskType || 'High Risk'}
                            >
                                ⚠️
                            </span>
                        )}
                        <span>{row.original.residents.map((r) => r.name).join(', ')}</span>
                    </div>
                ),
            },
            {
                id: 'location',
                header: 'Room',
                accessorKey: 'location',
                size: 80,
            },
            {
                id: 'scheduled',
                header: 'Scheduled',
                size: 140,
                cell: () => {
                    // Mock scheduled time
                    const now = new Date();
                    return now.toLocaleString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                    });
                },
            },
            {
                id: 'actual',
                header: 'Actual',
                size: 100,
                cell: ({ row }) => {
                    if (row.original.status === 'missed') return 'No check';
                    return row.original.timerText;
                },
            },
            {
                id: 'status',
                header: 'Status',
                size: 100,
                cell: ({ row }) => {
                    const statusLabels = {
                        missed: 'Missed',
                        due: 'Due',
                        pending: 'Upcoming',
                    };
                    return (
                        <span className={`${styles.statusLozenge} ${styles[row.original.status]}`}>
                            {statusLabels[row.original.status]}
                        </span>
                    );
                },
            },
            {
                id: 'checkedBy',
                header: 'Checked by',
                size: 120,
                cell: ({ row }) => row.original.lastCheckOfficer || 'Brett Corbin',
            },
            {
                id: 'comments',
                header: 'Supervisor Comments',
                size: 160,
                cell: () => (
                    <button className={styles.linkAction}>+</button>
                ),
            },
            {
                id: 'actions',
                header: '',
                size: 40,
                cell: ({ row }) => (
                    <button
                        className={styles.iconButtonSmall}
                        onClick={() => handleAlert(row.original)}
                        aria-label="More options"
                    >
                        <span className="material-symbols-rounded">more_vert</span>
                    </button>
                ),
            },
        ],
        [handleAlert]
    );

    return (
        <>
            <DataTable
                data={liveRows}
                columns={columns}
                enableRowSelection
                rowSelection={rowSelection}
                onRowSelectionChange={handleRowSelectionChange}
                getRowId={(row) => row.id}
            />

            {selectedRows.size > 0 && (
                <BulkActionFooter
                    selectedCount={selectedRows.size}
                    onAction={handleBulkComment}
                    onClear={() => setSelectedRows(new Set())}
                    actionLabel="Comment"
                />
            )}
        </>
    );
};
