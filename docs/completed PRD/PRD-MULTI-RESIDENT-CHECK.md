Excellent. Here are the two mini-PRDs and the cleanup verification ticket, structured as requested.

---

### PRD-PROTO-01: Multi-Resident Check Form

#### 1. Overview
This document specifies the requirements to enhance the prototype's "Record Check" form to support rooms with multiple residents. This is a critical usability feature for the prototype, as it reflects a common real-world scenario and directly impacts the efficiency of an officer's workflow.

#### 2. Problem & Goals
*   **Problem:** The current `CheckFormView` is designed for a 1:1 relationship between a check and a resident. In many facilities, a single room may house multiple residents, each requiring an individual status to be recorded. The current UI does not support this.
*   **Goals:**
    1.  Modify the check form to display a list of all residents assigned to the scanned room.
    2.  Enable officers to efficiently record a status (e.g., Awake, Sleeping) for each resident individually.
    3.  Provide a "Set All" convenience feature to apply a single status to all residents in the room at once, optimizing the common-case scenario.

#### 3. Scope
*   **In Scope:**
    *   Updating `CheckFormView.tsx` to handle and display multiple residents.
    *   Modifying local component state to manage an array of resident statuses instead of a single value.
    *   Implementing the UI for individual and "Set All" status selection.
*   **Out of Scope:**
    *   Backend logic for how multi-resident checks are stored.
    *   Complex conflict resolution (this is a UI/UX prototype).

#### 4. UX/UI Specification
The form will present a clear list of residents, each with their own status selector. A "Set All" control will be placed prominently at the top of the list for quick bulk actions.

**ASCII Wireframe: `CheckFormView.tsx` (Multi-Resident)**
```
      +------------------------------------------+
      | ←  Record Check                          |  <-- Header
      |------------------------------------------|
      |                                          |
      |  +------------------------------------+  |
      |  | Room 101 - Smith, J. / Jones, A. |  |  <-- Resident Info Card
      |  +------------------------------------+  |
      |                                          |
      |  SET ALL TO                              |  <-- "Set All" Label
      |  [ Awake ] [ Sleeping ]                  |  <-- "Set All" IconToggleGroup
      |                                          |
      |  --------------------------------------  |
      |                                          |
      |  John Smith                              |
      |  [ Awake ] [ Sleeping ]                  |  <-- Individual IconToggleGroup
      |                                          |
      |  Adam Jones                              |
      |  [ Awake ] [ Sleeping ]                  |  <-- Individual IconToggleGroup
      |                                          |
      |  --------------------------------------  |
      |                                          |
      |  NOTES (OPTIONAL)                        |
      |  +------------------------------------+  |
      |  |                                    |  |
      |  +------------------------------------+  |
      |                                          |
      +------------------------------------------+
```

---

