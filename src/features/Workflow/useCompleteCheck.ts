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
    skipAnimation?: boolean;
    onSuccess?: () => void;
};

export const useCompleteCheck = () => {
    const dispatch = useSetAtom(dispatchActionAtom);
    const setRecentlyCompletedCheckId = useSetAtom(recentlyCompletedCheckIdAtom);

    const connectionStatus = useAtomValue(connectionStatusAtom);

    const { trigger: triggerHaptic } = useHaptics();
    const { play: playSound } = useAppSound();

    const completeCheck = ({ checkId, statuses, notes, skipAnimation, onSuccess }: CompleteCheckOptions) => {
        triggerHaptic('success');
        playSound('success');

        const animationDuration = skipAnimation ? 0 : 2000;

        // 1. Set status to 'completing' immediately (only if showing animation).
        // This triggers the green card state and the "Completed" badge.
        if (!skipAnimation) {
            dispatch({ type: 'CHECK_SET_COMPLETING', payload: { checkId } });

            // 2. Trigger the pulse animation via the ID match.
            setRecentlyCompletedCheckId(checkId);
        }

        // 3. Wait for the animation to play out (2 seconds) or proceed immediately if skipping.
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
            if (!skipAnimation) {
                setRecentlyCompletedCheckId(null);
            }
            onSuccess?.();
        }, animationDuration);
    };

    return { completeCheck };
};