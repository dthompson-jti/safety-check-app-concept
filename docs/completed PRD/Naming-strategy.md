## 1. Strategic Vision
This project is shifting from an exploratory prototype to a **High-Craft Production Reference**. To achieve this, we are enforcing strict architectural discipline, removing experimental debt (List View), and harmonizing the codebase to match the user's mental model.

### Core Pillars
1.  **Anatomical Naming:** Components are named by their **Function** (what they do) and **Structure** (what UI pattern they use), never by their style (CSS).
    *   *Example:* `FloatingHeader` (Style) → `AppHeader` (Function).
2.  **Cognitive Match:** The code terminology must mirror the UI terminology 1:1.
    *   *Example:* "Write NFC" in UI → `NfcWriteView` in code (not `Provisioning`).
3.  **Workflow Harmonization:** Complex workflows are broken into distinct, predictable stages:
    *   **Selection Phase:** Uses `...SelectorSheet` (Bottom Sheet).
    *   **Execution Phase:** Uses `...EntryView` (Full Screen).
4.  **Card-First Design:** We are deprecating the "List View" to focus all engineering effort on a single, high-fidelity "Card View" that supports rich animations and complex status indicators without layout thrashing.

---

## 2. The New Component Taxonomy

We are establishing a strict naming convention to ensure the project remains navigable as it grows.

| Suffix | Definition | Example |
| :--- | :--- | :--- |
| **`...Shell`** | The root layout container. Handles global context. | `AppShell` |
| **`...View`** | A full-screen route or major workspace. | `ScheduleView`, `NfcWriteView` |
| **`...Sheet`** | A dismissible bottom-sheet overlay for quick tasks. | `ManualCheckSelectorSheet` |
| **`...Modal`** | A blocking full-screen overlay for critical interruptions. | `SettingsModal` |
| **`...Selector`** | A component used to trigger a choice. | `ContextSelector` |
| **`...Bar`** | A horizontal structural element. | `StatusBar`, `AppHeader` |
| **`...Badge`** | A small status indicator. | `ConnectivityBadge` |

---

## 3. Sample Plan

This plan organizes the work into logical phases. **Phase 1 is the critical path**—it establishes the new naming structure and cleans up debt, enabling the feature work in Phases 2-5 to proceed without friction.


1.  **The Great Rename (Shell & Chrome)**
    *   `FloatingHeader` → **`AppHeader`**
    *   `FloatingFooter` → **`AppFooter`**
    *   `StatusOverviewBar` → **`StatusBar`** (Per feedback)
    *   `ConnectionStatusIndicator` → **`ConnectivityBadge`**
    *   `PillToggle` → **`ViewModeSwitcher`**
2.  **Workflow Harmonization (Renaming)**
    *   `ProvisionNfcView` → **`NfcWriteView`** (Matches UI "Write NFC")
    *   `NfcWritingSheet` → **`NfcWriteSheet`**
    *   `ManualSelectionView` → **`ManualCheckSelectorSheet`**
    *   `CheckFormView` → **`CheckEntryView`**
3.  **Deprecation of List View**
    *   **Delete:** `CheckListItem.tsx` and its CSS module.
    *   **Refactor:** `ScheduleListView` → **`ScheduleView`**. Remove conditional rendering; force `CheckCard`.
    *   **Cleanup:** Remove `scheduleViewMode` from `atoms.ts` and `SettingsOverlay`.
    *   **Move:** `CheckSkeleton` → `features/Schedule/ScheduleSkeleton.tsx`.
