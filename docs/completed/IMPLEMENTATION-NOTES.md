# Implementation Notes & Architectural Patterns

This document captures critical implementation details, patterns, and "gotchas" discovered during development. It serves as a technical companion to the PRDs and Specs.

## 1. Animation Stability Patterns

### 1.1 The "Ghost Item" & Computed Display Group Pattern

**Context:**
Per `Animation-spec.md`, items transitioning from an active state (e.g., 'Due') to a completed state must:
1.  Remain in their original visual position (no jumping).
2.  Play a success pulse (Phase 1).
3.  Slide off the screen (Phase 2).

**The Challenge:**
If the list is sorted/grouped by status (e.g., Missed -> Due -> Upcoming), a status change to `'completing'` would arguably move the item to a different group (or the "Upcoming" default bucket) *before* the animation completes. This causes the item to "jump" instantly, breaking the users focus.

**The Solution: Computed Display Groups**
Instead of allowing `'completing'` items to fall into a default group, we explicitly calculate their **intended display group** based on their timing window.

In `ScheduleView.tsx` (and other lists):
1.  **Do not filter out** `'completing'` items. They must be present for `AnimatePresence` to detect their removal later.
2.  **Determine Display Status:** If status is `'completing'`, calculate what the status *would be* based on the current time vs. due date.
3.  **Sort/Group based on Display Status:** Place the item in the 'Missed', 'Due', or 'Upcoming' bucket based on this calculation.

**Code Example:**
```typescript
if (check.status === 'completing') {
  // Compute what the status WOULD have been based on timing
  // This ensures the card stays exactly where the user clicked it
  // until the 2000ms timer fires and changes it to 'complete' (removing it).
  const elapsedMinutes = getElapsedMinutes(check);
  displayStatus = getStatusFromMinutes(elapsedMinutes);
}
// Sort into groups using displayStatus...
```

**Why this matters:**
This ensures the "Rock Solid" principle (see `CARD-STATE-PRD.md`) is maintained. The user sees the card turn green *in place*, and then slide away.

---

### 1.2 The "Nested Motion Divs" Pattern for Sequenced Animations

**Context:**
Per `Animation-spec.md`, exit animations should be sequenced: slide-out first, THEN height collapse. This creates a smooth, deliberate exit rather than a chaotic multi-property transition.

**The Challenge:**
Framer Motion applies all `exit` properties simultaneously at the start of the exit animation. Even with `transition: { delay: X }`, the initial state (e.g., `height: 0`) is applied immediately, causing an instant visual jump.

**The Solution: Nested Motion Divs**
Wrap the card content in two `motion.div` elements, each responsible for a different aspect of the animation:

```tsx
// OUTER: Height/margin collapse (delayed)
<motion.div
  exit={{
    height: 0,
    marginBottom: 0,
    overflow: 'hidden', // Only apply during exit
    transition: { delay: 0.1, duration: 0.2 }
  }}
>
  {/* INNER: Slide and fade (immediate) */}
  <motion.div
    exit={{
      x: '100%',
      opacity: 0,
      transition: { duration: 0.5 }
    }}
  >
    {/* Card content */}
  </motion.div>
</motion.div>
```

**Critical Details:**
1.  **No `overflow: hidden` on outer during normal state** — it would clip box-shadow pulse animations.
2.  **Apply `overflow: hidden` only in the `exit` transition** — this allows height collapse to clip content cleanly.
3.  **Outer handles layout properties** (height, margin) with delay.
4.  **Inner handles visual properties** (x, opacity) immediately.

**Reference:** See `Animation-spec.md` for complete timing values and file locations.

---
