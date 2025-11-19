# Safety Check App: PWA Prototype

This project is a high-craft prototype for a mobile-first Progressive Web App (PWA) designed for the eSupervision Safety Check workflow. It is built upon a robust foundation of modern web technologies and a professional-grade styling architecture to facilitate rapid design and interaction testing.

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

## 3. Prototype Features

-   **Simulated Login/Logout:** A complete start-of-shift session workflow. This includes secure, client-side validation, a generic, enumeration-resistant error for failed credentials, and a developer shortcut.
-   **State Persistence:** The application mimics native behavior by persisting the user's session, view preferences (List vs. Card), and completed checks across page reloads.
-   **High-Performance Render Engine:** A centralized heartbeat system drives the countdown timers for safety checks, ensuring 60fps scrolling performance even with dozens of active timers.
-   **High-Craft Navigation Model:** The application uses a dual-pattern navigation system.
    -   **Push Layout (Side Menu):** The main navigation menu uses a "push" animation. It features a prominent, card-styled **Context Switcher** at the top.
    -   **Film Strip (Dashboards):** The primary workspaces (Time-Sorted and Route-Sorted Schedules) exist on a horizontal "film strip." Switching between them uses a sliding panel animation.
-   **Multi-Sensory Feedback:** The application goes beyond visual cues to implement a tangible user experience. It combines **Haptic Feedback** (via `navigator.vibrate`) with **Synthesized Audio** (via Web Audio API) to provide confirmation for scans, saves, and errors. The audio system uses client-side synthesis to ensure zero latency and offline reliability without external asset dependencies.
-   **Dynamic Check Schedule:** A performant list of checks with live timers and two sorting modes (Time and Route). The list features a high-craft, multi-stage completion animation.
-   **Core Scan-to-Save Workflow:** An end-to-end flow for recording check outcomes.
    -   **Smart Simulation:** The scan workflow logic is context-aware. When testing, the "Simulate Success" action intelligently identifies the top-priority check based on the current view (Route vs Time) to ensure deterministic demos.
    -   **Resilient Form State:** A "Drafts" system automatically caches form data. If a user accidentally navigates back or cancels, their data is preserved upon return, preventing frustration.
-   **Multi-Resident Check Form:** The check recording form supports rooms with multiple residents, including a "Set All" convenience feature and a visually distinct UI for residents with special classifications.
-   **Sophisticated Modal System:** The app employs a multi-tiered modal strategy (Full-Screen for immersion, Bottom Sheet for context) to optimize user experience.
-   **Simulated Admin Tools:** A dedicated settings area for administrative tasks, including a complete UI simulation for provisioning room NFC tags. When in **NFC Mode**, the main application footer transitions to a passive "Ready to Scan" state with a pulsating indicator, mimicking native NFC behavior.
-   **Simulated Connection Status:** A developer toggle simulates 'Online' and 'Offline' states. The prototype includes a complete UI simulation for the offline workflow, where checks are queued and synced when connectivity is restored.

## 4. Directory Structure

-   **/src**: Contains the application entry point, root container, global styles, and global types.
-   **/src/features**: Contains the major, user-facing areas of the application, organized into "vertical slices" of functionality.
-   **/src/components**: Contains only **truly generic and reusable** UI primitives that are application-agnostic.
-   **/src/data**: A consolidated directory for all non-visual logic and definitions (Jotai atoms, custom hooks, etc.). It includes a `/src/data/mock` subdirectory that decouples the raw mock data definitions from the state atoms.
-   **/src/styles**: Contains the global styling architecture, including design tokens, base styles, and component themes.

**Import Rule:** Always use relative paths (`./`, `../`). This project does not use TypeScript path aliases.

## 5. Styling Architecture

The project uses a **systematic CSS architecture** organized into layers to control specificity and promote a cohesive design language.

-   **Design Tokens:** A three-tiered token system (`primitives.css`, `utility.css`, `semantics.css`).
-   **Layered Cascade:** The global style cascade is managed in `src/styles/index.css` using CSS `@import ... layer()`.
-   **Mobile-First Interaction States:** The application differentiates between touch and mouse-based interactions. `:active` provides immediate feedback for touch, while `:hover` is treated as a progressive enhancement for pointers.

## 6. State Management

The project uses **Jotai** for its minimal, atomic state management model. State is divided into three logical tiers:

1.  **Persisted State (`src/data/atoms.ts`):** Uses `atomWithStorage` to handle data that must survive a reload, such as the User Session, App Configuration, and View Preferences.
2.  **App Data (`src/data/appDataAtoms.ts`):** Manages the core business logic (e.g., the Safety Checks list). This layer subscribes to the temporal state to recalculate statuses efficiently.
3.  **Temporal State (The Heartbeat):** A centralized `requestAnimationFrame` loop in `App.tsx` drives two global atoms:
    *   `fastTickerAtom` (100ms): For smooth UI countdowns.
    *   `slowTickerAtom` (1000ms): For business logic updates.