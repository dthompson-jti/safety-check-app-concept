import { useAtomValue } from 'jotai';
import {
    appViewAtom,
    isDevToolsModalOpenAtom,
    isFutureIdeasModalOpenAtom,
    isUserSettingsModalOpenAtom,
    isContextSelectionModalOpenAtom,
    isManualCheckModalOpenAtom,
    workflowStateAtom,
} from '../data/atoms';

/**
 * useGlobalOverlayState
 * 
 * A centralized hook to determine if the main dashboard view is obscured
 * by any overlay, menu, modal, or aggressive state.
 * 
 * Use this to hide floating elements (FABs, Toasts) that would otherwise
 * clutter the UI or overlap with critical navigation.
 */
export const useGlobalOverlayState = () => {
    const appView = useAtomValue(appViewAtom);
    const isDevToolsOpen = useAtomValue(isDevToolsModalOpenAtom);
    const isFutureIdeasOpen = useAtomValue(isFutureIdeasModalOpenAtom);
    const isUserSettingsOpen = useAtomValue(isUserSettingsModalOpenAtom);
    const isContextSelectionOpen = useAtomValue(isContextSelectionModalOpenAtom);
    const isManualCheckOpen = useAtomValue(isManualCheckModalOpenAtom);
    const workflowState = useAtomValue(workflowStateAtom);

    // 1. Side Menu State
    const isSideMenuOpen = appView === 'sideMenu';

    // 2. Full Screen Modals
    const isAnyModalOpen =
        isDevToolsOpen ||
        isFutureIdeasOpen ||
        isUserSettingsOpen ||
        isContextSelectionOpen;

    // 3. Workflow Overlays (Drilled Down Views)
    // 'none' means we are on the dashboard. Anything else is an active workflow.
    const isWorkflowActive = workflowState.view !== 'none';

    // 4. Action Sheets / Drawers
    const isActionSheetOpen = isManualCheckOpen;

    const isOverlayActive =
        isSideMenuOpen ||
        isAnyModalOpen ||
        isWorkflowActive ||
        isActionSheetOpen;

    return {
        isOverlayActive,
        details: {
            isSideMenuOpen,
            isAnyModalOpen,
            isWorkflowActive,
            isActionSheetOpen
        }
    };
};
