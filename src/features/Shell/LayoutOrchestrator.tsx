// src/features/Shell/LayoutOrchestrator.tsx
import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { totalHeaderHeightAtom, bannerHeightAtom } from '../../data/layoutAtoms';

/**
 * Headless component that synchronizes Jotai layout state with CSS Custom Properties.
 * 
 * This breaks the cycle of "Read DOM -> Write DOM -> Read DOM" by acting as the
 * sole writer of the `--header-height` variable based on the registry's state.
 */
export const LayoutOrchestrator = () => {
    const totalHeaderHeight = useAtomValue(totalHeaderHeightAtom);
    const bannerHeight = useAtomValue(bannerHeightAtom);

    useEffect(() => {
        // We update the CSS variable whenever the total height changes.
        // This variable is used by the scroll container to set the correct top padding.
        document.documentElement.style.setProperty('--header-height', `${totalHeaderHeight}px`);

        // We also expose the banner height specifically, in case other components need it.
        document.documentElement.style.setProperty('--offline-banner-height', `${bannerHeight}px`);

    }, [totalHeaderHeight, bannerHeight]);

    return null;
};