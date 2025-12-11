// src/features/Workflow/useCompleteCheck.ts
import { useSetAtom, useAtomValue } from 'jotai';
import { dispatchActionAtom } from '../../data/appDataAtoms';
import {
    connectionStatusAtom,
    recentlyCompletedCheckIdAtom,
    appConfigAtom,
} from '../../data/atoms';
import { useHaptics } from '../../data/useHaptics';

type CompleteCheckOptions = {
    checkId: string;
    statuses: Record<string, string>;
    notes: string;
    onSuccess?: () => void;
};

export const useCompleteCheck = () => {
    const dispatch = useSetAtom(dispatchActionAtom);
    const setRecentlyCompletedCheckId = useSetAtom(recentlyCompletedCheckIdAtom);

    const connectionStatus = useAtomValue(connectionStatusAtom);
    const appConfig = useAtomValue(appConfigAtom);

    const { trigger: triggerHaptic } = useHaptics();

    const completeCheck = ({ checkId, statuses, notes, onSuccess }: CompleteCheckOptions) => {
        // Check if we're in rapid NFC mode: NFC scanning + Simple Submit enabled
        const isRapidMode = appConfig.scanMode === 'nfc' && appConfig.simpleSubmitEnabled;

        triggerHaptic('success');

        // 1. Set status to 'completing' immediately.
        // This triggers the green card state and the "Completed" badge.
        dispatch({ type: 'CHECK_SET_COMPLETING', payload: { checkId } });

        // 2. Trigger the pulse animation via the ID match.
        setRecentlyCompletedCheckId(checkId);

        // 3. Conditional delay based on mode:
        //    - NFC + Simple: 0ms (instant for rapid "tap tap tap" workflow)
        //    - QR or Manual: 2000ms (preserve animation for better UX feedback)
        const delay = isRapidMode ? 0 : 1000;

        setTimeout(() => {
            const payload = {
                checkId,
                statuses,
                notes,
                completionTime: new Date().toISOString(),
            };

            if (connectionStatus === 'offline') {
                dispatch({ type: 'CHECK_SET_QUEUED', payload });
            } else {
                dispatch({ type: 'CHECK_COMPLETE', payload });
            }

            // Cleanup
            setRecentlyCompletedCheckId(null);
            onSuccess?.();
        }, delay);
    };

    return { completeCheck };
};