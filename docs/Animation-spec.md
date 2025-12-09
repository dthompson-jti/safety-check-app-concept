Here is the complete package.

### 1. Animation Specification
This document defines the strict contracts required to maintain the "Scan-to-Complete" interaction.

--- START OF FILE ANIMATION-SPEC.md ---

# Animation Specification & Contracts

This document defines the critical animation behaviors and constraints for the eProbation Safety Check application. Adherence to these specifications is mandatory to prevent layout thrashing and ensure a native-quality user experience.

## 1. The "Scan-to-Complete" Lifecycle

The check completion workflow relies on a delicate balance between **State Management**, **Sorting Logic**, and **Visual Transitions**.

### The Interaction Flow
1.  **Trigger:** User scans a QR code or manually submits a check.
2.  **Phase 1: Transient Success (0ms - 2000ms)**
    *   **State:** Check status updates to `'completing'`.
    *   **Visual:** Card background turns Green (`var(--surface-bg-success)`). A ripple overlay fires.
    *   **Layout Constraint:** The card **MUST NOT MOVE**. It must remain in its original list position.
3.  **Phase 2: Exit Transition (at 2000ms)**
    *   **State:** Check status updates to `'complete'`.
    *   **Visual:** Card slides out to the right while collapsing.
    *   **Layout Constraint:** The list below fills the gap smoothly.

### Critical Architecture Rules

#### A. The Sorting Stability Contract
**Rule:** The sorting algorithm for the active schedule list **MUST NEVER** sort by `status`.
*   **Why:** If the list sorts by status (e.g., Late > Due Soon > Completing), changing a check to `'completing'` will cause it to instantly "jump" to a new position before the user can see the success animation.
*   **Implementation:** Sort strictly by `dueDate` (Time View) or `walkingOrderIndex` (Route View).

#### B. The Ghost Item Contract
**Rule:** The filtering logic for the active view must **include** items with status `'completing'`.
*   **Why:** If the filter excludes `'completing'` items (like it excludes `'complete'` items), the card will vanish instantly (unmount) without playing its exit animation.
*   **Implementation:**
    1.  `ScheduleView` grouping logic explicitly **includes** `'completing'` items.
    2.  **Computed Display Group:** To prevent the item from jumping to a different group (e.g., "Upcoming") when its status changes, sorting logic must calculate its **Display Status** based on the timing window (Late/Due/etc.) rather than using the raw `'completing'` status. This ensures it stays anchored in its original position during the animation.

#### C. The Exit Transition Spec
**Rule:** Items leaving the list must slide right and collapse height simultaneously.
*   **Framer Motion Prop:**
    ```javascript
    exit={{ 
      x: '100%',          // Slide Right
      height: 0,          // Collapse Space
      opacity: 0,         // Fade Out
      overflow: 'hidden', // Prevent content clipping
      marginBottom: 0     // Remove gap
    }}
    ```

---

## 2. Page Transitions (The Push/Pop Model)

To simulate native navigation, the application uses a "Push/Pop" metaphor.

*   **Container:** `position: relative`, `overflow: hidden`.
*   **Views:** `position: absolute`, `inset: 0`.
*   **Transition Curve:** `[0.25, 1, 0.5, 1]` (Native-like easing).
*   **Z-Index:**
    *   **Entering View:** Higher Z-index.
    *   **Exiting View:** Lower Z-index, slight scale down (0.95) or parallax offset.

## 3. Micro-Interactions

*   **Haptics:** Every visual success state (Green Card) must be paired with a `success` haptic pattern.
*   **Sound:** Every visual success state must be paired with a `success` audio cue.
*   **Ripple:** Use `::before` pseudo-elements for ripple overlays to avoid DOM pollution.