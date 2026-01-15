src/TOAST-STRATEGY-SPEC.md
```markdown
# Toast Notification Strategy & Design Specification

## 1. Core Philosophy

To maintain a high-craft, low-friction user experience, the application adheres to a **"Minimize & Contextualize"** philosophy for notifications.

1.  **Intrinsic Feedback First:** Do not use a toast if the UI itself changes state to indicate success (e.g., a card animating off-screen, a page transition, or a modal closing).
2.  **No Redundancy:** Do not layer a toast on top of an existing error view (e.g., if a scanner viewfinder turns red and says "Error", do not also pop a toast saying "Error").
3.  **Semantic Clarity:** Every toast must transmit its severity and intent immediately through color and iconography.
4.  **System Awareness:** Toasts must respect the layout of the screen, floating dynamically above fixed footers or keyboards.

## 2. Design Specifications

### Visual Architecture
Toasts are high-elevation floating surfaces that prioritize readability and touch targets.

*   **Dimensions & Metrics:**
    *   **Border Radius:** 12px (`var(--radius-xl)`)
    *   **Padding:** 16px (`var(--spacing-4)`)
    *   **Content Gap:** 16px (`var(--spacing-4)`)
    *   **Shadow:** `var(--surface-shadow-md)`
    *   **Elevation:** Layer 200 (Above Content, Navigation, and Floating Buttons)
    *   **Dismissal:** Includes a dedicated 'x' close button on the right edge.
    *   **Content Formatting:** Supports `white-space: pre-line` to allow explicit line breaks (`\n`) for separating problems from solutions.

*   **Typography:**
    *   **Weight:** 500 (Medium)
    *   **Size:** 0.9rem (14px-15px)
    *   **Color:** `var(--surface-fg-secondary)` for all variants to ensure consistent readability.

*   **Iconography:**
    *   **Size:** 20px
    *   **Alignment:** Center-aligned with the first line of text.

### Content Guidelines (NEW)
*   **Error Messages:** Must be actionable. Follow the pattern: `[Problem description].\n[Actionable resolution].`
    *   *Bad:* "NFC Error"
    *   *Good:* "Tag not read.\nHold phone steady against the tag."

### Semantic Variants

We define strict variants using Data Attributes (`data-variant="..."`).

#### 1. Neutral (`data-variant="neutral"`)
*Default.* Used for system state changes that are neither successes nor failures (e.g., "Dev Tools Reset", "Offline Mode Enabled").
*   **Background:** `var(--surface-bg-primary)` (White)
*   **Border:** 1px solid `var(--surface-border-secondary)`
*   **Icon:** `info`
*   **Icon Color:** `var(--surface-fg-secondary)`

#### 2. Success (`data-variant="success"`)
Used for confirming background actions where no view transition occurs (e.g., "Simple Submit" or "Supplemental Check Saved").
*   **Background:** `var(--surface-bg-success)`
*   **Border:** 1px solid `var(--surface-border-success)`
*   **Icon:** `check_circle`
*   **Icon Color:** `var(--surface-fg-success-primary)`

#### 3. Warning (`data-variant="warning"`)
Used for non-critical issues or passive alerts that require attention but do not block workflow (e.g., "Missed Checks").
*   **Background:** `var(--surface-bg-warning-primary)`
*   **Border:** 1px solid `var(--surface-border-warning)`
*   **Icon:** `history` or `warning`
*   **Icon Color:** `var(--surface-fg-warning-primary)`

#### 4. Alert (`data-variant="alert"`)
Used for critical system failures or hardware errors.
*   **Background:** `var(--surface-bg-error-primary)`
*   **Border:** 1px solid `var(--surface-border-alert)`
*   **Icon:** `error`
*   **Icon Color:** `var(--surface-fg-alert-primary)`

#### 5. Info (`data-variant="info"`)
Used for informational messages that are distinct from system status (e.g., specific help tips).
*   **Background:** `var(--surface-bg-info)`
*   **Border:** 1px solid `var(--surface-border-info)`
*   **Icon:** `info`
*   **Icon Color:** `var(--surface-fg-info-primary)`

### Placement & Motion Logic

*   **Positioning:** Bottom Center.
*   **Dynamic Stacking:**
    Toasts utilize the **Component Variable Contract**. The CSS respects the `--footer-height` variable to ensure toasts never cover floating action buttons or navigation bars.
    ```css
    bottom: calc(var(--footer-height, 0px) + var(--spacing-4));
    ```
*   **Animation (Framer Motion):**
    *   **Enter:** Slide Y (-20px) + Scale (0.95 -> 1.0) + Opacity (Spring: `stiffness: 400, damping: 30`).
    *   **Exit:** Scale (1.0 -> 0.95) + Opacity (Tween, 150ms, `easeOut`).
    *   **Constraint:** The `layout` prop is **disabled** on the Toast component to prevent conflicts with Radix UI's CSS transform-based swipe gestures.

*   **Gestures:**
    *   **Swipe Direction:** Right (`swipeDirection="right"`).
    *   **Behavior:** Toast tracks finger 1:1. On release past threshold, it dismisses.

---

## 3. Usage Audit

| Trigger Context | Action | Variant | Rationale |
| :--- | :--- | :--- | :--- |
| **QR Scan Error** | **REMOVE** | N/A | The viewfinder has a dedicated red overlay. A toast is redundant. |
| **Online Save** | **REMOVE** | N/A | The page transition is the feedback. |
| **Supplemental Save** | **KEEP** | `success` | Supplemental checks do not remove items from a list, so explicit feedback is needed. |
| **Simple Submit** | **KEEP** | `success` | User stays on the list view; explicit feedback required. |
| **Missed Checks** | **KEEP** | `warning` | Background event driven by time, not user action. |
| **Dev Tools Reset** | **KEEP** | `neutral` | Destructive action confirmation. |
| **Simulated Camera Fail** | **KEEP** | `alert` | "Camera not responding.\nTry restarting your device." |
| **Simulated NFC Fail** | **KEEP** | `alert` | "Tag not read.\nHold phone steady against the tag." |

---

## 4. Technical Implementation Details

1.  **Provider Wrapping:**
    The `ToastPrimitive.Provider` is wrapped inside `ToastContainer.tsx` to strictly enforce `swipeDirection="right"` across the entire application.

2.  **CSS Touch Action:**
    The `.toast-root` class must include `touch-action: none` to allow the browser to yield touch events to the Radix swipe handler.

3.  **Strict Mode Handling:**
    The `addToastAtom` includes logic to deduplicate identical messages sent in rapid succession (common in React Strict Mode), preventing double-toast rendering.
```
END: