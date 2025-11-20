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

## 3. Prototype Features

-   **Simulated Login/Logout:** A complete start-of-shift session workflow. This includes secure, client-side validation and a generic, enumeration-resistant error for failed credentials.
-   **Sequential Context Selection:** Upon login, the user enters a mandatory, full-screen **Drill-Down Navigation** flow to select their Facility (Group) and Unit. This replaces traditional dropdowns with a native-style "Push/Pop" page transition pattern.
-   **State Persistence:** The application mimics native behavior by persisting the user's session, view preferences (List vs. Card), and completed checks across page reloads.
-   **Resilient Form Drafts:** A robust draft system automatically caches form data to local storage. If a user accidentally navigates away or closes the browser, their work is preserved upon return.
-   **High-Performance Render Engine:** A centralized heartbeat system drives the countdown timers for safety checks, ensuring 60fps scrolling performance even with dozens of active timers.
-   **High-Craft Navigation Model:** The application uses a multi-pattern navigation system optimized for different hierarchies:
    -   **Push Layout (Side Menu):** The main navigation menu uses a simple "push" animation.
    -   **Film Strip (Dashboards):** The primary workspaces (Time-Sorted vs Route-Sorted) exist on a horizontal "film strip" with sliding panel animations.
    -   **Drill-Down (Hierarchical Data):** Deeply nested selections (like Facility -> Unit) use a "Stack" metaphor where new views slide in from the right, maintaining a sticky header context.
-   **Multi-Sensory Feedback:** The application goes beyond visual cues to implement a tangible user experience. It combines **Haptic Feedback** (via `navigator.vibrate`) with **Synthesized Audio** (via Web Audio API) to provide confirmation for scans, saves, and errors.
-   **Developer Simulation Tools:** A suite of tools to simulate various conditions for testing:
    -   **Hardware Failure:** Simulate Camera or NFC reader failures.
    -   **Network Status:** Toggle between Online, Offline, and Syncing states.
    -   **Workflow Accelerators:** Toggles for "Mark Multiple" (bulk status set), "Simple Submit" (skip animations), and "Manual Confirmation" visibility.
-   **Core Scan-to-Save Workflow:** An end-to-end flow for recording check outcomes with context-aware simulation logic for rapid testing.
-   **Simulated Admin Tools & Offline Mode:** Complete UI simulations for NFC tag provisioning and offline data synchronization workflows.

## 4. Directory Structure

-   **/src**: Contains the application entry point, root container, global styles, and global types.
-   **/src/features**: Contains the major, user-facing areas of the application, organized into "vertical slices" of functionality.
-   **/src/components**: Contains only **truly generic and reusable** UI primitives that are application-agnostic.
-   **/src/data**: A consolidated directory for all non-visual logic and definitions (Jotai atoms, custom hooks, etc.).
-   **/src/styles**: Contains the global styling architecture, including design tokens, base styles, and component themes.

**Import Rule:** Always use relative paths (`./`, `../`). This project does not use TypeScript path aliases.

## 5. Styling Architecture

The project uses a **systematic CSS architecture** organized into layers to control specificity and promote a cohesive design language.

-   **Design Tokens:** A three-tiered token system (`primitives.css`, `utility.css`, `semantics.css`).
-   **Layered Cascade:** The global style cascade is managed in `src/styles/index.css` using CSS `@import ... layer()`.
-   **Mobile-First Interaction States:** The application differentiates between touch and mouse-based interactions. `:active` provides immediate feedback for touch, while `:hover` is treated as a progressive enhancement for pointers.

## 6. State Management

The project uses **Jotai** for its minimal, atomic state management model. State is divided into three logical tiers:

1.  **Persisted State (`src/data/atoms.ts`):** Uses `atomWithStorage` to handle data that must survive a reload (Session, Config, Preferences).
2.  **App Data (`src/data/appDataAtoms.ts`):** Manages the core business logic (Safety Checks list).
3.  **Temporal State (The Heartbeat):** A centralized `requestAnimationFrame` loop in `App.tsx` drives UI countdowns and business logic updates.