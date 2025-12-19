// src/desktop/components/LiveMonitorView.tsx

import { useMemo, useCallback, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { desktopFilterAtom } from '../atoms';
import { LiveCheckRow } from '../types';
import { mockLiveChecks } from '../mockLiveData';
import { DataTable } from './DataTable';
import { BulkActionFooter } from './BulkActionFooter';
import { RowContextMenu } from './RowContextMenu';
import { StatusBadge, StatusBadgeType } from './StatusBadge';
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
                    />
                ),
                cell: ({ row }) => (
                    <div
                        className={styles.checkbox}
                        onClick={row.getToggleSelectedHandler()}
                        data-state={row.getIsSelected() ? 'checked' : 'unchecked'}
                    />
                ),
                size: 48,
            },
            {
                id: 'resident',
                header: 'Resident',
                size: 240, // Name can be long
                accessorFn: (row) => row.residents.map((r) => r.name).join(', '),
                cell: ({ row }) => (
                    <div className={styles.residentCell}>
                        {row.original.hasHighRisk && (
                            <span
                                className={`material-symbols-rounded ${styles.specialStatusIcon}`}
                                title={row.original.riskType || 'Special Status'}
                            >
                                warning
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
                size: 100,
            },
            {
                id: 'scheduled',
                header: 'Scheduled',
                size: 140,
                accessorFn: () => {
                    // Constant date for mock sorting/display
                    return new Date().toISOString();
                },
                cell: () => {
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
                accessorFn: (row) => row.timerText,
                cell: ({ row }) => {
                    if (row.original.status === 'missed') return 'No check';
                    return row.original.timerText;
                },
            },
            {
                id: 'status',
                header: 'Status',
                size: 100,
                accessorKey: 'status',
                cell: ({ row }) => {
                    return (
                        <StatusBadge status={row.original.status as StatusBadgeType} />
                    );
                },
            },
            {
                id: 'checkedBy',
                header: 'Checked by',
                size: 140,
                accessorFn: (row) => row.lastCheckOfficer || '—',
            },
            {
                id: 'comments',
                header: 'Supervisor Comments',
                size: 250,
                accessorFn: (row) => row.supervisorNote || '',
                cell: ({ row }) => (
                    <div className={styles.commentsCell}>
                        {row.original.supervisorNote ? (
                            <span className={styles.supervisorComment}>
                                {row.original.supervisorNote}
                            </span>
                        ) : (
                            <button className={styles.linkAction}>+</button>
                        )}
                    </div>
                ),
            },
            {
                id: 'actions',
                header: '',
                size: 48,
                enableSorting: false,
                cell: ({ row }) => (
                    <RowContextMenu
                        onAddNote={() => handleAlert(row.original)}
                        isVerified={false}
                    />
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
