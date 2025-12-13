# Future Improvements & Ideas Log

This document tracks acknowledged feature requests and UX improvements for future development cycles.

## 1. Toast Notification Elevation

-   **Issue:** Toast notifications can appear underneath the full-screen `ScanView` overlay.
-   **Idea:** The `ScanView` should have a higher z-index than the toast container. When the `ScanView` is opened, it could programmatically dismiss any currently visible toasts to ensure a clean UI state.

## 2. Check Form UX: Status Selection Affordance

-   **Issue:** The "Awake" / "Sleeping" icon toggles in the `CheckFormView` have a small clickable area, which can be difficult to tap accurately on mobile devices.
-   **Idea 1:** Increase the clickable area of each toggle.
-   **Idea 2:** Augment the icons with visible text labels (e.g., "Awake", "Sleeping") within the button to make the options clearer and provide a larger target.

## 3. Check Form Layout: Single vs. Multi-Occupant

-   **Issue:** The `CheckFormView` uses the same layout regardless of whether there is one resident or multiple residents in a room.
-   **Idea:** Create a dedicated, optimized layout for single-resident checks. This could present the information more cleanly and remove the need for the "SET ALL" controls, simplifying the UI. The multi-resident view would remain for rooms with more than one occupant.