import { useCallback, useEffect, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    nfcScanStateAtom,
    nfcScanStartTimeAtom,
    appConfigAtom,
    workflowStateAtom,
    hardwareSimulationAtom,
    isDuplicateScanSheetOpenAtom,
    pendingDuplicateCheckAtom,
} from '../../data/atoms';
import { timeSortedChecksAtom } from '../../data/appDataAtoms';
import { useHaptics } from '../../data/useHaptics';
import { useCompleteCheck } from '../Workflow/useCompleteCheck';

/**
 * Hook for managing NFC scan state machine.
 */
export const useNfcScan = () => {
    const [scanState, setScanState] = useAtom(nfcScanStateAtom);
    const [scanStartTime, setScanStartTime] = useAtom(nfcScanStartTimeAtom);

    const appConfig = useAtomValue(appConfigAtom);
    const simulation = useAtomValue(hardwareSimulationAtom);
    const timeSortedChecks = useAtomValue(timeSortedChecksAtom);
    const workflowState = useAtomValue(workflowStateAtom);
    const setWorkflowState = useSetAtom(workflowStateAtom);
    const { trigger: triggerHaptic } = useHaptics();
    const { completeCheck } = useCompleteCheck();

    const setIsDuplicateSheetOpen = useSetAtom(isDuplicateScanSheetOpenAtom);
    const setPendingCheck = useSetAtom(pendingDuplicateCheckAtom);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Reactive simulation sync - forces footer states when DevTools flags change
    useEffect(() => {
        if (simulation.nfcBlocked) {
            if (scanState !== 'blocked') {
                triggerHaptic('warning');
                setScanState('blocked');
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }
        } else if (simulation.nfcTurnedOff) {
            if (scanState !== 'hardwareOff') {
                triggerHaptic('warning');
                setScanState('hardwareOff');
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }
        } else {
            // Revert to idle if simulation flags are cleared and we were in a simulated error state
            if (scanState === 'blocked' || scanState === 'hardwareOff') {
                setScanState('idle');
            }
        }
    }, [simulation.nfcBlocked, simulation.nfcTurnedOff, scanState, setScanState, triggerHaptic]);


    const stopScan = useCallback(() => {
        if (scanState === 'idle') return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        triggerHaptic('light');
        setScanState('idle');
        setScanStartTime(null);
    }, [scanState, setScanState, setScanStartTime, triggerHaptic]);

    // Handle valid tag read
    const handleTagRead = useCallback(() => {
        if (scanState !== 'scanning') return;

        // Check if NFC failure simulation is active
        if (simulation.nfcFails) {
            triggerHaptic('warning');
            setScanState('readError');
            return;
        }

        const targetCheck = timeSortedChecks.find(
            (c) => c.status !== 'complete' && c.type !== 'supplemental'
        );

        // Simple Scan ON = auto-complete (skip form)
        if (targetCheck && appConfig.simpleSubmitEnabled) {
            if (targetCheck.status === 'early') {
                setPendingCheck(targetCheck as any);
                setIsDuplicateSheetOpen(true);
                setScanState('idle'); // Stop NFC scanning state
                setScanStartTime(null);
                return;
            }

            const defaultStatuses = targetCheck.residents.reduce(
                (acc, resident) => {
                    acc[resident.id] = 'Awake';
                    return acc;
                },
                {} as Record<string, string>
            );

            completeCheck({
                checkId: targetCheck.id,
                statuses: defaultStatuses,
                notes: '',
                onSuccess: () => {
                    // Feedback handled by footer animation, no toast needed
                },
            });
        }

        setScanState('success');
        setScanStartTime(null);
        triggerHaptic('success');
    }, [scanState, simulation.nfcFails, setScanState, setScanStartTime, triggerHaptic, timeSortedChecks, appConfig.simpleSubmitEnabled, completeCheck, setIsDuplicateSheetOpen, setPendingCheck]);

    // Start scanning
    const startScan = useCallback(() => {
        if (scanState !== 'idle' && scanState !== 'readError' && scanState !== 'timeout' && scanState !== 'blocked' && scanState !== 'hardwareOff' && scanState !== 'success') return;

        // Step 1: Check simulation 'blocked'
        if (simulation.nfcBlocked) {
            triggerHaptic('warning');
            setScanState('blocked');
            return;
        }

        // Step 2: Check simulation 'hardware off'
        if (simulation.nfcTurnedOff) {
            triggerHaptic('warning');
            setScanState('hardwareOff');
            return;
        }

        triggerHaptic('light');
        setScanState('scanning');
        setScanStartTime(Date.now());

        // Timeout Logic
        if (appConfig.nfcTimeoutEnabled) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setScanState('timeout');
                setScanStartTime(null);
                triggerHaptic('warning');
            }, appConfig.nfcScanTimeout);
        }
    }, [scanState, simulation, appConfig.nfcScanTimeout, appConfig.nfcTimeoutEnabled, setScanState, setScanStartTime, triggerHaptic]);

    // Direct restart for success loop
    const restartScan = useCallback(() => {

        // Check for simulation states first
        if (simulation.nfcBlocked) {
            triggerHaptic('warning');
            setScanState('blocked');
            return;
        }
        if (simulation.nfcTurnedOff) {
            triggerHaptic('warning');
            setScanState('hardwareOff');
            return;
        }

        // Go directly to scanning state
        triggerHaptic('light');
        setScanState('scanning');
        setScanStartTime(Date.now());

        // Restart timeout if enabled
        if (appConfig.nfcTimeoutEnabled) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setScanState('timeout');
                setScanStartTime(null);
                triggerHaptic('warning');
            }, appConfig.nfcScanTimeout);
        }
    }, [simulation, appConfig.nfcTimeoutEnabled, appConfig.nfcScanTimeout, setScanState, setScanStartTime, triggerHaptic]);

    // Reset from timeout to idle
    const resetFromTimeout = useCallback(() => {
        if (scanState !== 'timeout') return;
        setScanState('idle');
    }, [scanState, setScanState]);

    // For manual simulation via UI
    const simulateTagRead = useCallback(() => {
        handleTagRead();
    }, [handleTagRead]);

    // Finalize the success state - now just handles the loop/exit
    const finalizeSuccess = useCallback(() => {
        // Handle formComplete - ALWAYS restart scan to return to Ready to Scan
        if (scanState === 'formComplete') {
            restartScan();
            return;
        }

        if (scanState !== 'success') return;

        if (appConfig.simpleSubmitEnabled) {
            // Simple Scan ON = auto-complete mode, restart scan for next check
            restartScan();
        } else {
            // Simple Scan OFF = show form for manual entry
            if (workflowState.view === 'form') {
                setScanState('idle');
                return;
            }

            const targetCheck = timeSortedChecks.find(
                (c) => c.status !== 'complete' && c.type !== 'supplemental'
            );

            setScanState('idle');
            if (targetCheck) {
                setWorkflowState({
                    view: 'form',
                    type: 'scheduled',
                    method: 'scan',
                    checkId: targetCheck.id,
                    roomName: targetCheck.residents[0].location,
                    residents: targetCheck.residents,
                    specialClassifications: targetCheck.specialClassifications,
                });
            }
        }
    }, [

        scanState,
        appConfig.simpleSubmitEnabled,
        setScanState,
        restartScan,
        timeSortedChecks,
        setWorkflowState,
        workflowState.view
    ]);

    // Calculate remaining time
    const getRemainingTime = useCallback(() => {
        if (!scanStartTime || scanState !== 'scanning') return appConfig.nfcScanTimeout;
        const elapsed = Date.now() - scanStartTime;
        return Math.max(0, appConfig.nfcScanTimeout - elapsed);
    }, [scanState, scanStartTime, appConfig.nfcScanTimeout]);

    const targetCheck = timeSortedChecks.find(
        (c) => c.status !== 'complete' && c.type !== 'supplemental'
    );
    const targetRoom = targetCheck?.residents[0]?.location || 'Room';

    return {
        scanState,
        startScan,
        stopScan,
        resetFromTimeout,
        simulateTagRead,
        finalizeSuccess,
        getRemainingTime,
        targetRoom,
        config: {
            timeout: appConfig.nfcScanTimeout,
            timeoutEnabled: appConfig.nfcTimeoutEnabled,
            showCountdown: appConfig.nfcShowCountdown,
        },
    };
};


