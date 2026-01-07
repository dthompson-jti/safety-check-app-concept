import { useState, useRef, useCallback, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { supervisorNoteModalAtom, isDetailPanelOpenAtom, PanelData, panelWidthAtom } from '../atoms';
import { StatusBadge, StatusBadgeType } from './StatusBadge';
import styles from './DetailPanel.module.css';

interface DetailPanelProps {
    record: PanelData | null;
    selectedCount?: number;
}

export const DetailPanel = ({ record, selectedCount = 0 }: DetailPanelProps) => {
    // Selection state to trigger "select single" or "empty" messages
    const setPanelOpen = useSetAtom(isDetailPanelOpenAtom);
    const setModalState = useSetAtom(supervisorNoteModalAtom);

    // Resize state - use global atom so App.tsx grid can react
    const [panelWidth, setPanelWidth] = useAtom(panelWidthAtom);
    const [isResizing, setIsResizing] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const handleClose = () => setPanelOpen(false);

    const handleOpenNoteModal = () => {
        if (!record) return;
        setModalState({
            isOpen: true,
            selectedIds: [record.id],
        });
    };

    const formatTime = (iso: string | null) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Resize handlers
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;
        const newWidth = window.innerWidth - e.clientX;
        // Constrain width between min and max
        const clampedWidth = Math.max(320, Math.min(600, newWidth));
        setPanelWidth(clampedWidth);
    }, [isResizing]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
    }, []);

    // Add/remove global listeners for resize
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        }
        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleResizeMove, handleResizeEnd]);

    const panelVariants = {
        closed: { x: '100%' },
        open: { x: 0 },
    };

    const transition = {
        type: 'tween' as const,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        duration: 0.3,
    };

    return (
        <motion.div
            ref={panelRef}
            className={styles.panel}
            style={{ '--panel-width': `${panelWidth}px` } as React.CSSProperties}
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
            transition={transition}
        >
            {/* Resize Handle */}
            <div
                className={`${styles.resizeHandle} ${isResizing ? styles.active : ''}`}
                onMouseDown={handleResizeStart}
            />
            {/* Header: Identity & Primary Status */}
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.titleGroup}>
                        {record ? (
                            <>
                                <h3 className={styles.residentName}>{record.residentName}</h3>
                                <div className={styles.locationPill}>
                                    <span className="material-symbols-rounded" style={{ fontSize: 16 }}>door_front</span>
                                    {record.location}
                                </div>
                            </>
                        ) : (
                            <h3 className={styles.residentName}>Flight Log</h3>
                        )}
                    </div>
                    <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>
                {record && (
                    <div className={styles.tags}>
                        <StatusBadge status={record.status as StatusBadgeType} />
                        {record.reviewStatus === 'verified' && (
                            <span className={`${styles.tag} ${styles.verified}`}>
                                Verified
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.content}>
                {!record ? (
                    <div className={styles.emptyState}>
                        <span className="material-symbols-rounded" style={{ fontSize: 48, color: 'var(--surface-fg-tertiary)' }}>
                            {selectedCount > 1 ? 'rule' : 'info'}
                        </span>
                        <h4 className={styles.emptyTitle}>
                            {selectedCount > 1 ? 'Multiple Records Selected' : 'No Record Selected'}
                        </h4>
                        <p className={styles.emptyText}>
                            {selectedCount > 1
                                ? 'Select a single record to view its complete check history and flight log.'
                                : 'Select a row from the monitor to view detailed check logs and officer notes.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* SECTION 1: METRICS GRID ("The Dashboard") */}
                        <div className={styles.section}>
                            <span className={styles.sectionTitle}>Operational Data</span>
                            <div className={styles.metricsGrid}>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricLabel}>Scheduled</span>
                                    <span className={styles.metricValue}>{formatTime(record.timeScheduled)}</span>
                                </div>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricLabel}>Actual</span>
                                    <span className={styles.metricValue}>{formatTime(record.timeActual)}</span>
                                </div>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricLabel}>Variance</span>
                                    <span className={`${styles.metricValue} ${record.varianceMinutes && record.varianceMinutes > 2 ? styles.late : ''}`}>
                                        {record.varianceMinutes !== undefined ? (
                                            isFinite(record.varianceMinutes) ? `${record.varianceMinutes > 0 ? '+' : ''}${record.varianceMinutes}m` : 'Missed'
                                        ) : 'N/A'}
                                    </span>
                                </div>
                                <div className={styles.metricCard}>
                                    <span className={styles.metricLabel}>Officer</span>
                                    <span className={styles.metricValue}>{record.officerName}</span>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: OFFICER NOTES ("The Log") */}
                        <div className={styles.section}>
                            <span className={styles.sectionTitle}>Field Notes</span>
                            <div className={styles.quoteBlock}>
                                {record.officerNote ? (
                                    <>
                                        <p className={styles.quoteContent}>“{record.officerNote}”</p>
                                        <div className={styles.quoteSignature}>
                                            <span className="material-symbols-rounded" style={{ fontSize: 14 }}>edit_note</span>
                                            {record.officerName}
                                        </div>
                                    </>
                                ) : (
                                    <span className={styles.emptyNote}>No field notes recorded.</span>
                                )}
                            </div>
                        </div>

                        {/* SECTION 3: SUPERVISOR REVIEW */}
                        <div className={styles.section}>
                            <span className={styles.sectionTitle}>Supervisor Review</span>
                            <div className={styles.supervisorBlock}>
                                {record.supervisorNote ? (
                                    <div className={styles.quoteBlock} style={{ background: 'transparent', padding: 0, border: 'none' }}>
                                        <p className={styles.quoteContent}>{record.supervisorNote}</p>
                                        <div className={styles.tags} style={{ marginTop: 8 }}>
                                            {record.reviewStatus === 'verified' && (
                                                <span className={`${styles.tag} ${styles.verified}`}>
                                                    <span className="material-symbols-rounded" style={{ fontSize: 12, marginRight: 4 }}>check_circle</span>
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <span className={styles.emptyNote}>No supervisor comments.</span>
                                )}

                                <button className={styles.actionButton} onClick={handleOpenNoteModal} style={{ marginTop: 8 }}>
                                    <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
                                        {record.supervisorNote ? 'edit' : 'add_comment'}
                                    </span>
                                    {record.supervisorNote ? 'Edit Note' : 'Add Note'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};
