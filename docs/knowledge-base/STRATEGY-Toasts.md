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
Toasts are high-contrast, solid surfaces designed for maximum visibility and accessibility.

*   **Dimensions & Metrics:**
    *   **Border Radius:** 10px (`var(--radius-lg)`)
    *   **Padding:** 12px (`var(--spacing-3)`)
    *   **Internal Gap:** 12px (`var(--spacing-3)`) between icon and content.
    *   **Content Gap:** 4px (`var(--spacing-1)`) between Title and Description.
    *   **Shadow:** `var(--surface-shadow-xl)`
    *   **Z-Index:** `var(--z-toast)` (9999)
    *   **Dismissal:** Includes a dedicated white 'x' close button.
    *   **Content Alignment:** Vertically centered (`align-items: center`).

*   **Typography & Iconography:**
    *   **Icon Size:** 24px (`var(--icon-size-lg)`)
    *   **Title/Description Weight:** Title (600), Description (400)
    *   **Size:** 14px (`var(--font-size-sm)`)
    *   **Color:** `var(--surface-fg-on-solid)` (White) for all variant foregrounds.

### Semantic Variants (High-Contrast Solid)

We define variants using **Solid** background tokens. All foreground elements use `var(--surface-fg-on-solid)`.

#### 1. Neutral (`data-variant="neutral"`)
Used for system state changes.
*   **Background:** `var(--surface-bg-primary-solid)` (#0A0C12)
*   **Border:** 1px solid `var(--surface-border-primary)` (#414651)

#### 2. Success (`data-variant="success"`)
Used for confirming background actions.
*   **Background:** `var(--surface-bg-success-solid)` (#0D935A)
*   **Border:** `rgba(0, 0, 0, 0.1)` (Integrated/Subtle)

#### 3. Warning (`data-variant="warning"`)
Used for non-critical issues.
*   **Background:** `var(--surface-bg-warning-solid)` (#C45500)
*   **Border:** `rgba(0, 0, 0, 0.1)`

#### 4. Alert (`data-variant="alert"`)
Used for critical failures.
*   **Background:** `var(--surface-bg-error-solid)` (#D63230)
*   **Border:** `rgba(0, 0, 0, 0.1)`

#### 5. Info (`data-variant="info"`)
Used for informational messages.
*   **Background:** `var(--surface-bg-info-solid)` (#0085C9)
*   **Border:** `rgba(0, 0, 0, 0.1)`

### Action Links
Toast actions are styled as **Underlined Action Links** with 4px offset, inheriting the white foreground color.

### Placement & Positioning

*   **Desktop Positioning:** Bottom Right (16px from edge).
*   **Mobile Positioning:** Bottom Center (centered horizontally).
*   **Dynamic Stacking:** Toasts respect the `--footer-height` variable.
    ```css
    bottom: calc(var(--footer-height, 0px) + var(--spacing-4));
    ```

### Motion Logic
*   **Animation (Framer Motion):**
    *   **Enter:** Slide Y (-20px) + Scale (0.95 -> 1.0) + Opacity (Spring: `stiffness: 400, damping: 30`).
    *   **Exit:** Scale (1.0 -> 0.95) + Opacity (Tween, 100ms, `easeOut`).

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