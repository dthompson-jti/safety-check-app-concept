import { useSetAtom, useAtomValue } from 'jotai';
import { dispatchActionAtom } from '../../data/appDataAtoms';
import {
    connectionStatusAtom,
    recentlyCompletedCheckIdAtom,
    completingChecksAtom,
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
    const setCompletingChecks = useSetAtom(completingChecksAtom);

    const connectionStatus = useAtomValue(connectionStatusAtom);

    const { trigger: triggerHaptic } = useHaptics();
    const { play: playSound } = useAppSound(); 

    const completeCheck = ({ checkId, statuses, notes, onSuccess }: CompleteCheckOptions) => {
        triggerHaptic('success');
        playSound('success');

        const payload = {
            checkId,
            statuses,
            notes,
            completionTime: new Date().toISOString(),
        };

        if (connectionStatus === 'offline') {
            dispatch({ type: 'CHECK_SET_QUEUED', payload });
            onSuccess?.();
            return;
        }

        // Animation timing constants
        const PULSE_ANIMATION_DURATION = 1200;
        const EXIT_ANIMATION_DURATION = 400;

        dispatch({ type: 'CHECK_SET_COMPLETING', payload: { checkId } });
        setRecentlyCompletedCheckId(checkId);

        // Trigger visual pulse state
        setTimeout(() => {
            setCompletingChecks((prev: Set<string>) => new Set(prev).add(checkId));
        }, PULSE_ANIMATION_DURATION);

        const TOTAL_ANIMATION_DURATION = PULSE_ANIMATION_DURATION + EXIT_ANIMATION_DURATION;
        
        // Finalize completion and remove from list
        setTimeout(() => {
            dispatch({ type: 'CHECK_COMPLETE', payload });

            setCompletingChecks((prev: Set<string>) => {
                const next = new Set(prev);
                next.delete(checkId);
                return next;
            });

            setRecentlyCompletedCheckId(null);
            onSuccess?.();
        }, TOTAL_ANIMATION_DURATION);
    };

    return { completeCheck };
};