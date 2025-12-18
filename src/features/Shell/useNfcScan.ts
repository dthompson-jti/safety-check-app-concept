// src/features/Shell/useNfcScan.ts
import { useCallback, useEffect, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    nfcScanStateAtom,
    nfcScanStartTimeAtom,
    appConfigAtom,
    workflowStateAtom,
    hardwareSimulationAtom,
} from '../../data/atoms';
import { timeSortedChecksAtom } from '../../data/appDataAtoms';
import { addToastAtom } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';
import { useCompleteCheck } from '../Workflow/useCompleteCheck';

/**
 * Hook for managing NFC scan state machine.
 * 
 * State Machine:
 * idle → scanning → success → idle
 *         ↓        ↑
 *       timeout ───┘
 */
export const useNfcScan = () => {
    const [scanState, setScanState] = useAtom(nfcScanStateAtom);
    const [scanStartTime, setScanStartTime] = useAtom(nfcScanStartTimeAtom);
    const appConfig = useAtomValue(appConfigAtom);
    const simulation = useAtomValue(hardwareSimulationAtom);
    const timeSortedChecks = useAtomValue(timeSortedChecksAtom);
    const setWorkflowState = useSetAtom(workflowStateAtom);
    const addToast = useSetAtom(addToastAtom);
    const { trigger: triggerHaptic } = useHaptics();
    const { completeCheck } = useCompleteCheck();

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Start scanning
    const startScan = useCallback(() => {
        if (scanState !== 'idle') return;

        triggerHaptic('light');
        setScanState('scanning');
        setScanStartTime(Date.now());

        // Only set timeout if enabled
        if (appConfig.nfcTimeoutEnabled) {
            timeoutRef.current = setTimeout(() => {
                setScanState('timeout');
                setScanStartTime(null);
                triggerHaptic('warning');
                addToast({
                    message: 'Scan timed out.\nNo tag detected.',
                    icon: 'timer_off',
                    variant: 'neutral',
                });
            }, appConfig.nfcScanTimeout);
        }
    }, [scanState, appConfig.nfcScanTimeout, appConfig.nfcTimeoutEnabled, setScanState, setScanStartTime, triggerHaptic, addToast]);

    // Stop scanning (cancel)
    const stopScan = useCallback(() => {
        if (scanState !== 'scanning') return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        triggerHaptic('light');
        setScanState('idle');
        setScanStartTime(null);
    }, [scanState, setScanState, setScanStartTime, triggerHaptic]);

    // Reset from timeout to idle
    const resetFromTimeout = useCallback(() => {
        if (scanState !== 'timeout') return;
        setScanState('idle');
    }, [scanState, setScanState]);

    // Transition to success state
    const simulateTagRead = useCallback(() => {
        if (scanState !== 'scanning') return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Check if NFC failure simulation is active
        if (simulation.nfcFails) {
            triggerHaptic('error');
            addToast({
                message: 'Tag not read.\nHold phone steady against the tag.',
                icon: 'wifi_tethering_error',
                variant: 'alert',
            });

            // Restart timeout if enabled
            if (appConfig.nfcTimeoutEnabled) {
                setScanStartTime(Date.now());
                timeoutRef.current = setTimeout(() => {
                    setScanState('timeout');
                    setScanStartTime(null);
                    triggerHaptic('warning');
                    addToast({
                        message: 'Scan timed out.\nNo tag detected.',
                        icon: 'timer_off',
                        variant: 'neutral',
                    });
                }, appConfig.nfcScanTimeout);
            }
            return;
        }

        // Transition to success state - UI will handle animation and call finalizeSuccess
        setScanState('success');
        setScanStartTime(null);
        triggerHaptic('success');
    }, [
        scanState,
        simulation.nfcFails,
        appConfig.nfcTimeoutEnabled,
        appConfig.nfcScanTimeout,
        setScanState,
        setScanStartTime,
        triggerHaptic,
        addToast
    ]);

    // Finalize the success state (called after animation)
    const finalizeSuccess = useCallback(() => {
        if (scanState !== 'success') return;

        // Find target check
        const targetCheck = timeSortedChecks.find(
            (c) => c.status !== 'complete' && c.type !== 'supplemental'
        );

        if (targetCheck) {
            if (appConfig.simpleSubmitEnabled) {
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
                        const roomName = targetCheck.residents[0]?.location || 'Room';
                        addToast({
                            message: `${roomName} completed`,
                            icon: 'check_circle',
                            variant: 'success',
                            stableId: 'nfc-scan-success',
                        });
                    },
                });

                // Continuous loop: restart scanning after success
                setScanState('scanning');
                setScanStartTime(Date.now());

                // Reset timeout if enabled
                if (appConfig.nfcTimeoutEnabled) {
                    timeoutRef.current = setTimeout(() => {
                        setScanState('timeout');
                        setScanStartTime(null);
                        triggerHaptic('warning');
                        addToast({
                            message: 'Scan timed out.\nNo tag detected.',
                            icon: 'timer_off',
                            variant: 'neutral',
                        });
                    }, appConfig.nfcScanTimeout);
                }
            } else {
                // Open form view when simple submit is disabled
                setScanState('idle');
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
        } else {
            console.warn('No target check found for NFC success');
            setScanState('idle');
        }
    }, [
        scanState,
        timeSortedChecks,
        appConfig.simpleSubmitEnabled,
        setScanState,
        completeCheck,
        addToast,
        setWorkflowState
    ]);

    // Calculate remaining time
    const getRemainingTime = useCallback(() => {
        if (!scanStartTime || scanState !== 'scanning') return appConfig.nfcScanTimeout;
        const elapsed = Date.now() - scanStartTime;
        return Math.max(0, appConfig.nfcScanTimeout - elapsed);
    }, [scanState, scanStartTime, appConfig.nfcScanTimeout]);

    return {
        scanState,
        startScan,
        stopScan,
        resetFromTimeout,
        simulateTagRead,
        finalizeSuccess,
        getRemainingTime,
        config: {
            timeout: appConfig.nfcScanTimeout,
            timeoutEnabled: appConfig.nfcTimeoutEnabled,
            showCountdown: appConfig.nfcShowCountdown,
        },
    };
};
