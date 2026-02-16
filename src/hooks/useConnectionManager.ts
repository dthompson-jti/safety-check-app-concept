import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { connectionStatusAtom } from '../data/atoms';
import { dispatchActionAtom, queuedChecksCountAtom } from '../data/appDataAtoms';
import { useHaptics } from '../data/useHaptics';

export const useConnectionManager = () => {
    const [status, setStatus] = useAtom(connectionStatusAtom);
    const queuedCount = useAtomValue(queuedChecksCountAtom);
    const dispatch = useSetAtom(dispatchActionAtom);
    const { trigger: triggerHaptic } = useHaptics();

    const goOffline = () => {
        if (status === 'offline') return;
        triggerHaptic('selection');
        setStatus('offline');
    };

    const goOnline = () => {
        if (status === 'online' || status === 'syncing' || status === 'connected' || status === 'synced') return;

        if (queuedCount > 0) {
            // Start Sync Flow
            setStatus('syncing');
            triggerHaptic('medium');

            // Min Duration for Sync (1.5s)
            setTimeout(() => {
                dispatch({ type: 'SYNC_QUEUED_CHECKS', payload: { syncTime: new Date().toISOString() } });
                triggerHaptic('success');
                setStatus('synced');

                // Show success state then switch to Online
                setTimeout(() => setStatus('online'), 1000);
            }, 1500);
        } else {
            // Dry transition - just show connected
            triggerHaptic('success');
            setStatus('connected');
            setTimeout(() => setStatus('online'), 1000);
        }
    };

    const toggleConnection = () => {
        if (status === 'online' || status === 'syncing' || status === 'connected' || status === 'synced') {
            goOffline();
        } else {
            goOnline();
        }
    };

    return { status, goOffline, goOnline, toggleConnection };
};
