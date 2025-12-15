# Touch Target Audit: Problem Space Analysis

## 1. Systemic Design Token Deficiencies
The application's core design tokens for control sizing fundamentally fail WCAG 2.1 Level AA (Criterion 2.5.5) standards for minimum target size (44x44px).

| Token Variable | Current Value | Target Violation | Primary Usage |
| :--- | :--- | :--- | :--- |
| `--control-height-md` | `38px` (2.375rem) | **-6px** | Default Buttons, Inputs, Toggles |
| `--control-height-sm` | `34px` (2.125rem) | **-10px** | Secondary Actions, Dev Controls |
| `--control-height-xs` | `20px` (1.25rem) | **-24px** | Clear Buttons, Chips |
| `--avatar-size-sm` | `36px` (2.25rem) | **-8px** | Header User Avatar |

---

## 2. Findings by Component Type

### A. Standard Action Buttons (`size="m"`)
**Problem**: These buttons inherit `--control-height-md` (38px). They are the primary call-to-action elements and are consistently undersized.

| Screen / Context | Component | Impact |
| :--- | :--- | :--- |
| **Session (Login)** | `LoginView` -> "Log In" Button | **Critical**: Primary entry point. |
| **Workflow (Form)** | `CheckEntryView` -> "Save" Button | **Critical**: Frequent, repetitive action. |
| **Workflow (Form)** | `CheckEntryView` -> "Mark All" Button | **High**: Batch action. |
| **Overlays (Settings)** | `SettingsModal` -> "Log Out" Button | **Medium**: Destructive action. |
| **Workflow (Scan)** | `ScanView` -> "Simulate Success/Fail" | **Low**: Dev-only, but still sized 's' (34px). |

### B. Micro-Actuators (Clear/Dismiss)
**Problem**: These elements are designed to be visually unobtrusive (20-24px) but lack "logical" hit area padding, making them frustratingly difficult to tap without error.

| Screen / Context | Component | Impact |
| :--- | :--- | :--- |
| **Global / Header** | `SearchInput` -> "Clear" (X) Button | **High**: Frustrating when correcting typos. |
| **Schedule View** | `FilterIndicatorChip` -> "Remove" (X) Button | **High**: Essential for resetting views. |

### C. Toggle & Segmented Controls
**Problem**: Segmented controls (Tab-like toggles) inherit `--control-height-md` (38px). The individual segments are physically too small.

| Screen / Context | Component | Impact |
| :--- | :--- | :--- |
| **Workflow (Form)** | `CheckEntryView` -> "Check Type" (Locked/Random) | **Medium**: Selection targets. |
| **Workflow (Form)** | `ResidentCheckControl` -> Status (Awake/Sleep...) | **Critical**: High-frequency data entry. |
| **Overlays (Settings)** | `SettingsModal` -> "Scan Mode" (QR/NFC) | **Low**: Config action. |
| **Overlays (Settings)** | `SettingsModal` -> "Theme" (Light/Dark) | **Low**: Config action. |

### D. Interactive Media & Identity
**Problem**: The user avatar is a primary navigation element (opens Settings) but is sized at 36px.

| Screen / Context | Component | Impact |
| :--- | :--- | :--- |
| **App Header** | `UserAvatar` -> Main Profile Picture | **Critical**: Sole entry point to Settings/Profile. |

### E. Form Inputs (Text)
**Problem**: Text inputs inherit `--control-height-md` (38px).

| Screen / Context | Component | Impact |
| :--- | :--- | :--- |
| **Session (Login)** | `TextInput` -> Username / Password | **Critical**: Touch target for focusing the field. |
| **Overlays (Manual)** | `SearchInput` -> Text Field | **High**: Touch target for focusing. |

---

## 3. Compliant Areas (No Action Needed)
The following areas were audited and found to be **compliant**:

*   **App Header Actions**: Menu Button and Back Buttons use `size="lg"` (48px).
*   **Footer Actions**: Main "Scan" button uses a custom height (48px) defined by `AppFooter`.
*   **ListItem Components**: `ActionListItem` uses generous padding, exceeding 44px.

## 4. Overlooked / False Positives
*   **Attestation Checkbox**: The codebase contains CSS for `.attestationContainer` (checkbox), but this is **unused dead code**. The actual UI uses `SegmentedControl` for inputs. 
    *   *Recommendation*: Clean up dead code, no touch target fix needed for the checkbox itself.
