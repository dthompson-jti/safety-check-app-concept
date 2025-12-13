## PRD 2: Enhanced Scan Workflow & Ergonomics
**Focus:** "Tangibility" (Sound), NFC Usability, Scan Simulation Smarts, and Mobile Ergonomics.

### 1. Overview
This PRD addresses the tactile feel of the application and specific workflow improvements for the Scanning and NFC use cases. It introduces a "Ready to Scan" footer for NFC and smart simulation logic for demos.

### 2. Problem & Goals
**Problem:** NFC mode has no visual indicator or primary action. The QR simulation is random (bad for demos). The app lacks audio feedback. Mobile keyboards often obscure the footer.
**Goals:**
*   Provide clear visual feedback when NFC mode is active.
*   Enable deterministic demos by making the "Simulate" button target the *top* item.
*   Add sound effects for key interactions.
*   Ensure "Back" button behavior respects user intent (caching).

### 3. Scope & Key Initiatives
*   **NFC Footer:** Create a translucent footer for NFC mode stating "Ready to Scan".
*   **Smart Simulation:** Refactor `ScanView` simulation logic to pick the first available check in the *current filtered view*.
*   **Sound Design:** Implement a `useSound` hook for Success (Beep) and Error (Buzz).
*   **Back Button Caching:** Implement a `draftFormAtom` to temporarily store form state if the user hits "Back" (not Cancel), so re-entering the form restores data.
*   **Mobile Keyboard Fix:** Use `dvh` units or a `ResizeObserver` on `visualViewport` to ensure the `CheckFormView` footer stays visible when the keyboard opens.

### 4. UX/UI Specification & Wireframes

**A. NFC Footer (`FloatingFooter.tsx` - NFC Mode)**
```text
+-------------------------------------------------------+
| [WIFI ICON]  Ready to Scan                            | <-- Translucent BG (same as QR)
+-------------------------------------------------------+     Icon: 'sensors' or 'wifi_tethering'
                                                              Text: Centered
```

### 5. Architecture & Implementation Plan
*   **Simulation Logic:** The `ScanView` needs access to the *sorted* list atoms (`timeSortedChecksAtom`) rather than just the raw list, to ensure it picks the visual "top" item.
*   **Audio:** Create `src/data/useSound.ts`. Use standard HTML5 Audio.
    *   *Note:* Browsers block auto-play. Sounds must be triggered by the user interaction (click) or inside the async handler of the scan result.
*   **Keyboard:** Update `CheckFormView.module.css` to use `height: 100dvh`.

### 6. File Manifest
*   `src/features/Shell/FloatingFooter.tsx` `[MODIFIED]` (NFC State)
*   `src/features/Workflow/ScanView.tsx` `[MODIFIED]` (Smart simulation logic)
*   `src/data/useSound.ts` `[NEW]`
*   `src/features/Workflow/CheckFormView.tsx` `[MODIFIED]` (Draft state caching)
*   `src/data/formAtoms.ts` `[NEW]` (To hold draft state)

### 7. Unintended Consequences Check
*   **Audio:** Ensure volume isn't jarring. Default to subtle system-like sounds.
*   **Drafts:** Ensure draft state is cleared upon *successful* submission.

### 8. Risks & Mitigations
*   **Risk:** Audio may not play on iOS without explicit user tap.
*   **Mitigation:** Bind the "success" sound to the visual transition; accept that purely passive NFC scans might be silent on some devices (though haptics will fire).

### 9. Definition of Done
*   NFC mode shows "Ready to Scan" footer.
*   "Simulate Success" opens the *top* check in the current list.
*   Scans and Saves trigger a sound effect.
*   Clicking "Back" then re-opening a check preserves the entered notes/statuses.

---

