# SYNC NIGHTMARE: The Unsolved Animation Drift

## Current State
*   **Status**: CRITICAL FAILURE.
*   **Symptoms**:
    *   Header/Footer (Global) animation is permanently out of phase with Cards (Local).
    *   Newly mounted cards do not sync with existing cards or the header.
    *   Only cards mounted at the exact same millisecond appear synchronized.
*   **Observation**: "Nothing is in sync still."

## Persistent Issues

### 1. The "Start Time" Discrepancy
CSS Animations (`keyframe`) start their internal clock (`t=0`) at the moment the `animation-name` property is applied (or the element mounts).
*   **Header**: Starts at App Boot (or when `PulseEffectsManager` activates).
*   **Card**: Starts when the user navigates to the list.
*   **Result**: Even with a calculated `animation-delay` offset, the *application frame* of that delay differs between elements, leading to sub-second or full-second drift depending on execution order.

### 2. The Global vs. Local Mismatch
*   **Global Elements** (`AppHeader`): Controlled via a single `data-glass-pulse` attribute on `<body>` and a shared `--glass-sync-delay`. This assumes a "One Size Fits All" delay that is physically impossible to align with cards mounting at arbitrary future times.
*   **Local Elements** (`CheckCard`): Controlled via component-level styles. They calculate their own delay at mount.

### 3. The "Reflow" Fallacy
We attempted to "force restart" the global animation (remove attribute -> reflow -> add attribute) to align it with a new standard time.
*   **Failure**: We cannot guarantee that the reflow happens in the exact same distinct browser paint frame as the card's mount event. A 16ms (1 frame) difference is visible. A 100ms difference (React commit delay) is painful.

## Ideas Explored (and Failed)

### 1. `performance.now()` Clock
*   **Concept**: Use JS time to calculate offset.
*   **Failure Mode**: Tab Backgrounding. JS clock runs, CSS clock stops. Result: Massive drift after sleep.

### 2. `document.timeline` Clock
*   **Concept**: Use Browser's Animation Time to calculate offset.
*   **Failure Mode**: Solved Tab Drift, but revealed the **Activation Drift** (see Issue #1).

### 3. "Dependency Sync" (Activation Hook)
*   **Concept**: Force `PulseEffectsManager` to recalculate the phase exactly when it activates.
*   **Failure Mode**: Still relies on `animation-delay` being applied perfects to a CSS Rule change. Does not account for *new* cards mounting 5 seconds later which calculate a *different modulo*.

### 4. "The Restart Trick" (Reflow)
*   **Concept**: Reboot the CSS animation to force it to accept the new delay.
*   **Failure Mode**: Visual glitching and unreliability. It does not synchronize *existing* cards with the *restarted* header.

## Remaining Options (Objective Evaluation)

### Option A: CSS Trigonometry (Declarative)
*   **Concept**: Abandon `keyframes` and `animation-delay`.
*   **Mechanism**:
    *   Animate a single linear variable `@property --phase` from 0 to 1 on `<body>`.
    *   Use `opacity: calc(0.5 + 0.25 * sin(var(--phase) * 360deg))` on all elements.
*   **Pros**: mathematically impossible to drift. All elements read the same variable.
*   **Cons**:
    *   Requires CSS Houdini (`@property`).
    *   Requires `sin()` function.
    *   Support: iOS 15.4+ (High but not 100%).

### Option B: Web Animations API (Imperative)
*   **Concept**: Abandon CSS Rules. Use JavaScript execution.
*   **Mechanism**:
    *   `const globalTimeline = new DocumentTimeline()`.
    *   Every component registers a Ref.
    *   `element.animate(keyframes, { timeline: globalTimeline, startTime: 0 })`.
*   **Pros**: Explicit compositor control. We tell the browser "Use Frame X".
*   **Cons**: Massive refactor. Moving styles to JS. Memory management of animation handles.

### Option C: The "Tick" Driver (RAF)
*   **Concept**: JavaScript loop updates a CSS variable `--pulse-opacity` every frame.
*   **Mechanism**:
    *   `requestAnimationFrame` -> `document.body.style.setProperty('--pulse-opacity', val)`.
*   **Pros**: Brute force synchronization.
*   **Cons**: Main thread overhead. Style recalculation cost (low for opacity, but non-zero).

### Option D: Remove Global Pulse
*   **Concept**: Admit that perfect cross-component sync via CSS Keyframes is fragile.
*   **Mechanism**: Remove the pulse from the Header/Footer. Keep it only on Cards.
*   **Pros**: Problem solved.
*   **Cons**: Aesthetically "Less Magic".
