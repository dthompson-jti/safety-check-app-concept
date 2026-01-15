import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../data/toastAtoms';

export const useCheckErrorToasts = () => {
    const addToast = useSetAtom(addToastAtom);

    const triggerFetchError = useCallback(() => {
        addToast({
            message: 'Sync error',
            details: 'Unable to download updates. Retrying automatically.',
            icon: 'sync_disabled',
            variant: 'warning',
            persistent: true,
            action: {
                label: 'Retry',
                onClick: () => {
                    // Placeholder for retry logic
                }
            }
        });
    }, [addToast]);

    const triggerSyncError = useCallback(() => {
        addToast({
            message: 'Sync error',
            details: 'Unable to upload completed checks. Retrying automatically.',
            icon: 'sync_problem',
            variant: 'alert', // Alert variant for outgoing data failure
            persistent: true,
            action: {
                label: 'Retry Now',
                onClick: () => {
                    // Placeholder for sync retry
                }
            }
        });
    }, [addToast]);

    return {
        triggerFetchError,
        triggerSyncError
    };
};
