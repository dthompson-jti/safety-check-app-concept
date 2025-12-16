# Design Brief: Star Scan Interaction

## 1. Project Overview

### Objective
Implement a user-initiated "Star Scan" (Start Scan) interaction for the NFC checking mode. Unlike the "Always-On" passive reading of some NFC systems, this interaction requires a deliberate user action to initiate a scanning session (active polling), which can time out if no tag is found.

### Users & Context
*   **Users:** Corrections/Medical staff performing round-based safety checks.
*   **Frequency:** High-volume, repetitive task (hundreds of scans per shift).
*   **Environment:** Industrial or clinical settings. Often noisy, potentially wearing gloves.
*   **Device:** Mobile phones (Handheld).
*   **Core Need:** Speed, reliability, and clear feedback. The user needs to know *exactly* when the device is looking for a tag and when it has stopped.

## 2. App Layout & Wireframes

### Global Layout Reference
The interactions takes place within the persistent app footer.

```
.--------------------------------------------------.
|  12:30 PM   [Avatar]                    [Menu =] |  <-- App Header
+--------------------------------------------------+
|  Safety Checks (A-Wing)                          |
|  [ Filter: Due Soon ] [ v ]                      |
+--------------------------------------------------+
|  [ ] 101 - Smith                                 |
|      due in 15m                                  |
|--------------------------------------------------|
|  [ ] 102 - Jones                                 |
|      due in 20m                                  |
|                                                  |
|  ... (List Scrolls) ...                          |
|                                                  |
+==================================================+  <-- Footer Container
|  [ ACTION AREA ]                                 |
+--------------------------------------------------+
```

### Footer Detail: A. Standard QR Mode (Current)
*Action:* Opens a full-screen camera view.
```
+==================================================+
|  [ [QR] Scan ]                                   |
|   (Full Width Button)                            |
+--------------------------------------------------+
```

### Footer Detail: B. NFC Mode (Target)
*Action:* Initiates an in-place scanning session with a timeout (approx 15s).
```
+==================================================+
|  [ [★] Star Scan ]                               |
|   (Button State TBD by Design Selection)         |
+--------------------------------------------------+
```

## 3. Initial Ideas (Exploration Space)

We have identified 10 distinct conceptual approaches for this interactions:

1.  **Active Pulse (The Standard):** A reliable 2-state button (Idle/Scanning) with text feedback.
2.  **Radar Sweep:** Visual-heavy feedback where the button container animates like a radar during scanning.
3.  **Timeout Ring:** A circular progress indicator integrated into the button to show remaining scan time.
4.  **Hold-to-Scan:** "Dead man's switch" pattern requiring the user to hold the button down physically while scanning.
5.  **System Sheet Mimic:** Triggers a bottom-sheet overlay that looks like the OS-level NFC pairing screen.
6.  **Dynamic Island Capsule:** A floating pill element that detaches from the footer and morphs into a status indicator.
7.  **Swipe-to-Arm:** A slider interaction (like "Slide to Unlock") to prevent accidental triggers.
8.  **Full-Screen Ambient:** The entire screen becomes the touch target/status indicator.
9.  **Sonar Reticle:** A floating spatial element (crosshair) that expands when searching.
10. **Haptic Compass:** A screen-free concept relying primarily on vibration feedback patterns for "Searching" vs "Found".

## 4. Evaluation Criteria

We will judge these concepts against the following metrics (Assessment pending):

### Core Criteria
1.  **Clarity:** Is the current state (Idle vs Scanning vs Timeout) instantly obvious?
2.  **Ergonomics:** Can the user trigger this *and* hold the phone to a wall tag comfortably with one hand?
3.  **Feasibility:** Is the engineering cost proportional to the value?
4.  **Aesthetics:** Does it feel "High-Craft" and premium?

### Advanced Criteria
5.  **Accessibility (a11y):** Screen reader announcements, color contrast, and reduced motion support.
6.  **Context Preservation:** Does the scanning UI obscure critical info (e.g., Room Name)?
7.  **Mistake Proofing (Poka-yoke):** Resistance to accidental starts or accidental cancellations.
