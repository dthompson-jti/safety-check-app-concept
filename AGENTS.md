# Agent Charter & Execution Protocol

This document defines the operating protocol for AI agents working on the Screen Studio codebase. Its purpose is to maximize the probability of a correct, complete, and architecturally sound "one-shot" outcome for any given task.

## Prime Directive: One-Shot Excellence

The agent's primary goal is to deliver a complete and correct solution in a single response, minimizing the need for iterative correction. This is achieved by adhering to three pillars:

1.  **Holistic Analysis:** Before writing code, the agent must ingest and synthesize **all** provided context: the user's request, the PRD, the project `README.md`, `CSS-PRINCIPLES.md`, and all relevant existing code files.
2.  **Systematic Diagnosis:** When faced with a bug, the agent must not guess. It must systematically form multiple hypotheses, gather evidence, and select a solution that addresses the root cause.
3.  **Comprehensive Delivery:** A "one-shot" response is not just code. It is a complete solution package, including all necessary file operations, code modifications, documentation updates, and a strategic verification plan.

## Standard Execution Algorithm (Internal)

For any non-trivial task (e.g., implementing a PRD), the agent must follow this internal thought process *before* generating the final output:

1.  **Ingestion & Synthesis:** Read and fully comprehend the entire user request and all context files.
2.  **Impact Analysis & Dependency Mapping:** Create a definitive list of all files that will be **Created, Read, Updated, or Deleted (CRUD)**.
3.  **Virtual Refactoring (The Mental Walkthrough):**
    *   **Example Simulation (The Render Cycle):** *"I need to implement a countdown timer. A naive approach is to use `setInterval` inside the component. Hypothesis: With 50 items, this creates 50 active intervals, causing React thrashing. The correct architecture is to subscribe to the global `fastTickerAtom`."*
    *   **Example Simulation (The Notification Storm):** *"I need to alert on missed checks. A naive approach is to toast every time a check expires. Hypothesis: If the device wakes after 30 minutes, 50 checks expire at once, flooding the UI. The correct architecture is Tick-Based Aggregation: collect all expiries in a single tick and dispatch one summary toast."*
    *   **Example Simulation (Persistence Strategy):** *"I am adding a new user preference. Should this reset on reload? If no, I must use `atomWithStorage`. If yes, a standard `atom` is sufficient. I must clarify this distinction in the implementation."*
    *   **Example Simulation (The Environment-Agnostic Timer):** *"I need to store a timer ID. A naive approach is `NodeJS.Timeout`. Hypothesis: This will throw TS2503 in browser environments. The correct architecture is to use `ReturnType<typeof setTimeout>`."*
    *   **Example Simulation (The Developer Override):** *"I am building a simulation flow (e.g., NFC). It has an auto-advance timer. I also need manual buttons for error testing. The correct architecture is to ensure manual interaction cancels the auto-timer immediately to prevent race conditions."*
    *   **Example Simulation (Sensory Cohesion):** *"I am adding a 'Save' action. A visual change is not enough. The correct architecture is to trigger a haptic pulse (`useHaptics`) to provide tangible confirmation, respecting the user's global configuration."*
    *   **Example Simulation (The Mobile Keyboard):** *"I am building a full-screen form. A naive approach is `height: 100vh`. Hypothesis: On mobile, the keyboard will slide up and cover the bottom 40% of the view, hiding the submit buttons. The correct architecture is to use the Visual Viewport API to determine the true visible height and set a CSS variable (`--visual-viewport-height`), ensuring the footer docks perfectly above the keyboard."*
    *   **Example Simulation (Frame Painting / The "Barn Door" Effect):** *"I need to change an animation direction state right before closing a modal. A naive approach is `setDirection('left'); setIsOpen(false);`. Hypothesis: React batching will unmount the component before the direction update paints, causing the wrong exit animation. The correct architecture is to use a nested `requestAnimationFrame` to force a paint frame before triggering the unmount."*
    *   **Example Simulation (List Stability / The "Ghost Item"):** *"I need to animate a list item freely leaving the screen. A naive approach is to filter it out of the data immediately. Hypothesis: This causes the item to vanish instantly or the list to jump. The correct architecture is to KEEP the item in the list (`AnimatePresence` requirement) but use a **Computed Display Group** (based on its original timestamp) to anchor it in place visually until the exit animation completes."*
    *   **Example Simulation (Sequenced Exit Animation / The "Nested Motion Divs"):** *"I need a card to slide out THEN collapse height. A naive approach is to put both `x: '100%'` and `height: 0` in the same `exit` prop with delays. Hypothesis: Framer Motion applies the initial frame immediately, causing an instant height jump even with delay. The correct architecture is to use **two nested motion.divs**: outer for height collapse (delayed), inner for slide/fade (immediate). See `Animation-spec.md`."*
    *   **Example Simulation (Overflow Clipping Box-Shadow):** *"I have a success pulse animation using `box-shadow`. A naive approach is to use `overflow: hidden` on the parent for layout control. Hypothesis: `overflow: hidden` clips content extending beyond the box, including box-shadow. The correct architecture is to avoid permanent `overflow: hidden` on animated elements, or apply it only during specific animation phases (e.g., in the `exit` transition)."*

## UI & Component Standards

### 1. High-Precision Implementation
*   **Verify Paths First:** never guess file locations. Always verify path existence (e.g., `src/types.ts` vs `src/data/types.ts`) before importing or editing to prevent build errors.
*   **Holistic Fixes:** Do not patch a symptom. Trace the root cause (e.g., if a style is missing, check the global theme variables first).
*   **Lint Proactively:** Run `npm run lint` immediately after making structural changes (moving files, refactoring atoms).
*   **Error Feedback Standard:** User-facing errors must follow the `[Problem].\n[Actionable Solution].` pattern (e.g., "Camera not responding.\nTry restarting your device."). Use the `alert` variant for blocking errors.

### 2. List Items
*   **Directive:** Do not create custom list item components (e.g., `MyFeatureListItem`, `RoomRow`).
*   **Solution:** Always use the `ActionListItem` component.
*   **Reasoning:** Enforces the "Golden Row" pattern (56px height, consistent padding, full-width separators) defined in `list.css`.

### 2. Context Switching
*   **Directive:** When displaying the Facility Group/Unit selector, use the `ContextSwitcherCard` component.
*   **Reasoning:** Ensures consistency between the Side Menu and the NFC Provisioning workflow.

### 3. Icons
*   **Material Symbols Rounded:** Use for icons inside the authenticated app shell.
    *   **Small / UI Icons (24px):** Filled (`font-variation-settings: 'FILL' 1`) for active/prominent states.
    *   **Large / Hero Icons (48px+):** Outlined (`font-variation-settings: 'FILL' 0`) for Success/Error status screens.
*   **Critical Icons (SVG):** The login screen and splash view use SVG components from `CriticalIcons.tsx` to avoid blocking on the 5MB font download.
    *   `JournalLogo` - Brand logo with wordmark (splash/login header)
    *   `ErrorIcon` - Form validation errors
*   **Color:**
    *   Leading icons in lists: `var(--surface-fg-quaternary)`.
    *   Interactive icons: `var(--surface-fg-secondary)` (default) or `var(--surface-fg-primary)` (active).

### 4. Segmented Controls & Toggle Groups
*   **Directive:** Use `SegmentedControl` for all multi-option selectors with 2-7 options.
*   **Layout Options:**
    *   `layout="row"` (default): Horizontal button group.
    *   `layout="column"`: Vertical stack with left-aligned text.
    *   `layout="grid"`: 2-column grid for 4+ options.
*   **Item Direction:**
    *   `itemDirection="row"` (default): Icon + Label horizontally (side-by-side).
    *   `itemDirection="column"`: Icon above Label (vertically stacked, centered).
*   **Anti-Pattern:** Do not use `IconToggleGroup` when labels are needed. `SegmentedControl` is the unified component that supports both icon-only and icon+label patterns.
*   **Example:**
    ```tsx
    <SegmentedControl
      options={[
        { value: 'qr', label: 'QR Code', icon: 'qr_code_2' },
        { value: 'nfc', label: 'NFC', icon: 'nfc' },
      ]}
      value={scanMode}
      onValueChange={setScanMode}
      itemDirection="column"  // Icon above label
    />
    ```

### 5. Import Hygiene
*   **Directive:** When replacing a component (e.g., `IconToggleGroup` → `SegmentedControl`), **always remove the obsolete import** in the same commit.
*   **Why:** Unused imports cause lint errors (`'IconToggleGroup' is defined but never used`) and create confusion for future maintainers.
*   **Pattern:** After making component substitutions, verify all imports at the top of the file are actively used.

### 6. Sheets & Drawers (Vaul)
*   **Directive:** Use the standard overlay structure:
    *   **Handle:** If using `Drawer.Root` directly (bypassing `BottomSheet` wrapper), you **must** manually implement the handle bar (`.handleContainer` + `.handle`) to ensure visual consistency.
    *   Header: Fixed height (60px), `sticky` or fixed positioning.
    *   Content: Scrollable area with `padding: 0` if containing a list (to allow edge-to-edge separators).
    *   Footer: Fixed/Sticky at bottom if containing actions.

### 7. Form Sections & Spacing
*   **Directive:** When adding new sections to forms (like `CheckEntryView`), rely on the parent container's `gap` property for inter-section spacing.
*   **Anti-Pattern:** Do not add `margin-bottom` to section containers when the parent already uses `gap`. This causes double-spacing.
*   **Section Headers:** Use the `.sectionHeader` class (0.8rem, 600 weight, `--surface-fg-secondary` color) for form section labels.
*   **Dividers:** If a visual separator is needed, use `border-bottom: 1px solid var(--surface-border-secondary)` with symmetric `padding-bottom`. Do not add `margin-bottom`—the parent `gap` handles spacing to the next item.

## CSS Architecture
*   **Directive:** Prefer CSS Modules (`*.module.css`) for feature-specific styles. Use Global CSS (`src/styles/*.css`) only for reusable design patterns (buttons, lists, inputs).

## 9. Bundle Optimization & Performance

### Lazy Loading Strategy
*   **Directive:** Major application states that represent distinct user flows should be lazy-loaded using `React.lazy()` with `Suspense`.
*   **Pattern (Named Exports):**
    ```tsx
    // Named exports need explicit default mapping
    const AppShell = lazy(() => import('./AppShell').then(m => ({ default: m.AppShell })));
    const LoginView = lazy(() => import('./features/Session/LoginView').then(m => ({ default: m.LoginView })));
    
    // Wrap in Suspense with themed fallback
    <Suspense fallback={<LoadingSpinner />}>
      {isAuthenticated ? <AppShell /> : <LoginView />}
    </Suspense>
    ```
*   **When to Use:** Authentication boundaries, admin tools, developer modals, or any feature used by <50% of users.
*   **When NOT to Use:** Components in the critical render path (headers, core UI primitives, state management).

### Vite Code Splitting (Manual Chunks)
*   **Directive:** When building for production, use `manualChunks` in `vite.config.ts` to separate vendor libraries by update frequency and size.
*   **Pattern:**
    ```ts
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'jotai'],
            'vendor-ui': ['@radix-ui/*'],  // All Radix packages
            'vendor-heavy': ['framer-motion', '@yudiel/react-qr-scanner'],
          }
        }
      }
    }
    ```
*   **Reasoning:**
    - `vendor-react`: Core framework (rarely changes, highly cacheable)
    - `vendor-ui`: UI primitives (moderate update frequency)
    - `vendor-heavy`: Large animation/feature libraries (defer loading when possible)

### Font Performance & Critical Path Assets
*   **Self-Hosted Fonts:** Fonts are served from `/public/fonts/` to enable offline PWA support.
*   **Async Loading for Heavy Fonts:** Material Symbols (~5MB) uses `fetchpriority="low"` preload to avoid blocking initial render.
*   **Critical Icons Pattern:** Login screen uses inline SVGs from `CriticalIcons.tsx` (`JournalLogo`, `ErrorIcon`) to render instantly.
*   **Brand Logo Token:** `--brand-logo-text` CSS variable adapts logo wordmark text: dark grey in light mode, white in dark modes.
*   **Shared LayoutId Transition:** Both `SplashView` and `LoginView` use matching `layoutId` props for cinematic Framer Motion handoff:
    ```tsx
    // SplashView.tsx
    <motion.div layoutId="app-logo"><JournalLogo size={144} /></motion.div>
    <motion.h3 layoutId="app-title">Safeguard</motion.h3>

    // LoginView.tsx - logo/title animate from center to header
    <motion.div layoutId={isExiting ? undefined : "app-logo"}><JournalLogo size={144} /></motion.div>
    <motion.h3 layoutId={isExiting ? undefined : "app-title"}>Safeguard</motion.h3>
    ```
*   **Conditional LayoutId on Exit:** Set `layoutId={undefined}` when triggering navigation to AppShell to prevent logo distortion during unmount.
*   **Minimum Splash Time:** Wrap lazy imports with `withMinDelay(promise, 500)` to ensure splash displays long enough for smooth animation:
    ```tsx
    const withMinDelay = <T,>(promise: Promise<T>, minMs: number): Promise<T> =>
      Promise.all([promise, new Promise(r => setTimeout(r, minMs))]).then(([result]) => result);
    const LoginView = lazy(() => withMinDelay(import('./features/Session/LoginView'), MIN_SPLASH_MS));
    ```
*   **Staggered Form Entry:** Use Framer Motion `variants` with `staggerChildren` for sequential form field fade-in.
*   **DelayedFallback Component:** Wraps Suspense fallback to only show after 200ms delay, preventing spinner flash on fast loads.
*   **index.html Inline CSS:** Critical background colors, dark mode detection, and the full Journal logo SVG are inlined for instant render.

### Dead Code Elimination
*   **Directive:** Before adding a new dependency, verify it will be actively used. Periodically audit `package.json` for unused libraries.
*   **Pattern:** Use `grep` to verify usage across `src/`: `grep -r "from 'library-name'" src/`
*   **Recent Example:** `gsap` was removed after confirming zero imports (saved ~50KB).

## 10. Common Pitfalls & Architectural Lessons

### Time-Based Logic & Race Conditions
*   **Lesson:** When deriving status from time (e.g., `elapsedMinutes < 15`), always account for the **gap** between the derived state and the side-effect trigger (e.g., `useCheckLifecycle`).
*   **Pattern:** If a side-effect (like "Mark Missed") triggers at `T=15m`, the UI derivation for the `14:59 -> 15:00` transition must be defensive. Force the "Missed" visual state immediately at `T=15` rather than falling back to a default "Pending" state if the side-effect is slightly delayed.

### Mock Data as Testing Infrastructure
*   **Lesson:** Do not fill mock data with random noise. Use it to construct **deterministic stress tests**.
*   **Pattern:** See `src/data/mock/checkData.ts` (A-Wing). Configured checks just seconds before major transitions allow for rapid visual verification of the entire lifecycle without waiting 15 minutes.

### Terminology Precision
*   **Lesson:** User-facing terminology is a strict spec.
*   **Pattern:** "Due" means "Due". Do not use "Due Now", "Due Soon", or "Due!" unless explicitly specified. Removing variations reduces cognitive load.

### React Hooks vs. Raw Atoms
*   **Lesson:** When an atom has a side-effect (like updating the DOM), **never** use the raw atom setter directly. You must use the abstraction hook.
*   **The Bug:** `const setTheme = useSetAtom(themeAtom)` updates the state but fails to trigger the `useEffect` that applies `data-theme` to the `document.body`.
*   **The Fix:** Always use `const { setTheme } = useTheme()`. This ensures the side-effect (DOM update) fires correctly.

### Feature Flag Presets
*   **Lesson:** For "Demo" or "Playground" modes, distinct "Unlock" and "Lock" actions are safer than individual toggles.
*   **Pattern:**
    *   **Unlock:** Applies a curated "Best View" preset (e.g., Dark C + Haptics + Glass Tint).
    *   **Lock:** Performs a **strict reset** to a known safe state (Light Mode, All Flags Off).
    *   **Implementation:** See `src/data/featureFlags.ts` -> `lock()` / `unlock()`.

### Dark Mode Token Hygiene
*   **Directive:** When styling any themed element (badges, warnings, selected states, glows), **always use semantic tokens** from `semantics.css`, never primitive tokens directly.
*   **Why Primitives Fail:** Tokens like `var(--primitives-yellow-100)` are optimized for light mode (L≈95%). In dark mode, they remain unchanged, creating jarring bright spots.
*   **Anti-Pattern:**
    ```css
    /* WRONG - hardcoded primitive, won't adapt */
    box-shadow: 0 0 0 2px var(--primitives-yellow-100);
    background: var(--primitives-red-50);
    ```
*   **Correct Pattern:**
    ```css
    /* CORRECT - semantic token adapts per theme */
    box-shadow: 0 0 0 2px var(--surface-bg-warning-secondary);
    background: var(--surface-bg-error-primary);
    ```
*   **Semantic Token Selection (Primary Controls):**
    -   **Backgrounds:** Use `theme-800` (Dark) instead of `theme-700` (Light) for Primary Buttons.
    -   **Foregrounds:** Use `grey-50` (Dark) instead of `white` (Light) for text on Primary Buttons.
*   **Verification Rule:** If you add a new semantic token pairing, you **MUST** verify it meets WCAG AA (4.5:1) in all themes (`dark-a`, `dark-b`, `dark-c`). Use the `contrast_audit.cjs` script if unsure.
*   **Reference:** See `docs/SPEC-Dark-Mode.md` for full token mapping tables.

### Animation Synchronization Patterns
*   **Lesson:** CSS animations with constantly updating `animation-delay` values (e.g., via CSS variables updated every frame) will restart the animation on each update, causing jittery, non-periodic behavior.
*   **Anti-Pattern:**
    ```tsx
    // WRONG - updates every 24fps, restarts animation constantly
    useEffect(() => {
      const interval = setInterval(() => {
        document.body.style.setProperty('--anim-offset', `${-(Date.now() % 1200)}ms`);
      }, 42); // 24fps
    }, []);
    ```
    ```css
    .badge { animation-delay: var(--anim-offset); }
    ```
*   **Correct Pattern (Mount-Time Sync with Unified Base):**
    ```tsx
    // CORRECT - use shared 1200ms base for ALL animations
    const ANIMATION_SYNC_BASE_MS = 1200;
    const syncDelay = useMemo(() => -(Date.now() % ANIMATION_SYNC_BASE_MS), []);
    return <div style={{ animationDelay: `${syncDelay}ms` }} />;
    ```
*   **Why It Works:** All components sync to the same 1200ms clock. Animations with different periods (badge 1.2s, border 2.4s, magma 4s) phase-lock at regular intervals, preventing drift.
*   **Critical:** All components MUST use the same base period (1200ms) even if their animation duration is different (e.g., 2.4s animation still uses 1200ms sync base).
*   **When to Use:** Any time you need multiple independently-mounted components to animate in perfect unison (e.g., badge pulses, card border glows, glass tint breathing).

### Lint Prevention & TypeScript Hygiene
*   **Unused Imports:** When replacing a component (e.g., `ShieldIcon` → `JournalLogo`), **always remove the obsolete import** in the same commit, or lint will fail with `'X' is defined but never used`.
*   **Floating Promises:** If a function returns a `Promise` but you intentionally don't await it (e.g., `updateServiceWorker(true)`), mark it explicitly with `void`:
    ```tsx
    // WRONG - lint error: floating promise
    onClick={() => updateServiceWorker(true)}
    
    // CORRECT - explicitly ignored
    onClick={() => void updateServiceWorker(true)}
    ```
*   **Unnecessary Type Assertions:** Do not use `as Type` when TypeScript can already infer the type. ESLint flags this as `@typescript-eslint/no-unnecessary-type-assertion`.
*   **Environment-Agnostic Timer Types:** Use `ReturnType<typeof setTimeout>` instead of `NodeJS.Timeout` to avoid TS2503 in browser environments.

### Pulse Effects Pattern (Global Visuals)
*   **Lesson:** For continuous, global animations (like glass breathing or urgency gradients), avoid React render cycles.
*   **Pattern:**
    1.  **Manager Component:** `PulseEffectsManager.tsx` (Logic only, returns `null`).
    2.  **Data Attribute:** Sets `body[data-glass-pulse="basic|gradient"]` based on state.
    3.  **CSS Subscription:** Components (`.header`, `.footer`) subscribe to the body attribute via CSS selectors.
*   **Why:** Allows a single state update to trigger high-performance, synchronized animations across multiple DOM nodes without re-rendering the component tree.
