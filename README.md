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
-   **Framework:** React 19
-   **Language:** TypeScript
-   **Styling:** Global CSS with a layered cascade (`@layer`), design tokens, and data-attribute styling.
-   **State Management:** Jotai
-   **Animation:** Framer Motion
-   **UI Primitives:** Radix UI

## 3. Prototype Features

-   **Simulated Login/Logout:** A complete start-of-shift session workflow.
-   **Toggleable App Layouts:** Four distinct navigation paradigms (Classic FAB, Notched Bar, etc.) selectable from a developer menu.
-   **Dynamic Check Schedule:** A performant, virtualized list of checks with live timers and multiple, toggleable card layouts.
-   **Core Scan-to-Save Workflow:** An end-to-end flow for scanning QR codes and recording check outcomes.
-   **History & Supplemental Checks:** A view to review past activity and a workflow for logging unscheduled checks.

## 4. Directory Structure

-   **/src**: Contains the application entry point, root container, global styles, and global types.
-   **/src/features**: Contains the major, user-facing areas of the application (e.g., `Dashboard`, `Settings`). Each sub-directory is a "vertical slice" of functionality.
-   **/src/components**: Contains only **truly generic and reusable** UI primitives that are application-agnostic.
-   **/src/data**: A consolidated directory for all non-visual logic and definitions (Jotai atoms, custom hooks, etc.).
-   **/src/styles**: Contains the global styling architecture, including design tokens, base styles, and component themes.

**Import Rule:** Always use relative paths (`./`, `../`). This project does not use TypeScript path aliases.

## 5. Styling Architecture

The project uses a **systematic CSS architecture** organized into layers to control specificity and promote a cohesive design language.

-   **Design Tokens:** A three-tiered token system (`primitives.css`, `utility.css`, `semantics.css`).
-   **Data-Attribute Styling:** Components use `data-*` attributes for styling variants.
-   **Layered Cascade:** The global style cascade is managed in `src/index.css` using CSS `@layer`.
-   **Robust Primitives:** Core UI patterns are built using **Radix UI** for stability and craft.

## 6. State Management

The project uses **Jotai** for its minimal, atomic state management model. State is divided into two logical areas:

1.  **UI State (`src/data/atoms.ts`):** Manages the "control panel" of the UI—active tabs, modal states, side menu visibility, etc.
2.  **Application Data (`src/data/appDataAtoms.ts`):** Manages the core data of the application. It uses a reducer-like pattern with a write-only `dispatchActionAtom` to ensure all mutations are centralized and predictable.