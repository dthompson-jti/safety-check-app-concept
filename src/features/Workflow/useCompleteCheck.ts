// src/features/Workflow/useCompleteCheck.ts
import { useSetAtom, useAtomValue } from 'jotai';
import { dispatchActionAtom } from '../../data/appDataAtoms';
import {
    connectionStatusAtom,
    recentlyCompletedCheckIdAtom,
} from '../../data/atoms';
import { useHaptics } from '../../data/useHaptics';
import { useAppSound } from '../../data/useAppSound';

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

    const { trigger: triggerHaptic } = useHaptics();
    const { play: playSound } = useAppSound();

    const completeCheck = ({ checkId, statuses, notes, onSuccess }: CompleteCheckOptions) => {
        triggerHaptic('success');
        playSound('success');

        // 1. Set status to 'completing' immediately.
        // This triggers the green card state and the "Completed" badge.
        dispatch({ type: 'CHECK_SET_COMPLETING', payload: { checkId } });
        
        // 2. Trigger the pulse animation via the ID match.
        setRecentlyCompletedCheckId(checkId);

        // 3. Wait for the animation to play out (2 seconds).
        // This applies to both Online and Offline modes for consistency.
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
        }, 2000);
    };

    return { completeCheck };
};