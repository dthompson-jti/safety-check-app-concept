# IDEA: Responsive Design Refactor

**Status:** Partially Implemented
**Date:** 2025-12-14
**Last Updated:** 2025-12-14
**Context:** The codebase currently relies heavily on hardcoded `px` units for spacing, sizing, and typography. This limits accessibility (user font scaling) and responsiveness across different devices.

## Implementation Progress

### ✅ Completed
- **Icon Size Tokens:** `--icon-size-*` scale defined and applied globally (xs=12, sm=16, md=20, lg=24, xl=32, 2xl=48).
- **Radius Tokens:** All hardcoded `border-radius` converted to `--radius-*` tokens.
- **Default Icon Size:** Base `.material-symbols-rounded` now sets `font-size: var(--icon-size-md)`.
- **Header Icons:** Menu and back buttons use `--icon-size-lg` for prominence.

### 🔄 In Progress
- Inline styles in TSX files still contain some hardcoded `px` values.
- Large feature icons still use `--font-size-*` instead of dedicated tokens.

## Problem Statement
A top-to-bottom review revealed extensive use of pixel units (`px`) in CSS modules and TSX files. To support a high-craft, accessible, and responsive experience, we need to transition to relative units (`rem`, `em`) and a robust design token system.

## Audit Findings
The following areas have been identified as having hardcoded `px` values that need refactoring:

### Global Styles
- `src/styles/primitives.css` (Global spacing tokens)
- `src/styles/base.css`
- `src/styles/components/*.css` (Various styling files)

### Components (CSS & TSX)
- `src/components/BottomSheet`
- `src/components/ColorSlider`
- `src/components/EmptyStateMessage`
- `src/components/FilteredEmptyState`
- `src/components/FullScreenModal`
- `src/components/ScheduleSkeleton`
- `src/components/SearchInput`
- `src/components/SegmentedControl`
- `src/components/Select`
- `src/components/Switch`
- `src/components/UserAvatar`
- `src/components/UserMenu`

### Features (CSS & TSX)
- **Shell**: `AppHeader`, `AppFooter`, `AppSideMenu`, `ConnectivityBadge`
- **Schedule**: `CheckCard`, `ScheduleView`, `StatusBadge`
- **Workflow**: `CheckEntryView`, `ResidentCheckControl`, `ScanView`, `StatusSelectionSheet`
- **Overlays**: `DeveloperModal`, `ManualCheckSelectorSheet`, `SettingsModal`, `FacilitySelectionModal`

## Implementation Plan (100% Coverage)

### Phase 1: Foundation (Tokens)
**Target:** `src/styles/primitives.css`
- Convert all `--spacing-*` variables from `px` to `rem`.
  - Mapping: `4px` = `0.25rem` (assuming 16px root).
- Convert `--radius-*` values to `rem`.
- Add `--icon-size-*` tokens in `rem` (e.g., `sm: 1rem`, `md: 1.5rem`).

### Phase 2: Global Styles
**Target:** `src/styles/*.css`
- Refactor base, semantic, and utility CSS files to use the new `rem` tokens or relative units directly.

### Phase 3: Components
**Target:** `src/components/**/*`
- Systematically refactor all CSS Modules and TSX files in the components directory.
- Replace hardcoded `px` with `--spacing-*` tokens or `rem` values.

### Phase 4: Features
**Target:** `src/features/**/*`
- Refactor all Feature-based CSS Modules and TSX.
- Pay special attention to complex layouts like `CheckCard` and `AppSideMenu`.

### Phase 5: Verification
- **Visual Validation**: Check layouts at standard zoom and various viewport widths.
- **Accessibility Check**: Verify that UI elements scale proportionally when changing the browser/OS root font size.
- **Regression Testing**: Ensure no existing layouts break due to the unit switch.
