# Haptics Review & Research

## 1. Current Implementation Review

The application uses a centralized hook `useHaptics` utilizing the Web Vibration API (`navigator.vibrate`).

### Defined Patterns (Semantic Palette)

**Configurable Patterns (via Developer Settings):**

| Type | Options | Default | Feel | Semantic Intent |
| :--- | :--- | :--- | :--- | :--- |
| **`success`** | Light: `[50]`<br>Medium: `[100]`<br>**Heavy: `[150]`** | Heavy | Short to firm buzz | Successful transaction or state completion (e.g., Check Complete, NFC Payment). |
| **`error`** | Simple: `[200]`<br>**Double: `[300, 100, 300]`**<br>Grind: `[50, 50, 50, 50, 50, 50]`<br>Stutter: `[50, 100, 50, 100, 200]` | Double | Varies by selection | Failure of a critical action (e.g., Scan failed, Tag not read). |

**Static Patterns (Non-configurable):**

| Type | Pattern (ms) | Feel | Semantic Intent |
| :--- | :--- | :--- | :--- |
| **`warning`** | `[100, 50, 100]` | Double buzz | Alert requiring attention (e.g., Offline mode). |
| **`light`** | `10` | Micro-tick | Subtle feedback for minor non-destructive actions. |
| **`medium`** | `40` | Noticeable tap | Standard interaction feedback (e.g., Sync starting). |
| **`heavy`** | `60` | Heavy tap | High-impact actions (e.g., Initiating Scan Mode). |
| **`selection`** | `5` | Ultra-light tick | Discrete value selection (e.g., List picker). |

### Usage Audit

| Feature | Context | Trigger | Haptic Type | Note |
| :--- | :--- | :--- | :--- | :--- |
| **Check Workflow** | Completing a check | `useCompleteCheck` | `success` | Core reinforcement loop. |
| **Scanning** | QR Code Decode | `ScanView` | `success` | |
| **Scanning** | Scan Failure | `ScanView` | `error` | |
| **NFC** | Tag Read (Simulated) | `AppFooter` | `success` | |
| **NFC** | Tag Error (Simulated) | `AppFooter` | `error` | |
| **NFC** | No actionable check | `AppFooter` | `warning` | Smart NFC fallback. |
| **NFC** | Write Success | `NfcWriteSheet` | `success` | Provisioning flow. |
| **Status Selection** | Selecting Status | `StatusSelectionSheet` | `selection` | "Tick" feel for list options. |
| **Context** | Facility/Unit Select | `FacilitySelectionModal` | `selection` | |
| **Dev Mode** | Unlock/Lock | `AppSideMenu` | `success` / `light` | Gamification feedback. |
| **Offline** | Connection Lost | `OfflineBanner` | `warning` | Passive alert. |
| **Sync** | Sync Start | `OfflineBanner` | `medium` | Feedback for "long process" start. |
| **Sync** | Sync Complete | `OfflineBanner` | `success` | |

---

## 2. Payment App Haptics Research

### Android NFC Payment
*   **Duration**: Typically a "short vibration" or "simple bump" (~200ms or less)
*   **Characteristic**: Single, crisp feedback confirming successful tap-to-pay
*   **User Expectation**: Users expect a firm, unmistakable confirmation ("thud")

### iOS Apple Pay
*   **Duration**: Not officially specified, but described as "instant" haptic feedback
*   **Characteristic**: Single tap with high confidence, unmistakable as success
*   **Taptic Engine**: Uses precision haptics for clear distinction

### Key Takeaway
Payment apps use a **single, strong buzz** for success (not gentle multi-tap patterns). This aligns with our decision to use `150ms` (Heavy) as the default success pattern.

---

## 3. Gaps & Opportunities

### Inconsistencies
*   **Primitives are Silent**: The `ActionListItem` and `SegmentedControl` components do not have built-in haptics. They rely on the parent to trigger them.
    *   *Result*: Some lists feel tactile (`StatusSelectionSheet`), while others (likely standard lists without explicit triggers) feel "dead".
*   **Toast Notifications**: Toasts generally appear silently. A `light` haptic accompanying neutral toasts and `warning`/`error` for alerts would improve awareness.
*   **Modal Interactions**: Opening/Closing modals is currently silent. Adding `light` feedback to the "Back" or "Close" actions boosts the feeling of responsiveness.

### Missing Semantics
*   **Refresh**: Pull-to-refresh (if implemented in future) typically needs a "rubber band" tension tick and a "snap" success haptic.
*   **Long Press**: No defined haptic for long-press administrative actions, which usually benefits from valid feedback (e.g., `medium` pulse).

---

## 4. External Research & Best Practices

### Platform Constraints (Critical)
*   **iOS Safari**: Does **not** support `navigator.vibrate`. Haptics will be completely absent for iPhone users unless the app is wrapped (Capacitor/Cordova) or installed as a PWA (support varies by version, generally poor).
*   **Android Chrome**: Excellent support. Patterns are rendered effectively.

### Industry Standards (Material Design & Human Interface Guidelines)
1.  **"Less is More"**: Haptics should be used sparingly to reinforce physical actions, not to confirm every touch.
    *   *Good*: Dialing a date picker, snapping an object to grid, completing a payment.
    *   *Bad*: Haptic on every scroll event or standard navigation click.
2.  **Synchronized Audio-Haptic**: Best-in-class apps (Duolingo, Games) sync sound effects with haptics.
3.  **The "Success" Gradient**:
    *   *Light*: Selecting a radio button.
    *   *Medium*: Toggling a switch.
    *   *Heavy*: Dragging and dropping an item.
    *   *Pattern*: Completing a task (Success confetti).

### Recommendations
1.  **Centralize Primitive Haptics**: Move `selection` haptics *into* `SegmentedControl` and `ActionListItem` (as an optional prop `withHaptic`) to ensure consistent feel across the app without repetitive parent code.
2.  **Toast Integration**: Add haptic triggers to the `addToast` atom logic to ensure all system messages have physical presence.
3.  **IOS Strategy**: If iOS support is required, consider a library that bridges to native Taptic Engine if used in a wrapper, or accept the graceful degradation.
