# Animation Specification & Contracts

This document defines the critical animation behaviors and constraints for the Safety Check application. Adherence to these specifications is mandatory to prevent layout thrashing and ensure a native-quality user experience.

---

## 1. Check Completion Animation

### Final Timing Values

| Phase | Parameter | Value | Notes |
|-------|-----------|-------|-------|
| **Phase 1** | Delay before pulse | 200ms | CSS animation-delay |
| **Phase 1** | Pulse duration | 2s | `card-flash-complete` keyframe |
| **Phase 1** | Background fade | 0.8s | Green → Grey |
| **Phase 1** | Delay after pulse | 1s | Before status → `complete` |
| **Phase 2** | Slide-out duration | 0.5s | Card slides right |
| **Phase 2** | Collapse delay | 0.1s | After slide starts |
| **Phase 2** | Collapse duration | 0.2s | Height → 0 |

### The Interaction Flow

1. **Trigger:** User scans QR code or manually submits check
2. **Phase 1: Transient Success (0ms - ~1200ms)**
   - **State:** Check status → `'completing'`
   - **Visual:** 
     - Outward pulse (green ring, `card-flash-complete`)
     - Background fade: Green → Grey
   - **Constraint:** Card **MUST NOT MOVE** from original position
   - **Overlay:** Form/Scan view closes immediately to reveal animation
3. **Phase 2: Exit Transition (after 1s delay)**
   - **State:** Check status → `'complete'`
   - **Visual:** Card slides right, then height collapses
   - **Layout:** List below fills gap smoothly

---

## 2. Nested Motion Divs Pattern

**Problem:** Framer Motion applies all exit animations simultaneously. Setting `height: 0` with a delay still causes an instant height jump at exit start.

**Solution:** Use two nested `motion.div` elements to separate concerns:

```tsx
// OUTER: Height collapse wrapper (delayed)
<motion.div
  initial={{ height: 'auto', marginBottom: 'var(--space-3)' }}
  animate={{ height: 'auto', marginBottom: 'var(--space-3)' }}
  exit={{
    height: 0,
    marginBottom: 0,
    overflow: 'hidden',
    transition: { delay: 0.1, duration: 0.2, ease: 'linear' }
  }}
>
  {/* INNER: Slide and fade (immediate) */}
  <motion.div
    initial={{ opacity: 0, x: 0 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{
      x: '100%',
      opacity: 0,
      transition: {
        x: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
        opacity: { duration: 0.3, delay: 0.2, ease: 'easeOut' }
      }
    }}
    className={cardClassName}
  >
    {/* Card content */}
  </motion.div>
</motion.div>
```

**Key Points:**
- No `overflow: hidden` on outer during normal state (would clip pulse box-shadow)
- Outer only handles height/margin collapse
- Inner handles slide-right and fade
- `overflow: hidden` applied only in exit transition

---

## 3. Critical Architecture Rules

### A. Sorting Stability Contract
**Rule:** List sorting **MUST NEVER** sort by `status`.

- **Why:** Sorting by status causes cards to jump positions when status changes to `'completing'`
- **Implementation:** Sort by `dueDate` (Time View) or `walkingOrderIndex` (Route View)

### B. Ghost Item Contract
**Rule:** Filtering logic **MUST INCLUDE** items with status `'completing'`.

- **Why:** Excluding `'completing'` items unmounts the card instantly, preventing exit animation
- **Implementation:**
  1. `ScheduleView` grouping explicitly includes `'completing'` items
  2. **Computed Display Group:** Calculate display position from timing window, not raw status

### C. Z-Index for Pulse Visibility
**Rule:** Completing cards must have elevated z-index.

```css
.checkCard[data-status='completing'] {
  position: relative;
  z-index: 10; /* Above sticky headers (z-index: 5) */
}
```

---

## 4. File Locations

| Concern | File |
|---------|------|
| CSS animations | `src/features/Schedule/CheckCard.module.css` |
| Exit animation | `src/features/Schedule/CheckCard.tsx` |
| Status delay | `src/features/Workflow/useCompleteCheck.ts` |
| Grouping logic | `src/features/Schedule/ScheduleView.tsx` |

---

## 5. Page Transitions

Uses "Push/Pop" navigation metaphor:
- **Container:** `position: relative`, `overflow: hidden`
- **Views:** `position: absolute`, `inset: 0`
- **Easing:** `[0.25, 1, 0.5, 1]` (iOS-like)
- **Z-Index:** Entering view higher, exiting view lower with slight scale (0.95)

## 6. Micro-Interactions

- **Haptics:** Success state triggers `success` haptic pattern
- **Sound:** Success state triggers `success` audio cue
- **Ripple:** Use `::before` pseudo-elements for overlays