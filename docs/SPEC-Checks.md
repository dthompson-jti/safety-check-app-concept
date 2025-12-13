# Safety Check Specification

## 1. Lifecycle Logic
**Source of Truth:** `useCheckLifecycle.ts`

### States
| Status | Time Window | Description |
| :--- | :--- | :--- |
| **Early/Pending** | `0m` to `13m` | Standard checking window. |
| **Due** | `13m` to `15m` | 2-minute warning. Yellow badge. |
| **Missed** | `≥ 15m` | **Hard Deadline.** Red badge. |

### Transitions
- **Completion:** Check marked `complete`. New check generated immediately.
    - *Next Due Date:* Completion Time + Base Interval (15m).
- **Missed:** Check marked `missed`. New check generated immediately.
    - *Next Due Date:* Missed Trigger Time + Base Interval.

## 2. UI Specification
**Source of Truth:** `CheckCard.tsx` / `TaskOverlayLayout`

### Component: `CheckCard`
- **Visuals:** Card appearance (`surface-bg-secondary`), Min `56px` height.
- **Animation (The "Nested Div" Pattern):**
    - **Goal:** Prevent layout thrashing during exit.
    - **Outer Div:** Handles Height Collapse. `delay: 0.1s`.
    - **Inner Div:** Handles Slide/Fade. `duration: 0.5s` (Slide).
- **Interaction:**
    - Active State: Scale 0.99.
    - Disabled: No interaction if status is `complete` or `queued`.

### Overlays
- **Z-Index:** `105` (Full Screen).
- **Background:** `surface-bg-secondary` (Dark) / `white` (Light).
- **Typography:** Sentence case for headers.
