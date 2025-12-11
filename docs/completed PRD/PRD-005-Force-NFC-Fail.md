# PRD-005: Force NFC Fail & Detailed Error Simulation

## 1. Overview
This feature introduces granular hardware failure simulation for NFC interactions, mirroring the existing Camera failure simulation. It empowers developers and QA to validate error handling, messaging, and recovery flows for NFC-based checks without physical faulty hardware. Additionally, it updates the Toast Playground to include specific, "expected" hardware error variants.

## 2. Problem & Goals
**Problem:**
Currently, developers can only simulate a generic "Hardware Error" or forcing the Camera view to fail. There is no simple way to simulate a failed NFC tag read (e.g., damaged tag, read interruption) to verify the application's response (haptic, audio, toast).

**Goals:**
1.  Enable a specific "Force NFC Failure" mode in Developer Settings.
2.  Differentiate between Camera and NFC errors in the Toast Playground.
3.  Ensure the "Force NFC Fail" state blocks successful NFC check completion and triggers the correct error feedback loop.

## 3. Scope & Key Initiatives

**Key Initiatives:**
*   **Force NFC Fail Toggle:** Add a specific toggle to the "Simulation" section of Developer Tools.
*   **NFC Error Logic:** Intercept the simulated NFC scan action in the App Footer when the toggle is active.
*   **Refined Toast Playground:** Replace the generic "Hardware Error" button with separate "Camera Error" and "NFC Error" triggers.

**Out of Scope:**
*   Actual hardware NFC error handling (this is purely for simulation logic).
*   Changes to the QR/Camera failure logic (visual overlay), other than the generic toast reference.

## 4. UX/UI Specification & Wireframes

### Developer Modal - Simulation Section
Existing "Force Camera Failure" toggle is joined by "Force NFC Failure".

```text
[ Simulation -------------------------------- ]
[ Force Camera Failure                  ( O ) ]
[ Force NFC Failure                     ( O ) ] < NEW
[ Simulate slow loading                 ( O ) ]
```

### Toast Playground
The toast playground uses **standard secondary buttons** for a cleaner look. The semantic styling is visible on the actual toast that appears.

```text
[ Toast Playground ------------------------------- ]
| [button] Scan Success  | [button] Simple Submit  |
| [button] Supplemental  | [button] Sync Complete  |
| [button] Missed Check  | [button] Neutral Info   |
|--------------------------------------------------|
|               Hardware Errors                    |
| [button] Camera Error  | [button] NFC Error      |
```

---

### Error Scenarios & Wording

Based on external research, the following are realistic failure scenarios and user-actionable messages.

#### NFC Errors

| Scenario                     | Root Cause                                        | Toast Message                                       |
| :--------------------------- | :------------------------------------------------ | :-------------------------------------------------- |
| **Tag Read Interrupted**     | User pulled away too quickly; signal interference | "Tag not read. Hold phone steady against the tag."  |
| **Damaged / Unreadable Tag** | NFC tag is physically damaged or corrupted        | "Tag is damaged or unreadable. Contact supervisor." |
| **NFC Hardware Failure**     | Device NFC antenna is malfunctioning              | "NFC hardware error. Try restarting the app."       |

> **Simulation Focus:** The "Force NFC Failure" toggle will simulate the most common scenario: **Tag Read Interrupted**.

#### Camera Errors

| Scenario             | Root Cause                                                    | Toast Message                                          |
| :------------------- | :------------------------------------------------------------ | :----------------------------------------------------- |
| **Camera In Use**    | Another app (or browser tab) has exclusive access             | "Camera in use by another app. Close other apps."      |
| **Permission Denied**| User has denied camera permission in browser/OS settings      | "Camera access blocked. Check app permissions."        |
| **Hardware Failure** | Camera service is unresponsive or internal device failure     | "Camera not responding. Try restarting your device."   |

> **Simulation Focus:** The "Force Camera Failure" toggle simulates **Hardware Failure** (camera unresponsive).

---

### Simulated Error Wording (Final)

*   **NFC (Simulated):** "Tag not read. Hold phone steady against the tag."
*   **Camera (Simulated):** "Camera not responding. Try restarting your device."

## 5. Architecture & Implementation Plan

### Data Layer (`atoms.ts`)
*   Update `HardwareSimulation` interface to include `nfcFails: boolean`.
*   Update `hardwareSimulationAtom` default state.

### UI Layer
*   **DeveloperModal.tsx**:
    *   Add Switch for `nfcFails`.
    *   Update `toastDefinitions`: Remove generic hardware error, add specific Camera and NFC error definitions.
*   **AppFooter.tsx**:
    *   In `handleNfcClick`, check `simulation.nfcFails`.
    *   If true, trigger error side effects (Audio/Haptic/Toast) and return early.

## 6. File Manifest

### Data
*   `[MODIFIED]` `src/data/atoms.ts`: Add `nfcFails` to `hardwareSimulationAtom`.

### Features
*   `[MODIFIED]` `src/features/Overlays/DeveloperModal.tsx`:
    *   Add setting toggle.
    *   Update toast definitions logic.
*   `[MODIFIED]` `src/features/Shell/AppFooter.tsx`:
    *   Implement failure interception logic.

## 7. Unintended Consequences Check
*   **Global Haptics:** Ensure `error` haptic doesn't conflict with other interactions. (Safe: it's a discrete event).
*   **Toast ID Collisions:** Ensure new toast definitions don't reuse IDs if we use `stableId`. (Safe: These are ephemeral).

## 8. Risks & Mitigations
*   **Risk:** Developer forgets they left the toggle specific to NFC on, thinks app is broken.
    *   **Mitigation:** The Toast is explicit ("NFC Read Failed"), giving a clue.
*   **Risk:** Interaction with "Simulate Slow Loading".
    *   **Mitigation:** Failure should be immediate, bypassing slow load logic.

## 9. Definition of Done
*   [ ] `npm run lint` passes.
*   [ ] `npm run build` passes.
*   [ ] **Manual Check:**
    *   Enable "Force NFC Failure".
    *   Verify checking a room via NFC footer click fails with correct Haptic, Sound, and Toast.
    *   Verify Toast Playground "NFC Error" produces identical toast.
    *   Verify Toast Playground "Camera Error" produces correct toast.
    *   Disable "Force NFC Failure" and verify success flow resumes.
