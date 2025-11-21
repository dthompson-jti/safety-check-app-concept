Here is the comprehensive specification and execution plan for the Toast System Overhaul.

--- START OF FILE TOAST-STRATEGY-SPEC.md ---

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

*   **Typography:**
    *   **Weight:** 500 (Medium)
    *   **Size:** 0.9rem (14px-15px)
    *   **Color:** `var(--surface-fg-secondary)` for all variants to ensure consistent readability.

*   **Iconography:**
    *   **Size:** 20px
    *   **Alignment:** Center-aligned with the first line of text.

### Semantic Variants

We define three strict variants using Data Attributes (`data-variant="..."`).

#### 1. Alert / Error (`data-variant="alert"`)
Used for system failures, hardware errors, or critical background events (e.g., "Missed Checks").

*   **Background:** `var(--surface-bg-error-primary)`
*   **Border:** 1px solid `var(--surface-border-alert)`
*   **Icon:** `error` or `warning`
*   **Icon Color:** `var(--surface-fg-alert-primary)`

#### 2. Success (`data-variant="success"`)
Used for confirming background actions where no view transition occurs (e.g., "Simple Submit" or "Background Sync Complete").

*   **Background:** `var(--surface-bg-success)`
*   **Border:** 1px solid `var(--surface-border-success)`
*   **Icon:** `check_circle`
*   **Icon Color:** `var(--surface-fg-success-primary)`

#### 3. Neutral / Info (`data-variant="neutral"`)
Used for system state changes that are neither successes nor failures (e.g., "Dev Tools Reset", "Offline Mode Enabled").

*   **Background:** `var(--surface-bg-primary)` (White)
*   **Border:** 1px solid `var(--surface-border-secondary)`
*   **Icon:** `info`
*   **Icon Color:** `var(--surface-fg-secondary)`

### Placement & Motion Logic

*   **Positioning:** Bottom Center.
*   **Dynamic Stacking:**
    Toasts utilize the **Component Variable Contract**. The CSS must respect the `--footer-height` variable to ensure toasts never cover the floating action buttons or navigation bars.
    ```css
    bottom: calc(var(--footer-height, 0px) + var(--spacing-4));
    ```
*   **Animation (Framer Motion):**
    *   **Enter:** Slide Y (-20px) + Scale (0.95 -> 1.0) + Opacity (Spring Physics).
    *   **Exit:** Scale (1.0 -> 0.95) + Opacity (Tween, 150ms).
    *   **Gestures:** Horizontal Swipe-to-Dismiss (native Radix behavior).

---

## 3. Usage Audit & Migration Plan

We have scanned the codebase for every instance of `addToast`. The following actions will be taken:

| File | Context | Current Behavior | Action Required | New Variant |
| :--- | :--- | :--- | :--- | :--- |
| **ScanView.tsx** | `failScan` (QR Error) | Toast: "Scan Failed" | **REMOVE**. The viewfinder already has a `.failState` overlay. | N/A |
| **ScanView.tsx** | `handleSimulateSuccess` | Toast: "No checks found" | **KEEP**. Dev tool feedback. | `neutral` |
| **CheckEntryView.tsx** | `handleSave` (Scheduled) | Toast: "Check saved" (Offline only implied) | **REMOVE**. The view transition is sufficient feedback. | N/A |
| **CheckEntryView.tsx** | `handleSave` (Supplemental)| Toast: "Supplemental check saved" | **KEEP**. Supplemental checks don't alter the main list, so feedback is needed. | `success` |
| **useCompleteCheck.ts**| `Simple Submit` | Toast: "Check completed" | **KEEP**. No view transition occurs here. | `success` |
| **AppFooter.tsx** | `NFC` (Simulated Scan) | Toast: "Check completed" (via useCompleteCheck) | **KEEP**. Matches Simple Submit logic. | `success` |
| **AppFooter.tsx** | `NFC` (No Candidates) | Toast: "No incomplete checks" | **KEEP**. Feedback for invalid action. | `neutral` |
| **useCheckLifecycle.ts**| `Missed Check` | Toast: "Check missed" | **KEEP**. Background event. | `alert` |
| **DeveloperModal.tsx** | `Reset Data` | Toast: "Data reset" | **KEEP**. Confirm destructive action. | `neutral` |

---

## 4. Implementation Steps

1.  **Type Definition Update (`toastAtoms.ts`):**
    *   Modify `Toast` interface to include `variant`.
    *   Update `addToastAtom` to accept `variant` (defaulting to `neutral`).

2.  **Component Overhaul (`Toast.tsx`):**
    *   Remove existing hardcoded styles/colors.
    *   Pass `variant` to the root element as `data-variant`.
    *   Ensure `ToastPrimitive.Close` uses `surface-fg-secondary`.

3.  **Stylesheet Rewrite (`toast.css`):**
    *   Implement the Metric and Semantic specs defined above.
    *   Add the dynamic bottom positioning logic.

4.  **Usage Refactor (Multiple Files):**
    *   Delete the redundant `addToast` calls identified in the Audit.
    *   Add the correct `variant` argument to the remaining calls.

--- END OF FILE TOAST-STRATEGY-SPEC.md ---

### Affected Files

The following files are required for context or modification to execute this plan:

*   `src/data/toastAtoms.ts` (Update Types)
*   `src/components/Toast.tsx` (Update Component Structure)
*   `src/styles/toast.css` (Update Styles)
*   `src/features/Workflow/ScanView.tsx` (Remove Redundant Toast)
*   `src/features/Workflow/CheckEntryView.tsx` (Remove Redundant Toast)
*   `src/features/Workflow/useCompleteCheck.ts` (Add Variant)
*   `src/features/Shell/AppFooter.tsx` (Add Variant)
*   `src/data/useCheckLifecycle.ts` (Add Variant)
*   `src/features/Overlays/DeveloperModal.tsx` (Add Variant)