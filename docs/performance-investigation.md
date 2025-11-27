### Executive Summary
**Status: STABLE.**
The "Out of Memory" crash and infinite layout loop are **resolved**.
*   **Evidence:** JS Heap is stable at ~74MB (Screenshot 1), Heap Snapshots show negligible growth (Screenshot 2), and Cumulative Layout Shift is 0 (Screenshot 4).
*   **Verification:** The console log "eProbation Prototype v1.2 - Layout Stabilized" confirms the fix is active. "Method 3: No blue flashes" confirms the layout thrashing has stopped.

**New Focus: HIGH CPU USAGE.**
While the app no longer crashes, **Screenshot 1 shows CPU usage at 52.8%**. For a static-looking list, this is too high. This indicates the application is "running hot," which will drain mobile batteries quickly.

---

### Data Analysis of Screenshots

1.  **Performance Monitor (Screenshot 1):**
    *   **CPU (52.8%):** This is the primary concern. It suggests that while we throttled the timer to 10fps, the *cost* of those updates is still expensive, or something else is running continuously.
    *   **DOM Nodes (691):** Very healthy. The DOM is not bloated.

2.  **Memory Snapshots (Screenshot 2):**
    *   **Growth (+2.9MB):** Negligible. This is normal allocation for opening a modal. Garbage collection is working correctly. **Memory leaks are ruled out.**

3.  **Performance Timeline (Screenshot 3):**
    *   **Pattern:** The timeline is dense with yellow (Scripting) and purple (Rendering) blocks.
    *   **Interpretation:** The browser is constantly working. There are no massive "Long Tasks" (red triangles), but there is a "Death by 1000 Cuts" scenario where hundreds of tiny updates are filling the main thread.

4.  **Lighthouse (Screenshot 4):**
    *   **Score (91):** Excellent. The app loads fast and layout is stable. The issue is purely runtime efficiency, which Lighthouse doesn't heavily penalize if it doesn't block the initial load.

---

### Investigation Plan (Diagnostic Only)

We need to isolate *what* is consuming that 52% CPU.

#### 1. Isolate the Ticker Cost (React Profiler)
We need to see if the 10fps timer is causing just the text to update, or if it's forcing the entire `CheckCard` or `ScheduleView` to re-render.
*   **Action:** Install/Open **React Developer Tools** (Components/Profiler tab) in Chrome.
*   **Step:** Go to the **Profiler** tab -> Click the **Gear Icon** -> Enable **"Highlight updates when components render"**.
*   **Observation:**
    *   **Good:** Only the tiny time text inside the card flashes.
    *   **Bad:** The entire Card, or the entire List, flashes every 100ms.

#### 2. Identify "Layout Thrashing" via Framer Motion
Framer Motion's `layout` prop triggers expensive calculations whenever a component changes size or position.
*   **Hypothesis:** The `TimeDisplay` changing text width (e.g., "1m 0s" to "59.9s") might be triggering Framer Motion to recalculate the layout for the whole list 10 times a second.
*   **Test:** In the **Performance** tab, look at the **Bottom-Up** tab after a recording. Group by "Activity".
*   **Look for:** High time spent in `updateLayoutProjection` or `measureLayout` (Framer Motion internal functions).

#### 3. Check for Hidden Re-renders (Console Log)
Verify if the `ScheduleView` parent is re-rendering unnecessarily.
*   **Test:** Add a temporary `console.log('ScheduleView Render')` inside the `ScheduleView` component body.
*   **Observation:** If you see this log firing continuously without user interaction, the atoms (filters, search, etc.) might be unstable.

---

### Update Plan (Optimization Strategy)

Based on the likely findings, here is the roadmap to bring CPU usage down from 50% to <5%.

1.  **Implement Virtualization (High ROI):**
    *   Currently, the app renders *all* cards. If you have 50 cards, and 20 are "Due Soon", you have 20 active timers running even if they are off-screen.
    *   **Plan:** Replace the `.map` list in `ScheduleView` with `Virtuoso` (already installed). This ensures only the ~6 visible cards are rendering and running timers.

2.  **CSS Containment (Medium ROI):**
    *   To stop the "Time Text" update from triggering layout calculations up the tree.
    *   **Plan:** Apply `contain: content;` or fixed dimensions to the `TimeDisplay` container so text changes don't trigger a reflow of the parent Card.

3.  **Optimize Framer Motion (Medium ROI):**
    *   If Framer Motion is calculating layout on every tick.
    *   **Plan:** Remove the `layout` prop from `CheckCard` temporarily to test impact, or wrap the `TimeDisplay` in a `layout="position"` wrapper to isolate it.

4.  **Interaction Observer for Timers (High Effort, High ROI):**
    *   **Plan:** Modify `TimeDisplay` to only subscribe to the `throttledTickerAtom` if the component is actually in the viewport. (Note: Virtualization usually solves this automatically).