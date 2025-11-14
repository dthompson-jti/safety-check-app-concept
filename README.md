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
-   **State Management:** Jotai
-   **Animation:** Framer Motion
-   **UI Primitives:** Radix UI
-   **Bottom Sheet Modals:** Vaul

## 3. Prototype Features

-   **Simulated Login/Logout:** A complete start-of-shift session workflow. This includes secure, client-side validation, a generic, enumeration-resistant error for failed credentials, and a developer shortcut. After login, the user is presented with a **mandatory, full-screen Facility and Unit selection modal** to establish their operational context before proceeding.
-   **High-Craft Navigation Model:** The application uses a dual-pattern navigation system.
    -   **Push Layout (Side Menu):** The main navigation menu uses a "push" animation. It features a prominent, card-styled **Context Switcher** at the top, which displays the user's current Facility/Unit and allows them to change it. Its contents are built from a consistent, token-driven `MenuItem` component, and it features a distinct, card-styled user profile area in the footer.
    -   **Film Strip (Dashboards):** The primary workspaces (Time-Sorted and Route-Sorted Schedules) exist on a horizontal "film strip." Switching between them uses a sliding panel animation. This is all contained within a persistent application shell (header and footer) that provides global actions and view controls.
-   **Dynamic Check Schedule:** A performant list of checks with live timers and two sorting modes (Time and Route). The list features a high-craft, multi-stage completion animation that provides clear user feedback while guaranteeing the stability of all other on-screen elements, preventing jarring layout shifts.
-   **Core Scan-to-Save Workflow:** An end-to-end flow for scanning QR codes (or simulating scans) and recording check outcomes. This includes a "pre-scan alert" to notify caregivers of critical resident information *before* a scan is completed.
-   **Multi-Resident Check Form:** The check recording form supports rooms with multiple residents, including a "Set All" convenience feature and a visually distinct UI for residents with special classifications.
-   **Sophisticated Modal System:** The app employs a multi-tiered modal strategy to optimize user experience.
    -   **Full-Screen Modals:** Used for immersive, high-content views like the History and Settings overlays, as well as for critical, blocking workflows like the initial **Facility/Unit Selection** modal.
    -   **Bottom Sheet Modals:** A mobile-first pattern used for contextual actions like initiating a Manual Check, writing an NFC tag, or performing a Manual Check Selection, preserving context and improving ergonomics.
-   **Semantic Haptic Feedback:** A centralized system provides tactile feedback for key actions and state changes (e.g., success on save, warnings for late items), enhancing user awareness on mobile devices.
-   **Simulated Admin Tools:** A dedicated settings area for administrative tasks, including a complete, high-feedback UI simulation for provisioning room NFC tags.
-   **Simulated Connection Status:** A developer toggle in the settings allows for simulating 'Online' and 'Offline' states to test the UI's responsiveness.

## 4. Directory Structure

-   **/src**: Contains the application entry point, root container, global styles, and global types.
-   **/src/features**: Contains the major, user-facing areas of the application, organized into "vertical slices" of functionality (e.g., `/Shell`, `/Schedule`, `/Workflow`).
-   **/src/components**: Contains only **truly generic and reusable** UI primitives that are application-agnostic.
-   **/src/data**: A consolidated directory for all non-visual logic and definitions (Jotai atoms, custom hooks, etc.).
-   **/src/styles**: Contains the global styling architecture, including design tokens, base styles, and component themes.

**Import Rule:** Always use relative paths (`./`, `../`). This project does not use TypeScript path aliases.

## 5. Styling Architecture

The project uses a **systematic CSS architecture** organized into layers to control specificity and promote a cohesive design language.

-   **Design Tokens:** A three-tiered token system (`primitives.css`, `utility.css`, `semantics.css`).
-   **Data-Attribute Styling:** Components use `data-*` attributes for styling variants.
-   **Layered Cascade:** The global style cascade is managed in `src/styles/index.css` using CSS `@import ... layer()`. This file is the single source of truth for cascade order. This system promotes consistency, as demonstrated by the refactoring of component-specific lists (like the Manual Selection view) to use global menu item styles.
-   **Robust Primitives:** Core UI patterns are built using **Radix UI** for stability and craft.
-   **Mobile-First Interaction States:** The application differentiates between touch and mouse-based interactions.
    -   `:active` provides immediate, critical feedback for all users on tap or click.
    -   `:hover` is treated as a progressive enhancement for mouse-based devices to provide discoverability. All `:hover` styles are defined within a `@media (hover: hover)` block to prevent "sticky hover" issues on touch devices.

## 6. State Management

The project uses **Jotai** for its minimal, atomic state management model. State is divided into two logical areas:

1.  **UI State (`src/data/atoms.ts`):** Manages the "control panel" of the UI. The primary state is managed by a single `appViewAtom`, which dictates which main workspace or view is visible. Other atoms control the visibility of global overlays like the History and Settings modals.
2.  **Application Data (`src/data/appDataAtoms.ts`):** Manages the core data of the application. It uses a reducer-like pattern with a write-only `dispatchActionAtom` to ensure all mutations are centralized and predictable. This architecture supports transient states (e.g., `'completing'`) to orchestrate complex, multi-stage UI animations without disrupting the data model's integrity or causing layout shifts.