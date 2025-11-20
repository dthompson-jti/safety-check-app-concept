import { useSetAtom, useAtomValue } from 'jotai';
import { dispatchActionAtom } from '../../data/appDataAtoms';
import {
    connectionStatusAtom,
    recentlyCompletedCheckIdAtom,
    completingChecksAtom,
    // appConfigAtom
} from '../../data/atoms';
// import { addToastAtom } from '../../data/toastAtoms';
import { useHaptics } from '../../data/useHaptics';
import { useSound } from '../../data/useSound';

type CompleteCheckOptions = {
    checkId: string;
    statuses: Record<string, string>;
    notes: string;
    onSuccess?: () => void;
};

export const useCompleteCheck = () => {
    const dispatch = useSetAtom(dispatchActionAtom);
    // const addToast = useSetAtom(addToastAtom); // Unused for now as we rely on caller or other feedback
    const setRecentlyCompletedCheckId = useSetAtom(recentlyCompletedCheckIdAtom);
    const setCompletingChecks = useSetAtom(completingChecksAtom);

    const connectionStatus = useAtomValue(connectionStatusAtom);
    // const { simpleSubmitEnabled } = useAtomValue(appConfigAtom); // Unused as animation is always enabled now

    const { trigger: triggerHaptic } = useHaptics();
    const { play: playSound } = useSound();

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

        // Simple submit still shows animation per user request
        const PULSE_ANIMATION_DURATION = 1200;
        const EXIT_ANIMATION_DURATION = 400;

        dispatch({ type: 'CHECK_SET_COMPLETING', payload: { checkId } });
        setRecentlyCompletedCheckId(checkId);

        setTimeout(() => {
            setCompletingChecks((prev) => new Set(prev).add(checkId));
        }, PULSE_ANIMATION_DURATION);

        const TOTAL_ANIMATION_DURATION = PULSE_ANIMATION_DURATION + EXIT_ANIMATION_DURATION;
        setTimeout(() => {
            dispatch({ type: 'CHECK_COMPLETE', payload });

            setCompletingChecks((prev) => {
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
