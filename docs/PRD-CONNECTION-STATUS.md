### PRD-PROTO-02: Connection Status Indicator & Dev Toggle

#### 1. Overview
This document specifies the creation of a visual connection status indicator, a required UI element from the main PRD (Req #31). To facilitate testing and demonstration of the UI in various states, this feature will include a developer toggle in the settings menu to manually change the displayed status.

#### 2. Problem & Goals
*   **Problem:** The application shell lacks a persistent indicator to inform the user of the device's connection status. Additionally, there is no way to simulate offline or syncing states to validate the UI's appearance and feel for these scenarios.
*   **Goals:**
    1.  Create a new global `connectionStatusAtom` to manage the app's perceived connectivity state ('online', 'offline', 'syncing').
    2.  Implement a `ConnectionStatusIndicator` component that visually represents the current state from the atom.
    3.  Integrate this indicator into a persistent location in the app shell (e.g., the main header).
    4.  Add a control to the "Developer Options" settings page to allow a user to manually toggle the `connectionStatusAtom` value.

#### 3. Scope
*   **In Scope:**
    *   Creating the Jotai atom for state management.
    *   Creating the React component for the UI indicator.
    *   Modifying the "Developer Options" screen to include the toggle control.
*   **Out of Scope:**
    *   Actual network detection logic (e.g., using `navigator.onLine`). The state will be controlled manually for the prototype.
    *   Implementing the offline data queuing and sync logic.

#### 4. UX/UI Specification
The indicator should be small, clear, and use color and icons to convey status at a glance. It should be located in the header of the main layouts.

**Indicator States:**
*   **Online:** A subtle indicator showing the app is connected.
    *   `[•] Online` (Green dot, gray text)
*   **Offline:** A more prominent indicator warning the user.
    *   `[!] Offline` (Orange/Red icon, matching text color)
*   **Syncing:** An active indicator showing data is being transmitted.
    *   `[↑↓] Syncing...` (Spinning icon, blue text)

**Developer Setting Wireframe:**
```
      +----------------------------------+
      | ←  Developer Options             |
      |----------------------------------|
      | ... other settings ...           |
      |----------------------------------|
      |  App Shell Layout                |
      |  [ Classic (FAB)            ▼]   |
      |----------------------------------|
      |  Schedule View Layout            |
      |  [ List View                  ▼]   |
      |----------------------------------|
      |  Connection Status               |  <-- New Setting
      |  [ Online                     ▼]   |
      +----------------------------------+
```
A `Select` component will provide the options: 'Online', 'Offline', and 'Syncing'.

---
---

