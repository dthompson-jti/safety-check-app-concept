# IDEA-001: Late Check Notification System

This document outlines the proposed implementation candidates for the "Late Check" notification system, formatted as individual feature tickets.

---

## IDEA-001-A: The "Pulse-Map" (Unified Density & Signal)
**Priority**: Critical (P0) | **Effort**: Medium | **Visual Impact**: High

### 1. Problem Statement
Users scrolling through long schedule lists (50+ rooms) lose context of "Late" checks that are off-screen. Current "scroll to top" arrows are generic and dumb. Users need global situational awareness without leaving their current task.

### 2. The Solution
Implement a **Heatmap Mini-map** on the right edge of the viewport that acts as both a density visualizer and a navigation tool. Enhance it with the **Ambient Pulse** animation to draw attention when critical.

### 3. Specifications
*   **Location**: Fixed right overlay, `right: 2px`, `width: 4px`, `height: 100%`. Z-index 100.
*   **Visual Logic**:
    *   Map the `listHeight` to the `viewportHeight`.
    *   Render 2px height "Ticks" at relative positions for every check.
    *   **Color Mapping**:
        *   Late (>15m): `var(--surface-error)` (Red)
        *   Due Soon: `var(--surface-warning)` (Orange)
        *   Others: Transparent or very faint grey.
*   **Animation (The Pulse)**:
    *   If `status === 'late'`, the corresponding Tick continuously pulses opacity `0.4` -> `1.0` -> `0.4` (2s duration).
*   **Interaction**:
    *   **Tap**: Scrolls list immediately to that position.
    *   **Drag**: "Scrubbing" the mini-map scrolls the list (like VS Code).

### 4. Technical Considerations
*   **Performance**: Avoid re-calculating positions on every frame. Use a `ResizeObserver` on the list container to map IDs to % positions once.
*   **Haptics**: See *IDEA-001-C*.

---

## IDEA-001-B: Living Background (Atmospheric Vignette)
**Priority**: High (P1) | **Effort**: High | **Visual Impact**: Very High

### 1. Problem Statement
A "Late" check is a critical safety failure, but standard list items often blend together. We need a way to change the *mood* of the application to signal "Alert" without using annoying popups or sirens.

### 2. The Solution
Instead of just styling the card, we implement a **Global Ambient Vignette**. When any check is Late, the global application background (behind the list) transitions to a subtle, animated **Urgency Gradient**.

### 3. Specifications
*   **Visual**:
    *   A CSS `radial-gradient` or mesh at the corners of the viewport.
    *   **Colors**: Deep, desaturated red/charcoal (`#330505` -> `var(--app-bg)`).
    *   **Animation**: The gradient positions slowly drift (perlin noise simulation via CSS translate) to feel "alive".
*   **Trigger Logic**:
    *   `const isCritical = lateCount > 0;`
    *   Transition opacity `0` -> `1` over 1000ms when state changes.
*   **Constraint**: Must not reduce contrast of text readability.

---

## IDEA-001-C: Haptic Ticks (Tactile Feedback)
**Priority**: Medium (P2) | **Effort**: Low | **Visual Impact**: None

### 1. Problem Statement
Professional users often operate the app "eyes-free" or while walking. They need to confirm list status without focusing on the screen.

### 2. The Solution
Augment the **Pulse-Map** (IDEA-001-A) with **Haptic Road Bumps**.

### 3. Specifications
*   **Interaction**:
    *   When the user drags their finger along the Mini-map (Scrubbing):
    *   Trigger `Haptics.impact({ style: 'light' })` when crossing a "Due Soon" tick.
    *   Trigger `Haptics.impact({ style: 'heavy' })` when crossing a "Late" tick.
*   **Scroll**:
    *   When browsing the main list, crossing a "Late" header also triggers a 'heavy' impact.

---

## IDEA-001-D: Jump FAB (Smart Navigation)
**Priority**: Medium (P2) | **Effort**: Low | **Visual Impact**: Medium

### 1. Problem Statement
If a user is 50 items down the list and a new check becomes late at the top, they might miss the Mini-map signal. They need a "One Click Fix".

### 2. The Solution
A floating pill button that appears **conditionally** only when late items are off-screen.

### 3. Specifications
*   **Visual**:
    *   Capsule shape: `40px` height.
    *   Text: "1 Late ↑" or "2 Late ↓".
    *   Color: `var(--surface-error)` background, White text.
    *   Shadow: `var(--shadow-elevation-high)`.
*   **Logic**:
    *   `IntersectionObserver` monitors the Late Cards.
    *   Show FAB if: `totalLate > 0` AND `visibleLate === 0`.
*   **Animation**:
    *   Enter: Slide Up + Fade In (`spring`).
    *   Exit: Scale Down + Fade Out.
*   **Action**:
    *   Clicking smooth-scrolls to the nearest Late item.

---

## Summary of Recommendation
Implement **IDEA-001-A (Pulse-Map)** as the core utility. It solves the navigational problem and the urgency problem simultaneously. Add **IDEA-001-B (Living Background)** if resources allow for a premium "High Craft" feel.
