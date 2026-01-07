// src/desktop/components/DataTable.tsx

import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    RowSelectionState,
    ColumnSizingState,
    ColumnPinningState,
} from '@tanstack/react-table';
import { useState, useEffect, useRef } from 'react';
import styles from './DataTable.module.css';

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T, unknown>[];
    enableRowSelection?: boolean;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: (selection: RowSelectionState) => void;
    getRowId?: (row: T) => string;
    totalCount?: number;
    isLoading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    onRowClick?: (row: T, event: React.MouseEvent) => void;
}

export function DataTable<T>({
    data,
    columns,
    enableRowSelection = false,
    rowSelection = {},
    onRowSelectionChange,
    getRowId,
    totalCount,
    isLoading = false,
    hasMore = false,
    onLoadMore,
    onRowClick,
}: DataTableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
    const [columnPinning] = useState<ColumnPinningState>({
        left: ['select'],
        right: ['actions'],
    });

    // Auto-Fit Logic
    const handleAutoFit = (columnId: string) => {
        const column = table.getColumn(columnId);
        if (!column) return;

        // Create temporary canvas for measurement
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        context.font = '500 14px Inter, sans-serif'; // Match .th/.td font

        let maxWidth = 0;

        // Measure Header
        const headerText = typeof column.columnDef.header === 'string'
            ? column.columnDef.header
            : ''; // Complex headers might need manual adjustment, strict AutoFit is best for data

        if (headerText) {
            maxWidth = Math.max(maxWidth, context.measureText(headerText).width);
        }

        // Measure Visible Rows
        const rows = table.getRowModel().rows;
        rows.forEach(row => {
            const cellValue = row.getValue(columnId);
            const text = String((cellValue as string | number | null | undefined) ?? '');
            const width = context.measureText(text).width;
            maxWidth = Math.max(maxWidth, width);
        });

        // Add Padding (approx 16px left + 16px right + 1px border + safety buffer)
        // Previous value 44 was insufficient for Badges? Let's try 56 to be safe.
        // Actually, the issue might be that badged text (like Status) isn't text-only measureable.
        // But for text columns, 44 should be fine. If status is clipping, it's because badges have padding.
        // Let's bump to 60.
        const padding = 60;
        const targetWidth = maxWidth + padding;

        // Clamp to min/max
        const minSize = column.columnDef.minSize || 0;
        const maxSize = column.columnDef.maxSize || 1000;
        const finalWidth = Math.max(minSize, Math.min(targetWidth, maxSize));

        setColumnSizing(old => ({
            ...old,
            [columnId]: finalWidth
        }));
    };


    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            rowSelection,
            columnSizing,
            columnPinning,
        },
        onSortingChange: setSorting,
        onColumnSizingChange: setColumnSizing,
        columnResizeMode: 'onChange',
        onRowSelectionChange: onRowSelectionChange as (updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection,
        enableColumnResizing: true,
        getRowId,
    });

    const sentinelRef = useRef<HTMLTableRowElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    // Initial Width Distribution Logic
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        if (hasInitializedRef.current || !scrollAreaRef.current) return;

        const container = scrollAreaRef.current;
        const observer = new ResizeObserver((entries) => {
            if (hasInitializedRef.current) return;

            const entry = entries[0];
            if (!entry) return;

            const containerWidth = entry.contentRect.width;
            if (containerWidth <= 0) return;

            // Calculate total default width
            const currentTotalWidth = table.getPageCount() > 0 ? table.getTotalSize() : 0;

            // If we have data and the table is smaller than container, distribute space
            if (currentTotalWidth > 0 && currentTotalWidth < containerWidth) {
                const excess = containerWidth - currentTotalWidth;

                // Columns to grow: Resident (Primary), Notes (Secondary), Officer (Tertiary)
                const growableColumns = {
                    'resident': 3,
                    'notes': 2,
                    'officer': 1
                };

                const totalShares = Object.entries(growableColumns).reduce((sum, [id, share]) => {
                    return table.getColumn(id)?.getIsVisible() ? sum + share : sum;
                }, 0);

                if (totalShares > 0) {
                    const newSizing = { ...columnSizing };
                    const pixelPerShare = excess / totalShares;

                    Object.entries(growableColumns).forEach(([id, share]) => {
                        const column = table.getColumn(id);
                        if (column && column.getIsVisible()) {
                            const currentSize = column.getSize();
                            newSizing[id] = Math.floor(currentSize + (pixelPerShare * share));
                        }
                    });

                    setColumnSizing(newSizing);
                }
            }

            hasInitializedRef.current = true;
            // We disconnect this specific observer after one success
            observer.disconnect();
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, [table, columnSizing]); // Dependencies need to include table to access columns

    // Load More Observer
    useEffect(() => {
        if (!onLoadMore || !hasMore) return;

        const sentinel = sentinelRef.current;
        const scrollArea = scrollAreaRef.current;
        if (!sentinel || !scrollArea) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            },
            {
                root: scrollArea,
                rootMargin: '0px',
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [onLoadMore, hasMore]);


    return (
        <div className={styles.tableContainer}>
            <div ref={scrollAreaRef} className={styles.scrollArea}>
                <table
                    className={styles.table}
                    style={{
                        width: table.getTotalSize(),
                    }}
                >
                    <thead className={styles.thead}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const isPinned = header.column.getIsPinned();
                                    const isSpacer = header.column.id === 'spacer';

                                    // Compute left offset for left-pinned columns
                                    let leftOffset = 0;
                                    if (isPinned === 'left') {
                                        const leftPinnedHeaders = headerGroup.headers.filter(
                                            h => h.column.getIsPinned() === 'left'
                                        );
                                        for (const h of leftPinnedHeaders) {
                                            if (h.id === header.id) break;
                                            leftOffset += h.getSize();
                                        }
                                    }

                                    const pinnedClass = isPinned === 'left'
                                        ? styles.stickyColumnLeft
                                        : isPinned === 'right'
                                            ? styles.stickyColumn
                                            : '';

                                    return (
                                        <th
                                            key={header.id}
                                            className={`${styles.th} ${pinnedClass}`}
                                            colSpan={header.colSpan}
                                            onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                            style={{
                                                width: isSpacer ? 'auto' : header.getSize(),
                                                padding: isSpacer ? 0 : undefined,
                                                position: isPinned ? 'sticky' : undefined,
                                                right: isPinned === 'right' ? 0 : undefined,
                                                left: isPinned === 'left' ? leftOffset : undefined,
                                            }}
                                            data-pinned={isPinned || undefined}
                                            data-sortable={header.column.getCanSort()}
                                            data-sort-direction={header.column.getIsSorted() as string}
                                        >
                                            <div
                                                className={styles.thContent}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <span className={`material-symbols-rounded ${styles.sortIndicator}`}>
                                                        arrow_downward
                                                    </span>
                                                )}
                                            </div>
                                            {header.column.getCanResize() && !isSpacer && (
                                                <div
                                                    onDoubleClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAutoFit(header.column.id);
                                                    }}
                                                    onMouseDown={header.getResizeHandler()}
                                                    onTouchStart={header.getResizeHandler()}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`${styles.resizer} ${header.column.getIsResizing() ? styles.isResizing : ''
                                                        }`}
                                                />
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className={styles.tbody}>
                        {/* Skeleton Loading State */}
                        {isLoading && data.length === 0 && Array.from({ length: 15 }).map((_, idx) => (
                            <tr key={`skeleton-${idx}`} className={styles.skeletonRow}>
                                {table.getVisibleFlatColumns().map((column, colIndex) => {
                                    const isPinned = column.getIsPinned();
                                    const isSpacer = column.id === 'spacer';

                                    // Compute left offset for left-pinned columns
                                    let leftOffset = 0;
                                    if (isPinned === 'left') {
                                        const allCols = table.getVisibleFlatColumns();
                                        for (let i = 0; i < colIndex; i++) {
                                            if (allCols[i].getIsPinned() === 'left') {
                                                leftOffset += allCols[i].getSize();
                                            }
                                        }
                                    }

                                    const pinnedClass = isPinned === 'left'
                                        ? styles.stickyColumnLeft
                                        : isPinned === 'right'
                                            ? styles.stickyColumn
                                            : '';

                                    return (
                                        <td
                                            key={column.id}
                                            className={`${styles.td} ${pinnedClass}`}
                                            style={{
                                                width: isSpacer ? 'auto' : column.getSize(),
                                                position: isPinned ? 'sticky' : undefined,
                                                right: isPinned === 'right' ? 0 : undefined,
                                                left: isPinned === 'left' ? leftOffset : undefined,
                                                padding: isSpacer ? 0 : undefined,
                                            }}
                                            data-pinned={isPinned || undefined}
                                        >
                                            {!isSpacer && (
                                                <div
                                                    className={
                                                        column.id === 'select'
                                                            ? styles.skeletonCheckbox
                                                            : column.id === 'actions'
                                                                ? styles.skeletonAction
                                                                : styles.skeletonCell
                                                    }
                                                />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}

                        {/* Actual Data */}
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className={styles.tr}
                                data-state={row.getIsSelected() ? 'checked' : 'unchecked'}
                                onClick={(e) => onRowClick?.(row.original, e)}
                            >
                                {row.getVisibleCells().map((cell, cellIndex) => {
                                    const isPinned = cell.column.getIsPinned();
                                    const isSpacer = cell.column.id === 'spacer';

                                    // Compute left offset for left-pinned columns
                                    let leftOffset = 0;
                                    if (isPinned === 'left') {
                                        const allCells = row.getVisibleCells();
                                        for (let i = 0; i < cellIndex; i++) {
                                            if (allCells[i].column.getIsPinned() === 'left') {
                                                leftOffset += allCells[i].column.getSize();
                                            }
                                        }
                                    }

                                    const pinnedClass = isPinned === 'left'
                                        ? styles.stickyColumnLeft
                                        : isPinned === 'right'
                                            ? styles.stickyColumn
                                            : '';

                                    return (
                                        <td
                                            key={cell.id}
                                            className={`${styles.td} ${pinnedClass}`}
                                            style={{
                                                width: isSpacer ? 'auto' : cell.column.getSize(),
                                                padding: isSpacer ? 0 : undefined,
                                                position: isPinned ? 'sticky' : undefined,
                                                right: isPinned === 'right' ? 0 : undefined,
                                                left: isPinned === 'left' ? leftOffset : undefined,
                                            }}
                                            data-pinned={isPinned || undefined}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {hasMore && (
                            <tr ref={sentinelRef} className={styles.skeletonRow}>
                                {table.getVisibleFlatColumns().map((column, colIndex) => {
                                    const isPinned = column.getIsPinned();
                                    const isSpacer = column.id === 'spacer';

                                    // Compute left offset for left-pinned columns
                                    let leftOffset = 0;
                                    if (isPinned === 'left') {
                                        const allCols = table.getVisibleFlatColumns();
                                        for (let i = 0; i < colIndex; i++) {
                                            if (allCols[i].getIsPinned() === 'left') {
                                                leftOffset += allCols[i].getSize();
                                            }
                                        }
                                    }

                                    const pinnedClass = isPinned === 'left'
                                        ? styles.stickyColumnLeft
                                        : isPinned === 'right'
                                            ? styles.stickyColumn
                                            : '';

                                    return (
                                        <td
                                            key={`sentinel-${column.id}`}
                                            className={`${styles.td} ${pinnedClass}`}
                                            style={{
                                                width: isSpacer ? 'auto' : column.getSize(),
                                                position: isPinned ? 'sticky' : undefined,
                                                right: isPinned === 'right' ? 0 : undefined,
                                                left: isPinned === 'left' ? leftOffset : undefined,
                                                padding: isSpacer ? 0 : undefined,
                                            }}
                                        >
                                            {!isSpacer && (
                                                <div
                                                    className={
                                                        column.id === 'select'
                                                            ? styles.skeletonCheckbox
                                                            : column.id === 'actions'
                                                                ? styles.skeletonAction
                                                                : styles.skeletonCell
                                                    }
                                                />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        )}
                    </tbody>
                </table>
                {table.getRowModel().rows.length === 0 && !isLoading && data.length === 0 && (
                    <div className={styles.emptyState}>
                        <span className={`material-symbols-rounded ${styles.emptyIcon}`}>
                            inbox
                        </span>
                        <p>No data to display</p>
                    </div>
                )}
            </div>

            {/* Table Footer */}
            <div className={styles.tableFooter}>
                <div className={styles.footerLeft}>
                    {/* If fetching, show just text. If done, show count. */}
                    {isLoading ? (
                        <div className={styles.loadingIndicator}>
                            <span className={`material-symbols-rounded ${styles.loadingSpinner}`}>
                                progress_activity
                            </span>
                            <span>Loading records...</span>
                        </div>
                    ) : (
                        <div className={styles.footerCount}>
                            {data.length.toLocaleString()} of {(totalCount ?? data.length).toLocaleString()} records
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
