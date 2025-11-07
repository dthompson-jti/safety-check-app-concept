Excellent. Here is a comprehensive Product Requirements Document (PRD) for the requested refactoring and new features, following the specified format.

---

### **PRD: Prototype Refinement & Developer Tooling**

#### **1. Overview**

This document outlines a series of enhancements to the Safety Check PWA prototype. The primary focus is on refining the user experience by streamlining the core navigation, improving the architectural integrity of the codebase, and introducing a dedicated developer toolkit. These changes will convert secondary views (History, Settings) into full-screen modals, add a developer panel for simulating offline connectivity, and implement an administrative setting to configure the app's primary scan mode (QR vs. NFC), which will adapt the UI accordingly. This work will make the prototype a more effective tool for stakeholder demos and future development.

#### **2. Problem & Goals**

*   **Problem:** The current tab-based navigation feels cluttered for a mobile-first PWA, treating secondary functions like "History" and "Settings" as equal to the primary "Dashboard". The codebase contains some vestigial components. Critically, there is no way to test or demonstrate the UI's behavior in an offline state, a key requirement of the final application. The UI is also static and doesn't adapt to the facility's chosen scanning technology (QR vs. NFC).

*   **Goals:**
    1.  **Streamline UX:** Improve the primary user flow by converting History and Settings into overlay modals, focusing the main interface on the core task of completing checks.
    2.  **Enhance Testability:** Implement a non-destructive developer panel to simulate offline connectivity, allowing for robust UI testing and demonstration.
    3.  **Improve Configurability:** Introduce an admin setting to switch between "QR" and "NFC" scan modes, allowing the UI (specifically the main scan footer) to adapt to the configured workflow.
    4.  **Increase Code Quality:** Reduce codebase complexity by removing unused components and simplifying the view-rendering logic.

#### **3. Scope & Key Initiatives**

*   **In Scope:**
    1.  **Refactor History & Settings Views:** Convert these views from main application tabs into full-screen, animated modals launched from the side navigation menu.
    2.  **Implement Developer Tools:** Create a new modal accessible from the side menu containing tools for developers, starting with a toggle for simulating network connectivity.
    3.  **Implement Connection Status UI:** Add a persistent UI indicator in the main header that displays the current (simulated) connection status ("Offline", "Syncing").
    4.  **Implement Admin Scan Mode Configuration:** Add a control in the Admin Settings panel to switch the application's scan mode, which will conditionally render the floating scan button footer.
    5.  **Codebase Simplification:** Remove the redundant `DashboardView.tsx` component and any other identified unused components.

*   **Out of Scope:**
    *   **No Real Offline Persistence:** This initiative is for UI simulation only. No implementation of IndexedDB, Service Workers, or actual local data storage will be done.
    *   **No Real NFC Logic:** The admin toggle will only affect the UI. No native NFC API integration will be implemented.
    *   **No User-Facing UI Toggles:** The developer panel and its toggles are for internal testing and will not be part of the standard user-facing settings.

#### **4. UX/UI Specification & Wireframes**

##### **Initiative 1: History & Settings as Modals**
The user flow will change from tapping a main tab to selecting an item in the side menu, which will present the corresponding view in a modal that slides up from the bottom of the screen.

*   **Interaction:** User taps "History" in the side menu. The view animates up as a full-screen modal. The header contains a "Close" button to dismiss it.
*   **Animation:** Use a performant `transform` animation (`y` and `scale`) for a smooth, app-like transition.

##### **Initiative 2 & 3: Developer Tools & Connection Status UI**

*   **Developer Tools Modal Wireframe:**
    *   Accessed via a new "Developer Tools" item in the side menu.
    *   Uses the standard `Modal` component.

    ```plaintext
    +--------------------------------------------------+
    | Developer Tools                           [x]    | Header uses standard Modal.Header
    +--------------------------------------------------+
    |                                                  |
    |  CONNECTIVITY                                    | Section title style
    |                                                  | padding-top: var(--spacing-4);
    |  +--------------------------------------------+  |
    |  | [cloud] Online | [cloud_off] Offline       |  | IconToggleGroup component
    |  +--------------------------------------------+  |
    |                                                  |
    |  UI SETTINGS                                     |
    |                                                  | gap: var(--spacing-6);
    |  +--------------------------------------------+  |
    |  | Show Scan Footer             ( o--------- )|  | Standard settings item row
    |  +--------------------------------------------+  |
    |                                                  |
    +--------------------------------------------------+
    ```

*   **Connection Status Indicator Wireframe:**
    *   Renders within the main `FloatingHeader`.
    *   Uses a small, non-intrusive badge.

    ```plaintext
    // State: Offline
    +--------------------------------------------------+
    | [menu]    ( Time | Route )   [cloud_off Offline] [+] |
    +--------------------------------------------------+
    // Badge uses var(--surface-bg-alert-subtle) and
    // var(--surface-fg-alert-primary) for color.

    // State: Syncing
    +--------------------------------------------------+
    | [menu]    ( Time | Route )      [spin Syncing...] [+] |
    +--------------------------------------------------+
    // Badge uses var(--surface-bg-info) and
    // var(--surface-fg-info-primary) for color.
    ```

##### **Initiative 4: Admin Scan Mode Setting Wireframe**
*   Located within the existing `AdminSettingsView.tsx`.

```plaintext
+--------------------------------------------------+
| [<] Admin Tools                                  | Detail header
+--------------------------------------------------+
|                                                  |
| +----------------------------------------------+ |
| | Write NFC Tag                            [ > ] | | Existing settings item
| +----------------------------------------------+ |
| | Scan Mode                 [ QR ]  [ NFC ]    | | [NEW] settings item with IconToggleGroup
| +----------------------------------------------+ |
|                                                  |
+--------------------------------------------------+
```

#### **5. Architecture & Implementation Plan**

*   **State Management (Jotai):** All new UI states will be managed by new global atoms in `src/data/atoms.ts`.
    *   `isHistoryModalOpenAtom = atom(false)`
    *   `isSettingsModalOpenAtom = atom(false)`
    *   `isDevToolsModalOpenAtom = atom(false)`
    *   `connectionStatusAtom = atom<'online' | 'offline' | 'syncing'>('online')`
    *   `appConfigAtom = atom<{ scanMode: 'qr' | 'nfc' }>({ scanMode: 'qr' })`
*   **New Components:**
    *   `src/features/Developer/DeveloperToolsModal.tsx`: The UI for the new developer panel.
    *   `src/features/Header/ConnectionStatusIndicator.tsx`: The UI badge for displaying network status.
*   **Modified Components:**
    *   `src/features/NavBar/SideMenu.tsx`: Add triggers for all three new modals.
    *   `App.tsx` (or root layout): Conditionally render the new modals at the top level. Remove `HistoryView` and `SettingsView` from the main tabbed view logic.
    *   `src/features/Footer/FloatingFooter.tsx`: Will read `appConfigAtom` and return `null` if `scanMode` is `'nfc'`.
    *   `src/features/Header/FloatingHeader.tsx`: Will include the new `<ConnectionStatusIndicator />` component.
    *   `src/features/CheckForm/CheckFormView.tsx`: The `handleSave` function will be modified to check `connectionStatusAtom`. If `'offline'`, it will not call `dispatchActionAtom` and will instead trigger a "Check Queued" toast.
    *   `src/features/Settings/AdminSettingsView.tsx`: Add the new UI control for `appConfigAtom`.
*   **Code Cleanup:**
    *   `src/features/Dashboard/DashboardView.tsx`: This file will be deleted. The root layout will render `<ListView />` directly.

#### **6. File Manifest**

*   **[NEW]** `src/features/Developer/DeveloperToolsModal.tsx`
*   **[NEW]** `src/features/Developer/DeveloperToolsModal.module.css`
*   **[NEW]** `src/features/Header/ConnectionStatusIndicator.tsx`
*   **[NEW]** `src/features/Header/ConnectionStatusIndicator.module.css`
*   **[MODIFIED]** `src/data/atoms.ts` (Add 5 new state atoms)
*   **[MODIFIED]** `src/features/NavBar/SideMenu.tsx` (Add new menu items)
*   **[MODIFIED]** `src/features/Header/FloatingHeader.tsx` (Add ConnectionStatusIndicator)
*   **[MODIFIED]** `src/features/Footer/FloatingFooter.tsx` (Add conditional rendering logic)
*   **[MODIFIED]** `src/features/CheckForm/CheckFormView.tsx` (Add offline check to save handler)
*   **[MODIFIED]** `src/features/Settings/AdminSettingsView.tsx` (Add scan mode setting)
*   **[MODIFIED]** `src/features/History/HistoryView.tsx` (Convert to modal, add close button)
*   **[MODIFIED]** `src/features/Settings/SettingsView.tsx` (Convert to modal, add close button)
*   **[DELETED]** `src/features/Dashboard/DashboardView.tsx`
*   **[REFERENCE]** `src/components/Modal.tsx`
*   **[REFERENCE]** `src/components/Switch.tsx`
*   **[REFERENCE]** `src/components/IconToggleGroup.tsx`
*   **[REFERENCE]** `src/data/toastAtoms.ts`

#### **7. Unintended Consequences Check**

*   **`FloatingFooter.tsx` / `--footer-height`:** The `ToastContainer`'s positioning relies on the `--footer-height` CSS variable set by the footer. If the footer is hidden (via the new admin setting), this variable will not be set. **Action:** The CSS for `.toast-viewport` must be updated to include a safe fallback value, e.g., `bottom: calc(var(--footer-height, 16px) + 16px);`.
*   **`useUrlSync.ts`:** This hook synchronizes `activeViewAtom` with a URL query parameter. Since "History" and "Settings" will no longer be part of `activeViewAtom`, this hook may function incorrectly or become obsolete. **Action:** Review and refactor or remove this hook as part of the navigation changes.
*   **Global Types:** New types (`ConnectionStatus`, `AppConfig`) will be added. They should be defined in a central location (`src/types.ts` or `src/data/atoms.ts` if only used there) to maintain type consistency.

#### **8. Risks & Mitigations**

*   **Risk:** State management becomes overly complex with new global atoms.
    *   **Mitigation:** Adhere strictly to the "single source of truth" principle. All new state will be clearly defined, named, and documented in `atoms.ts`. Logic will be driven by derived atoms where possible to keep components clean.
*   **Risk:** Modal animations could feel sluggish on low-end mobile devices.
    *   **Mitigation:** Use Framer Motion with hardware-accelerated CSS properties (`transform`, `opacity`). Avoid animations that trigger expensive layout reflows. Test on a range of devices.
*   **Risk:** Developer tools could be accidentally accessed or left on by a user in a demo environment, causing confusion.
    *   **Mitigation:** The entry point will be visually distinct and clearly labeled. The connection status indicator provides clear, persistent feedback if the app is in a simulated offline state. For a production build, these features can be entirely removed using environment variables (e.g., `if (import.meta.env.DEV) { ... }`).

#### **9. Definition of Done**

*   [ ] The `DashboardView.tsx` file has been deleted, and the app functions correctly.
*   [ ] "History" and "Settings" are no longer main application views and can only be accessed from the side menu.
*   [ ] When opened, History and Settings animate up from the bottom as full-screen modals.
*   [ ] A "Developer Tools" option is present in the side menu.
*   [ ] The Developer Tools modal contains a working toggle to switch the app's simulated connection state between "Online" and "Offline".
*   [ ] A connection status indicator is visible in the header when the state is "Offline" or "Syncing".
*   [ ] Attempting to save a check while in simulated "Offline" mode shows a "Check Queued" toast and does not update the main list.
*   [ ] The Admin Settings view contains a control to switch Scan Mode between "QR" and "NFC".
*   [ ] Setting Scan Mode to "NFC" causes the `FloatingFooter` with the scan button to disappear. Setting it to "QR" makes it reappear.
*   [ ] The toast container position is correct even when the footer is hidden.