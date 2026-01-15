import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../data/toastAtoms';

export const useCheckErrorToasts = () => {
    const addToast = useSetAtom(addToastAtom);

    const triggerFetchError = useCallback(() => {
        addToast({
            message: 'Data Retrieval Failed',
            details: 'Could not load checks from the server. Detailed error logs have been sent to support.',
            errorCode: 'Error: 500 Internal Server Error',
            icon: 'cloud_off',
            variant: 'alert',
            persistent: true,
            action: {
                label: 'Retry',
                onClick: () => {
                    // Placeholder for retry logic
                    console.log('Retry fetch clicked');
                }
            }
        });
    }, [addToast]);

    const triggerSyncError = useCallback(() => {
        addToast({
            message: 'Sync Failed',
            details: 'Changes could not be saved to the server. Your data is safe locally and will be retried automatically.',
            errorCode: 'Error: Sync Timeout',
            icon: 'sync_problem',
            variant: 'warning', // Warning because data is safe locally
            persistent: true,
            action: {
                label: 'Retry Now',
                onClick: () => {
                    // Placeholder for sync retry
                    console.log('Retry sync clicked');
                }
            }
        });
    }, [addToast]);

    return {
        triggerFetchError,
        triggerSyncError
    };
};
