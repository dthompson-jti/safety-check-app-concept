### **`PRD-Gesture-Navigation-Enhancement.md`**

```markdown
# PRD: Gesture-Driven Navigation Enhancement

## 1. Overview

This document outlines a high-craft enhancement to the application's existing Workspace Shell architecture. This initiative will introduce a fluid, gesture-driven navigation model, allowing users to swipe horizontally between the primary workspaces. This feature will build directly upon the stable, panel-based foundation already in place.

## 2. Problem & Goals

**Problem Statement:**
The current navigation model, while architecturally sound, relies exclusively on button clicks to transition between views. This is a missed opportunity to leverage the intuitive, direct-manipulation paradigm that users expect from a modern, high-craft mobile application.

**Goals:**
*   **Enhance UX Fluidity:** Introduce a fully interactive swipe gesture to reduce interaction cost and increase the "High-Craft" feel of the application.
*   **Improve Discoverability:** Provide a strong, physical affordance for the relationship between the Time and Route dashboard views.
*   **Maintain Architectural Integrity:** Implement this feature as a progressive enhancement on top of the existing, robust state management and layout system.

## 3. Scope & Key Initiatives

**In Scope:**
*   **Initiative 1: Implement Horizontal Drag Gesture:**
    *   Enable a 1:1 horizontal drag gesture on the main content carousel.
    *   A firm "flick" or dragging past a set threshold will trigger an animation that "snaps" the carousel to the next or previous panel.
    *   The gesture should be locked to the horizontal axis to prevent interference with vertical list scrolling.
*   **Initiative 2: Gesture-Coupled UI Feedback:**
    *   The active indicator in the `PillToggle` component must animate in real-time, its position perfectly synchronized with the user's horizontal drag gesture between the two dashboard panels.

**Out of Scope:**
*   Adding new workspace panels.
*   Implementing gestures other than horizontal dragging.
*   A "reduced motion" accessibility setting (for now).

## 4. UX/UI Specification

The interaction will feel physical and responsive. The user will be directly manipulating the "film strip" of content panels.

**ASCII Wireframe: Mid-Drag State**

```
// STATE: User is slowly dragging from Panel 2 (Time) to Panel 3 (Route)

+------------------------------------------+
| [Btn]   (Time)--[ ]--Route     [+ Btn]   |  <-- PillToggle indicator is halfway
|------------------------------------------|
|---+----------------------+----------------------+-+
| d | Check Card (Time 2)  | Check Card (Route 1) | |  <-- Content pans 1:1
|   +----------------------+----------------------+ |
+----------------------------------------------------+
|    [      Scan Button      ]             |
+------------------------------------------+
```
*   **Interaction:** A slow drag pans the view 1:1. A fast swipe "flicks" the view to the next panel with a `spring` animation. Releasing the drag with less than 50% travel will cause the panel to spring back to its origin.

## 5. Architecture & Implementation Plan

*   **Technology:** Framer Motion's `drag` prop and `onDragEnd` event handler will be used.
*   **Component Refactoring:**
    *   **`MainLayout.tsx`:** The `motion.div` representing the "film strip" will have the `drag="x"` prop enabled. The `onDragEnd` handler will contain the logic to calculate the target panel index based on drag offset and velocity, updating the `appViewAtom`.
    *   **`PillToggle.tsx`:** No significant changes are required, as its `layoutId` animation will naturally respond to the rapid state changes during a drag, creating the desired synchronized effect.
*   **Risk Mitigation:**
    *   **Gesture Conflict:** Use Framer Motion's `dragDirectionLock` to ensure vertical scrolling on a list doesn't accidentally trigger a horizontal navigation swipe.