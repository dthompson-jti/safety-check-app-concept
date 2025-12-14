import { useRegisterSW } from 'virtual:pwa-register/react';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../data/toastAtoms';
import { useEffect } from 'react';

/**
 * Headless component that listens for Service Worker updates.
 * When a new version is available, it triggers a persistent toast
 * prompting the user to update.
 */
export const ReloadPrompt = () => {
    const addToast = useSetAtom(addToastAtom);

    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error) {
            console.error('SW Registration Error:', error);
        },
    });

    useEffect(() => {
        if (needRefresh) {
            addToast({
                stableId: 'pwa-update-available', // Prevent duplicates on re-render
                variant: 'info',
                icon: 'system_update',
                message: 'New version available.',
                persistent: true, // Do not auto-dismiss
                action: {
                    label: 'Update',
                    onClick: () => {
                        void updateServiceWorker(true);
                        setNeedRefresh(false);
                    },
                },
            });
        }
    }, [needRefresh, addToast, updateServiceWorker, setNeedRefresh]);

    return null; // Headless component
};
