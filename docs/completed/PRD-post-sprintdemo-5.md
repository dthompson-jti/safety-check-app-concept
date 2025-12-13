Here is **PRD 5**, covering the redesign of the Context Switcher. I have included the evaluation section first to align with your request.

---

## Evaluation: Current vs. Proposed

### 1. Current Experience (Form-Based)
*   **Pattern:** Single Modal with two `<Select>` dropdowns + "Continue" button.
*   **Interaction Cost:** High. User must tap "Group Dropdown" → Scroll/Scan → Tap Option → Tap "Unit Dropdown" → Scroll/Scan → Tap Option → Tap "Continue". (Minimum **5 taps**).
*   **Ergonomics:** Dropdowns on mobile (even custom ones) can feel finicky. The "Continue" button acts as a friction point.
*   **Verdict:** Functional, but feels like a "Configuration Form" rather than a navigation flow.

### 2. Proposed Experience (Sequential Drill-Down)
*   **Pattern:** Two-step list navigation (iOS Navigation Controller style).
*   **Interaction Cost:** Low. User taps "Group Name" (Auto-advance) → User taps "Unit Name" (Auto-finish). (Minimum **2 taps**).
*   **Ergonomics:** Uses the full screen width for touch targets. List items are easier to hit than dropdown items. Matches native OS navigation paradigms.
*   **Verdict:** Faster, more fluid, and reduces cognitive load by isolating decisions.

### 3. Design Recommendation
The proposed **Sequential Drill-Down** is significantly better for mobile workflows.
*   **Design Detail 1 (Transition):** The transition from Group → Unit must behave like a **page push** (slide in from right), not a fade.
*   **Design Detail 2 (Context):** When on the "Unit" screen, the header or a "overline" text must display the selected Group (e.g., "A-Wing / Select Unit") so the user doesn't lose context.
*   **Design Detail 3 (Back Navigation):** The Unit screen must have a "Back" arrow in the header to return to the Group list without closing the modal.

---

## PRD 5: Sequential Context Selection
**Focus:** Streamlining the Facility/Unit selection into a high-speed, native-feeling drill-down workflow.

### 1. Overview
Replace the current form-based "Select + Button" modal with a two-stage, auto-advancing list navigation. This reduces the interaction from ~5 taps to 2 taps and improves mobile ergonomics.

### 2. Problem & Goals
**Problem:** The current dropdown-based interface is slow and requires excessive tapping to establish context.
**Goals:**
*   Reduce "Time to First Scan" by streamlining setup.
*   Create a "native-feel" navigation structure for hierarchical data.
*   Eliminate the "Continue" button friction.

### 3. Scope & Key Initiatives
*   **Modal Refactor:** Convert `FacilitySelectionModal` to support multi-step internal navigation.
*   **Step 1 (Group View):** Display a list of Facility Groups. Tapping one immediately slides to Step 2.
*   **Step 2 (Unit View):** Display a list of Units for the selected group. Tapping one closes the modal and sets context.
*   **Navigation State:** Implement "Back" functionality within the modal (Unit -> Group).

### 4. UX/UI Specification & Wireframes

**State A: Group Selection (Step 1)**
```text
+-------------------------------------------------------+
| [Close]          Select Facility                      | <-- Header
+-------------------------------------------------------+
|  Juvenile Detention Center                          > | <-- List Item (Chevron indicates depth)
+-------------------------------------------------------+     Tap advances to State B
|  Sci-Fi Detention Center                            > |
+-------------------------------------------------------+
```

**State B: Unit Selection (Step 2)**
```text
+-------------------------------------------------------+
| [< Back]         Select Unit                          | <-- Back returns to State A
+-------------------------------------------------------+
|  SELECTED: Sci-Fi Detention Center                    | <-- Context Header (Sticky, gray background)
+-------------------------------------------------------+
|  Star Wars Pod                                        | <-- List Item (No chevron)
+-------------------------------------------------------+     Tap closes modal & saves
|  Harry Potter Pod                                     |
+-------------------------------------------------------+
```

### 5. Architecture & Implementation Plan
*   **State Management:**
    *   Local state `step`: `'group' | 'unit'`.
    *   Local state `tempGroupId`: string.
*   **Animation:**
    *   Use `AnimatePresence` with a `custom` prop to handle "push" (slide left) and "pop" (slide right) animations based on direction.
    *   *Note:* Do not animate the Modal container itself during the step change; only animate the *content* inside the modal.
*   **Reusability:**
    *   Use `ActionListItem` (created for Manual Check) for the rows.
    *   Step 1 items need a `chevron_right` icon.

### 6. File Manifest
*   `src/features/Overlays/FacilitySelectionModal.tsx` `[MODIFIED]` (Complete rewrite of internal logic).
*   `src/features/Overlays/FacilitySelectionModal.module.css` `[MODIFIED]` (Styles for list items and sticky context header).

### 7. Unintended Consequences Check
*   **Loading:** If facility data were real (async), we would need a spinner between Step 1 and Step 2. For mock data, it is instant.
*   **Back Button:** Ensure the header "Back" button (Step 2) is distinct from the modal "Close/Logout" button (Step 1).
    *   *Rule:* If `isContextSelectionRequiredAtom` is true (login flow), Step 1 has **NO** close button (or "Logout"). Step 2 has "Back".
    *   *Rule:* If opened from Side Menu (switcher), Step 1 has "Close". Step 2 has "Back".

### 8. Risks & Mitigations
*   **Risk:** User selects wrong Group, realizes it on Unit screen.
*   **Mitigation:** Prominent "Back" button in Step 2 header is critical.

### 9. Definition of Done
*   Tapping a Group immediately slides to the Unit list.
*   Tapping a Unit immediately closes the modal and updates the dashboard.
*   "Back" button in Unit view correctly returns to Group view with reverse animation.
*   Selected Group name is visible on the Unit selection screen.