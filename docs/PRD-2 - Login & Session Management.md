Excellent. Let's proceed with the detailed plan for the simulated authentication layer.

---

## PRD-02: Login & Session Management (Simulated)

### 1. Overview

This document specifies the requirements for creating a simulated login and session management workflow for the Safety Check PWA. The primary objective is to prototype the "start of shift" experience described in the main PRD, establishing a clear entry and exit point for the application. This involves building a dedicated login screen and implementing a global, non-persistent session state. This feature will act as a gatekeeper, ensuring the main application shell (developed in PRD-01) is only accessible after a user has performed a "login" action.

### 2. Problem & Goals

**Problem:** The application currently loads directly into its main interface, lacking the concept of a user session. The PRD mandates an authentication step at the start of a shift. To accurately prototype the user journey, we must simulate this boundary between a logged-out and a logged-in state.

**Goals:**

1.  **Implement Session State:** Introduce a global Jotai atom to manage a simulated, in-memory user session (i.e., is the user logged in or not?).
2.  **Create Login View:** Build a clean, mobile-first `LoginView` component with fields for username and password, and a primary action button.
3.  **Implement Auth Gatekeeping:** Modify the application's entry point to conditionally render either the `LoginView` or the main `AppShell` based on the session state.
4.  **Implement Logout Flow:** Provide a clear "Logout" action within the main application that resets the session state and returns the user to the `LoginView`.

### 3. Scope & Key Initiatives

**In Scope:**

*   **Session Atom:** A new Jotai atom (`sessionAtom`) to track authentication status and the current user's name.
*   **Login Feature:** A new feature directory `src/features/Login/` containing the `LoginView.tsx` component and its styles.
*   **Reusable `TextInput` Component:** A new generic `TextInput.tsx` component will be created for use in the login form and future forms.
*   **Conditional Rendering:** The root `App.tsx` will be modified to act as the primary auth router.
*   **Logout Functionality:** A "Logout" button will be added to the placeholder `SettingsView`.
*   **Feedback for Failed Login:** The login form will provide visual feedback (a shake animation and a toast message) if the login button is pressed with empty fields.

**Out of Scope:**

*   **Real Authentication:** No backend APIs, password validation, or security measures will be implemented. Any non-empty username will be considered a "successful" login.
*   **Session Persistence:** The session is not persisted. Refreshing the browser will reset the state and return the user to the login screen.
*   **Advanced Auth Features:** MFA, "Forgot Password," "Remember Me," or user registration are not part of this prototype.
*   **Complex Form Validation:** Only a simple check for non-empty fields is required.

### 4. UX/UI Specification & Wireframes

The user flow is a simple loop: `Logged Out -> Log In -> Logged In -> Log Out -> Logged Out`.

*   **Login View:** A full-screen view with a centered card containing the login form.

    **ASCII Wireframe: `LoginView.tsx`**
    ```
          +----------------------------------+
          |                                  |
          |           [APP LOGO]             |
          |                                  |
          |       eSupervision Mobile        |
          |                                  |
          |   +--------------------------+   |
          |   | Username                 |   | <-- TextInput component
          |   +--------------------------+   |   (uses styles from forms.css)
          |                                  |
          |   +--------------------------+   |
          |   | Password                 |   | <-- TextInput component
          |   +--------------------------+   |
          |                                  |
          |   +--------------------------+   |
          |   |         Log In           |   | <-- Button, variant="primary"
          |   +--------------------------+   |
          |                                  |
          +----------------------------------+
          Page BG: var(--surface-bg-secondary)
          Card BG: var(--surface-bg-primary)
          Card Padding: var(--spacing-8)
    ```

*   **Logout Button:** A prominent button placed within the `SettingsView`.

    **ASCII Wireframe: `SettingsView.tsx` (Relevant Section)**
    ```
          +----------------------------------+
          | Settings                         |
          |----------------------------------|
          | ... (other settings) ...         |
          |                                  |
          |   +--------------------------+   |
          |   |          Log Out         |   | <-- Button, destructive variant
          |   +--------------------------+   |
          |                                  |
          +----------------------------------+
    ```

### 5. Architecture & Implementation Plan

1.  **State Management (Jotai):**
    *   In `src/data/atoms.ts`, create a new `sessionAtom`:
        ```typescript
        interface Session {
          isAuthenticated: boolean;
          userName: string | null;
        }
        export const sessionAtom = atom<Session>({ isAuthenticated: false, userName: null });
        ```

2.  **Component Structure:**
    *   **Refactor `App.tsx`:** The current content of `App.tsx` (the layout switcher and view renderer) will be moved into a new component: `src/AppShell.tsx`. The `App.tsx` file will become the top-level gatekeeper.
        ```tsx
        // src/App.tsx (logic sketch)
        import { useAtomValue } from 'jotai';
        import { sessionAtom } from './data/atoms';
        import { AppShell } from './AppShell';
        import { LoginView } from './features/Login/LoginView';

        function App() {
          const session = useAtomValue(sessionAtom);
          return session.isAuthenticated ? <AppShell /> : <LoginView />;
        }
        ```
    *   **Create `LoginView.tsx`:**
        *   This component will use `useState` for the `username` and `password` input fields.
        *   The "Log In" button's `onClick` handler will use `useSetAtom(sessionAtom)`.
        *   If `username` is empty, it will trigger a shake animation (via Framer Motion) on the form and call `addToastAtom` with an error message.
        *   If `username` is not empty, it will call `setSession({ isAuthenticated: true, userName })`.
    *   **Create `TextInput.tsx`:**
        *   Create a new generic component at `src/components/TextInput.tsx`.
        *   This will be a simple wrapper around an `<input>` element that accepts standard props (`value`, `onChange`, `placeholder`, `type`). It will not have a CSS module and will rely on the global styles in `src/styles/forms.css`.
    *   **Update `SettingsView.tsx`:**
        *   Create a placeholder `SettingsView.tsx` if it doesn't exist.
        *   Add a `Button` component with a destructive style. Its `onClick` handler will call `setSession({ isAuthenticated: false, userName: null })`.

### 6. File Manifest

*   **src/features/Login/ `[NEW DIRECTORY]`**
    *   `LoginView.tsx` `[NEW]`
    *   `LoginView.module.css` `[NEW]`
*   **src/features/Settings/** `[NEW DIRECTORY]`
    *   `SettingsView.tsx` `[NEW]`
*   **src/components/**
    *   `TextInput.tsx` `[NEW]`
*   **src/data/**
    *   `atoms.ts` `[MODIFIED]` (Add `sessionAtom`)
*   **src/**
    *   `App.tsx` `[MODIFIED]` (Becomes the auth gatekeeper)
    *   `AppShell.tsx` `[NEW]` (Contains the layout logic from the old `App.tsx`)
*   **package.json** `[REFERENCE]` (for Framer Motion dependency)

### 7. Unintended Consequences Check

*   **`App.tsx` Refactor:** The most significant change is splitting `App.tsx` into `App.tsx` (gatekeeper) and `AppShell.tsx` (layout/view host). This is an architectural improvement, but care must be taken to ensure all props and context providers are correctly moved to `AppShell.tsx` so the logged-in experience remains unchanged.
*   **Global Styles (`forms.css`):** The new `TextInput` component relies on these global styles. We must verify that the styles are correctly applied and do not conflict with other inputs, like the `SearchInput` component which uses `all: unset` to specifically opt out of these global styles.

### 8. Risks & Mitigations

1.  **Risk:** The "shake" animation on failed login could be jarring or cause layout shifts if not implemented correctly.
    *   **Mitigation:** Use Framer Motion's `motion.div` with a simple `x` keyframe animation (`animate={{ x: [0, -10, 10, -10, 10, 0] }}`). This animates the `transform` property, which is performant and does not affect layout.
2.  **Risk:** The architectural split of `App.tsx` could be done incorrectly, breaking existing functionality from PRD-01.
    *   **Mitigation:** The refactor will be a simple cut-and-paste operation. The original `App` function will be renamed to `AppShell` and moved to its own file. The new `App` function will be minimal, containing only the gatekeeper logic. This minimizes the surface area for error.

### 9. Definition of Done

*   [ ] The application loads to the `LoginView` by default.
*   [ ] The `LoginView` contains username and password fields (`TextInput`) and a "Log In" button.
*   [ ] Clicking "Log In" with an empty username shows a toast notification and triggers a shake animation on the form.
*   [ ] Entering any text into the username field and clicking "Log In" navigates the user to the main application (`AppShell`).
*   [ ] The `DashboardView`'s welcome message is updated to display the username entered during login.
*   [ ] A placeholder `SettingsView` is accessible from the main navigation.
*   [ ] The `SettingsView` contains a "Logout" button.
*   [ ] Clicking the "Logout" button returns the user to the `LoginView`.