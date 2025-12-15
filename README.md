# eProbation Safety Check: PWA Prototype

This project is a high-craft prototype for a mobile-first Progressive Web App (PWA) designed for the eProbation Safety Check workflow. It is built upon a robust foundation of modern web technologies and a professional-grade styling architecture to facilitate rapid design and interaction testing.

---

## 1. Core Principles

-   **Mobile-First Design:** Layouts, components, and interactions are designed for touch-based devices first, then gracefully enhanced for larger screens.
-   **High-Craft UI:** All interactions are designed to be smooth, intuitive, and visually polished, leveraging performant animations and a consistent design language.
-   **Component-Based Architecture:** The UI is composed of small, reusable, and accessible components built on top of Radix UI primitives.
-   **Atomic State Management:** Global state is managed with Jotai, ensuring a minimal, performant, and predictable state layer.
-   **Rapid Design Prototyping:** The application is built to test and validate multiple UX patterns quickly. Key features, like the main layout, are toggleable to allow for direct comparison.

## 2. Technology Stack

-   **Build Tool:** Vite
-   **Framework:** React 18
-   **Language:** TypeScript
-   **Styling:** Global CSS with a layered cascade (`@layer`), design tokens, and data-attribute styling.
-   **State Management:** Jotai (Core), Jotai Utils (Storage)
-   **Animation:** Framer Motion
-   **UI Primitives:** Radix UI
-   **Bottom Sheet Modals:** Vaul

### Performance Optimization

-   **Lazy Loading:** Major application states (`AppShell`, `LoginView`) are code-split using `React.lazy()` and `Suspense` to reduce initial bundle size.
-   **Manual Chunk Splitting:** Vendor libraries are strategically divided into separate chunks (`vendor-react`, `vendor-ui`, `vendor-heavy`) to optimize caching and reduce time-to-interactive.
-   **Critical Path Assets:** The login/splash screen uses inline SVG icons (`CriticalIcons.tsx`) to render instantly without waiting for the 5MB Material Symbols font. The full icon font loads asynchronously in the background.
-   **Font Loading Strategy:** Self-hosted fonts (`/fonts/`) with `font-display: block` for icons (prevents ligature text flash) and `font-display: swap` for text fonts.
-   **Inline Critical CSS:** `index.html` contains inline `<style>` for background colors and dark mode detection, ensuring instant visual feedback before React hydrates.
-   **PWA Manifest Polish:** `vite.config.ts` manifest includes matching `background_color` and `theme_color` to prevent splash screen color mismatches.
-   **Cinematic Splash Transition:** Lazy-loaded components use `withMinDelay` wrapper (500ms minimum for LoginView) to prevent animation wobble. The splash and login share a Framer Motion `layoutId` for seamless logo handoff. Title and form fields use staggered entry animation (300ms delay after logo settles).
-   **SEO & Accessibility:** Includes meta description and semantic HTML landmarks for improved discoverability and screen reader support.

## 3. Prototype Features

-   **Installable PWA:** A progressive web app configuration that allows the prototype to be installed on home screens, with offline-ready assets ensuring the app loads instantly even without a network.
-   **Simulated Login/Logout:** A complete start-of-shift session workflow. This includes secure, client-side validation and a generic, enumeration-resistant error for failed credentials.
-   **Sequential Context Selection:** Upon login, the user enters a mandatory, full-screen **Drill-Down Navigation** flow to select their Facility (Group) and Unit. This replaces traditional dropdowns with a native-style "Push/Pop" page transition pattern.
-   **State Persistence:** The application mimics native behavior by persisting the user's session, view preferences (List vs. Card), and completed checks across page reloads.
-   **Resilient Form Drafts:** A robust draft system automatically caches form data to local storage. If a user accidentally navigates away or closes the browser, their work is preserved upon return.
-   **High-Performance Render Engine:** A centralized heartbeat system drives the countdown timers for safety checks, ensuring 60fps scrolling performance even with dozens of active timers.
-   **High-Craft Navigation Model:** The application uses a multi-pattern navigation system optimized for different hierarchies:
    -   **Push Layout (Side Menu):** The main navigation menu uses a simple "push" animation.
    -   **Film Strip (Dashboards):** The primary workspaces (Time-Sorted vs Route-Sorted) exist on a horizontal "film strip" with sliding panel animations.
    -   **Intent-Based Gestures:** A sophisticated gesture engine distinguishes between vertical scrolling and horizontal navigation swipes, allowing full-screen gestures without blocking content interaction.
    -   **Persistent Chrome:** The application header and footer remain stable during view transitions, preventing layout shifts.
    -   **Full-Screen User Settings:** A dedicated, immersive modal for managing appearance, avatar, and app preferences, replacing standard dropdowns for a "High-Craft" feel.
-   **Sensory Feedback System:** A decoupled, accessible feedback engine provides tangible confirmation for user actions.
    -   **Haptics:** Granular vibration patterns (success, warning, selection) triggered via `useHaptics`.
-   **Developer Simulation Tools:** A suite of tools to simulate various conditions for testing:
    -   **Hardware Failure:** Simulate Camera or NFC reader failures.
    -   **Simulation Toggles:**
        -   Force Camera Failure (`HardwareSimulation`): Intercepts camera startup to display error overlays.
        -   Force NFC Failure (`HardwareSimulation`): Intercepts NFC scans to trigger error feedback.
    -   **Lifecycle Stress Test (A-Wing):** The A-Wing mock data is specifically configured with staggered checks (30s intervals) to test every lifecycle boundary (Early->Pending, Pending->Due, Due->Missed, Missed Rollover) in under 60 seconds.
    -   **Network Status:** Toggle between Online, Offline, and Syncing states.
    -   **Toast Playground:** A dedicated grid to trigger and visualize all application toast notifications and their variants.
    -   **NFC Simulation Controls:** Interactive buttons within the NFC workflow to force specific outcomes (Success, Network Error, Tag Locked) for edge-case testing.
-   **Late Check Visual Language:** A comprehensive suite of ambient and micro-interaction effects that activate when checks become overdue, creating progressive urgency without overwhelming the user:
    -   **Global Pulse Effects:** Header and footer glassmorphic surfaces pulse to indicate urgency, using the **WAAPI Zero-Time Protocol** for perfect synchronization.
    -   **Vignette Overlay:** A directional red glow emerges from the top of the viewport, concentrating visual attention on late items.
    -   **Card Effects:** Late cards feature visual treatments to demand attention, including **Basic Pulse** (opacity breath), **Magma Gradient** (flowing red background), and **Fluid Borders**.
    -   **Badge Pulse:** Status badges throb in sync with the global animation clock.
    -   **Jump FAB:** Context-aware floating action button that appears only on the main schedule list, scrolling to the first late check.
-   **Core Scan-to-Save Workflow:** An end-to-end flow for recording check outcomes with context-aware simulation logic for rapid testing.
-   **Manual Check Workflow:** A streamlined flow where selecting a room manually bypasses the scanner and navigates directly to the check entry form, respecting user intent.
-   **Simulated Admin Tools & Offline Mode:** Complete UI simulations for NFC tag provisioning and offline data synchronization workflows.
-   **Future Ideas Playground:** Experimental features (Haptics, Enhanced Avatar, Visual Effects) are gated behind a secure unlock (Konami Code or 7-tap on logo). Unlocking applies a curated "Dave's Favorites" preset: **Light Mode** with Haptics, Audio, Enhanced Avatar, and Invert Badge **ON**; pulse effects **OFF**. Locking performs a strict reset to defaults.


## 4. Directory Structure

-   **/src**: Contains the application entry point, root container, global styles, and global types.
-   **/src/features**: Contains the major, user-facing areas of the application, organized into "vertical slices" of functionality.
-   **/src/components**: Contains only **truly generic and reusable** UI primitives that are application-agnostic.
-   **/src/data**: A consolidated directory for all non-visual logic and definitions (Jotai atoms, custom hooks, contexts).
-   **/src/styles**: Contains the global styling architecture, including design tokens, base styles, and component themes.

**Import Rule:** Always use relative paths (`./`, `../`). This project does not use TypeScript path aliases.

## 5. Styling Architecture

The project uses a **systematic CSS architecture** organized into layers to control specificity and promote a cohesive design language.

-   **Design Tokens:** A three-tiered token system (`primitives.css`, `utility.css`, `semantics.css`).
-   **Layered Cascade:** The global style cascade is managed in `src/styles/index.css` using CSS `@import ... layer()`.
-   **Z-Index Layering Strategy:** A strict hierarchy is enforced to prevent visual bleeding during transitions:
    -   **Content (1):** Standard scrolling views.
    -   **Chrome (50):** App Header, Footer, and Offline Banner.
    -   **Navigation (100):** Side Menu and Backdrops.
    -   **Overlays (105):** Full-screen tools (Scanner, NFC Writer, Forms) that must cover everything.
    -   **Sheets (110+):** Bottom sheet modals that must sit atop overlays.
    -   **Sheets (110+):** Bottom sheet modals that must sit atop overlays.
-   **Mobile-First Interaction States:** The application differentiates between touch and mouse-based interactions. `:active` provides immediate feedback for touch, while `:hover` is treated as a progressive enhancement for pointers.
-   **Unified List Patterns:** The application uses a strict "Golden Row" pattern (`list.css`) for all selectable lists, ensuring consistent touch targets (56px) and full-width separators.
-   **Typography enforcement:** Relies on a strict token contract (`--font-size-*`) and specific weight system (400/600 primarily) to maintain a clean, high-DPI friendly hierarchy.


## 6. State Management

The project uses **Jotai** for its minimal, atomic state management model. State is divided into four logical tiers:

1.  **Persisted State (`src/data/atoms.ts`):** Uses `atomWithStorage` to handle data that must survive a reload (Session, Config, Preferences).
2.  **App Data (`src/data/appDataAtoms.ts`):** Manages the core business logic (Safety Checks list).
3.  **Temporal State (The Heartbeat):** A centralized `requestAnimationFrame` loop in `App.tsx` drives UI countdowns and business logic updates.
4.  **Sensory State:** Haptics are triggered via the `useHaptics` hook, which reads the global `hapticsEnabled` config before firing.
