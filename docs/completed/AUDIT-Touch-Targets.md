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

## 3. Overlooked Aspects (Deep Scan Findings)

### F. Text Links
**Problem**: Text-only buttons often rely on line-height which may not meet the 44px minimum height requirement.

| Screen / Context | Component | Impact |
| :--- | :--- | :--- |
| **Session (Login)** | `LoginView` -> "Trouble signing in?" | **Medium**: Support link. |
| **App Footer** | `LoginView` -> "Privacy Policy" / "Terms" | **Low**: Footer links. |

### G. Custom Input Controls
**Problem**: Bespoke input controls (Slider) have hardcoded sizing that violates the minimum touch target.

| Screen / Context | Component | Size |
| :--- | :--- | :--- |
| **Overlays (Settings)** | `ColorSlider` -> Thumb | **24px** (Visually and Logically). Needs expansion. |

### H. Sheet Handles
**Problem**: The drag handle for bottom sheets is a critical interactive target for closing/expanding but is consistently undersized.

| Screen / Context | Component | Size |
| :--- | :--- | :--- |
| **Global (Sheets)** | `BottomSheet` -> Handle | **40px width**. Height is 4px. Entire container is Padding-4 (16px) => 16+4+16 = 36px height. Undersized. |


---

## 4. Compliant Areas (No Action Needed)
The following areas were audited and found to be **compliant**:

*   **App Header Actions**: Menu Button and Back Buttons use `size="lg"` (48px).
*   **Footer Actions**: Main "Scan" button uses a custom height (48px) defined by `AppFooter`.
*   **ListItem Components**: `ActionListItem` uses generous padding, exceeding 44px.
*   **Toast Actions**: `Toast` close button uses standard icon hit areas or larger wrappers.

## 5. False Positives
*   **Attestation Checkbox**: The codebase contains CSS for `.attestationContainer` (checkbox), but this is **unused dead code**. The actual UI uses `SegmentedControl` for inputs. 
    *   *Recommendation*: Clean up dead code, no touch target fix needed for the checkbox itself.

---

## 6. Analysis & Remediation Plan (Added 2025-12-15)

### Strategy
Detailed analysis of the codebase reveals that touch target sizes are controlled by a centralized set of CSS variables in `primitives.css`. The most effective strategy is a hybrid approach:
1.  **Global Token Adjustment**: Elevate the baseline `--control-height-md` to 44px to instantly fix the majority of button and input violations.
2.  **Contextual Visual Updates**: For components that need to "grow" (Side Menu buttons), we will use specific CSS overrides to increase icon sizes, matching the user's request for "1-step larger" visualization.

### Options Considered
| Option | Pros | Cons | Decision |
| :--- | :--- | :--- | :--- |
| **A. Visual Only (Padding)** | Low risk of layout shift. | Does not solve the actual physical touch target size for inputs. | Rejected |
| **B. Component Prop Updates** | Actionable per-component. | High effort (hundreds of usages). Tech debt. | Rejected |
| **C. Global Token Update (Recommended)** | Fixes 80% of issues instantly. Future-proof. | Requires careful regression testing of layout density. | **Selected** |

### Recommended Path

#### 1. Global Touch Target Expansion
Standardize on **44px** (Medium) as the default control height.
*   **Action**: Update `src/styles/primitives.css`.
*   **Change**:
    *   `--control-height-md`: `38px` -> **`44px`** (2.75rem).
    *   `--control-height-sm`: `34px` -> **`36px`** (2.25rem).

#### 2. Icon Promotion (Side Menu & Switchers)
The user requested "1-step larger" icons for specific navigation elements.
*   **Action**: Update `AppSideMenu.module.css` and `ContextSwitcherCard.module.css`.
*   **Change**: Force `.material-symbols-rounded` to use `--icon-size-lg` (24px) instead of default `md` (20px).

### Affected Files
1.  **`src/styles/primitives.css`**
    *   Context: Global Design Tokens.
    *   Change: Update `--control-height-*` variables.

2.  **`src/features/Shell/AppSideMenu.module.css`**
    *   Context: Styles for the Side Menu list and Footer.
    *   Change: Add contextual overrides for `font-size` on icons within `.menuList` and `.userProfileCard`.

3.  **`src/features/Shell/ContextSwitcherCard.module.css`**
    *   Context: Styles for the Group/Unit switcher.
    *   Change: Add contextual override for `font-size` on icons within `.actionIcon`.
