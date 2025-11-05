# IDEA: Structured Data for Supplemental Checks

- **ID:** IDEA-SUPPLEMENTAL-INCIDENT-TYPE
- **Date:** 2024-07-29
- **Status:** Proposed

## 1. Overview

The current "Supplemental Check" workflow captures free-text notes. This idea proposes adding a structured "Incident Type" field to better categorize these unscheduled events.

## 2. Proposed User Flow

1.  An officer initiates a Supplemental Check.
2.  After selecting a room, the `CheckFormView` appears.
3.  A new, mandatory dropdown field "Reason for Check" is present at the top of the form.
4.  The officer selects a reason from a predefined list (e.g., "Noise Complaint," "Resident Request," "Medical Alert," "Security Concern," "Other").
5.  This structured data is saved with the supplemental check record.

## 3. Potential Benefits

-   **Actionable Analytics:** Allows for easy reporting and analysis of unscheduled events.
-   **Operational Insights:** Helps identify patterns, such as a specific resident frequently requesting assistance or a specific area having more noise complaints.
-   **Improved Search & Filtering:** Enables the "History" view to be filtered by incident type.