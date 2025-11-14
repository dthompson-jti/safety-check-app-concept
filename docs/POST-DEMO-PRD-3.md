### **PRD 3: Core Check Workflow & Usability Overhaul**

#### **1. Overview**

This document specifies a major overhaul of the core check workflow, focusing on the Check Form's data capture capabilities and the usability of the entire scan-to-save process. This includes enabling per-resident notes, implementing a more ergonomic status selector, and streamlining navigation and feedback.

#### **2. Problem & Goals**

The check submission form has ergonomic issues on mobile and does not support critical data requirements, such as per-resident notes. The workflow also has redundant steps and could provide clearer feedback.

**Goals:**

1.  **Improve Data Integrity & Usability:** Overhaul the check form to enable per-resident notes and improve the ergonomics of status selection on mobile devices.
2.  **Increase User Efficiency:** Streamline the navigation by taking users directly from a schedule item tap to the check form.
3.  **Enhance User Feedback:** Provide clearer visual feedback for failed QR code scans and standardize UI patterns.

#### **3. Scope & Key Initiatives**

**In Scope:**

*   **Initiative 1: Check Form Overhaul**
    *   Refactor the form to support a separate notes field on a **per-resident** basis.
    *   Replace icon-only toggles with a new, full-width, high-craft `<SegmentedControl>` component for resident status selection.
    *   Relocate the "Special Classification" indicator to be adjacent to the specific resident's name within the form.
*   **Initiative 2: Workflow & UI Refinements**
    *   Change the behavior of tapping a schedule item to navigate directly to the Check Form, bypassing the scan screen.
    *   Improve feedback for failed QR code scans with an integrated visual indicator on the scan view (e.g., a red pulse on the viewfinder border).
    *   Simplify the "Manual Check" room selection list to show only room locations, not individual residents.
    *   Update modal "Back" buttons to consistently use the `tertiary` button style for a more prominent appearance.

**Out of Scope for this Iteration:**

*   A "Set All" convenience feature for multi-resident rooms.

#### **4. UX/UI Specification & Wireframes**

**4.1. Overhauled Check Form Controls**

*   **Interaction:** The form now contains a distinct, bordered section for each resident. Each section has its own full-width segmented control for status