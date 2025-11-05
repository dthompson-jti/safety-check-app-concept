# IDEA: Retroactive Documentation for Missed Checks

- **ID:** IDEA-MISSED-CHECK-DOC
- **Date:** 2024-07-29
- **Status:** Proposed

## 1. Overview

Currently, a `Missed` check is a terminal, non-interactive state. This idea proposes enhancing this feature to allow an officer to retroactively document *why* a check was missed, providing a more complete audit trail.

## 2. Proposed User Flow

1.  An officer views a check with the `Missed` status on the schedule.
2.  The officer taps the card. Instead of being disabled, it opens a simplified modal.
3.  The modal prompts for a "Reason for Missed Check" (either a predefined list or a free-text field).
4.  Upon submission, this reason is saved with the check record.

## 3. Potential Benefits

-   **Improved Accountability:** Creates a clear record of why operational procedures were not followed.
-   **Enhanced Auditing:** Provides valuable context for supervisors reviewing shift activity.
-   **Data-Driven Insights:** Could reveal systemic issues (e.g., frequent "Emergency Response" reasons might indicate staffing problems).