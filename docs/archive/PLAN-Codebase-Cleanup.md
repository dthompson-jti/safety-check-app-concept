# PLAN: Codebase Cleanup & Architecture Analysis

## Overview
A comprehensive scan of the `safety-check-app-concept` codebase has identified several areas for cleanup, refactoring, and architectural consolidation. This plan outlines the findings and proposed actions to improve codebase hygiene and maintainability.

## 1. Vestigial Code & Unused Assets
Several files and assets remain from previous iterations or experiments and should be removed to reduce noise.

### Unused Components
- **`src/features/LateEffects/GlassTintOverlay.tsx`**: Replaced by usage of `PulseEffectsManager.tsx` which manages the `data-glass-pulse` attribute on `body`.
- **`src/features/LateEffects/DesaturationOverlay.tsx`**: Unused component.
- **`src/components/Toggle.tsx`**: Superseded by `SegmentedControl.tsx` and `Switch.tsx`.
- **`src/styles/toggles.css`**: Unused stylesheet (classes like `.toggle-group` are not in use).
- **`src/styles/debug.module.css`**: Unused debug utility.

### Legacy/Obsolete Reports
- **Accessibility Reports**: `contrast_report_*.md`, `contrast_matrix_report.md`, `pa11y_*.txt`.
- **Scripts/Configs**: `contrast_audit.js/.cjs`, `pa11y-config*.json`.

## 2. Architectural Inconsistencies & Legacy Patterns

### Legacy Exports & Aliases
- **`PulseEffectsManager.tsx`**: Contains a legacy export `GlassTintOverlay` for backward compatibility. Since we confirmed no active imports use this alias, it should be removed.

### Feature Flags
- **`src/data/featureFlags.ts`**: Contains "Legacy - kept for migration" flags:
    - `feat_glass_tint`
    - `feat_card_gradient`
    - `feat_glass_pulse` vs `feat_glass_tint` logic redundancy.
- **Action**: Consolidate Pulse logic. Identify if `feat_glass_tint` is truly needed or if `feat_glass_pulse` covers all use cases.

### Toast State Strategy
- **`src/data/toastAtoms.ts`**: Contains "Strategy 2: Strict Mode Deduplication (Legacy)".
- **Observation**: Strategy 1 (Stable ID) is the robust pattern.
- **Action**: Evaluate if Strategy 2 can be removed or simplified.

### Type Definitions
- **`src/types.ts`**: Minimal definition file.
- **Observation**: `SafetyCheckStatus` defines 'early' and 'pending' which map to 'Upcoming' in UI. This mapping is tightly coupled in `StatusBadge.tsx` and `safetyChecksAtom`.
- **Action**: Ensure type definitions strictly match domain logic.

## 3. Potential Issues & Risks

### CSS Architecture
- **Layering**: `src/styles/index.css` imports `toggles.css` which is unused.
- **Risk**: Unused CSS adds bloat and potential selector conflicts.
- **Action**: Remove `toggles.css` import from `index.css`.

### "Magic Strings" & Hardcoded Values
- **Colors**: Some components might still be using raw hex values or non-semantic tokens.
- **Action**: Enforce `semantic.css` token usage (verified in `AGENTS.md`, but requires ongoing vigilance).

### Performance Logic
- **`useTheme.ts`**: Uses `localStorage` directly in `useState` initializer function.
    - *Good Practice*: It uses a try-catch block.
    - *Risk*: Synchronous blocking read on mount. (Acceptable for theme, but worth noting).

## 4. Deep Scan Findings

### Unused Hooks & Data Utilities
These files are not imported anywhere in the application:
- **`src/hooks/useLongPress.ts`**
- **`src/data/useUrlSync.ts`**
- **`src/data/useScrollSpy.ts`**
- **`src/data/settingsMock.ts`**
- **`src/data/useIsMac.ts`**
- **`src/data/useOnClickOutside.ts`**

### Unused Types/Interfaces
- Check `src/types.ts` for unused interfaces after converting data files.

### Unused Dependencies (package.json)
The following packages appear to be unused and should be uninstalled:
- `@radix-ui/react-toolbar`
- `@radix-ui/react-context-menu`
- `@radix-ui/react-toggle` (superseded by `SegmentedControl` / `ToggleGroup`)

### Naming Ambiguity
- **`src/styles/utility.css`** (contains Alpha tokens) vs **`src/styles/utilities.css`** (contains helper classes).
- **Recommendation**: Rename `utility.css` to `tokens-alpha.css` for clarity.

## 5. Deepest Scan Findings (Assets & Styles)

### Unused Stylesheets
- **`src/components/ActionListItem.module.css`**: The component uses `list.css` global classes and does not import this module.

### Unused Public Assets
- **`public/maskable-icon-1.png`**: Redundant; `maskable-icon-v0.png` is the active asset in manifest.
- **`public/vite.svg`**: Default template file, replaced by `favicon-v0.svg` in `index.html`.

## Comprehensive Action Plan

### Phase 1: Immediate Cleanup (Files)
- [ ] Remove `src/features/LateEffects/GlassTintOverlay.tsx`
- [ ] Remove `src/features/LateEffects/DesaturationOverlay.tsx`
- [ ] Remove `src/components/Toggle.tsx`
- [ ] Remove `src/styles/toggles.css`
- [ ] Remove `src/styles/debug.module.css`
- [ ] Remove `src/components/ActionListItem.module.css`
- [ ] Update `src/styles/index.css` to remove `toggles.css` import.
- [ ] Remove `contrast_audit.*`, `contrast_report*`, `pa11y*`.

### Phase 2: Deep Cleanup (Code)
- [ ] Remove `src/hooks/useLongPress.ts`
- [ ] Remove `src/data/useUrlSync.ts`
- [ ] Remove `src/data/useScrollSpy.ts`
- [ ] Remove `src/data/settingsMock.ts`
- [ ] Remove `src/data/useIsMac.ts`
- [ ] Remove `src/data/useOnClickOutside.ts`

### Phase 3: Asset & Dependency Pruning
- [ ] Remove `public/maskable-icon-1.png`
- [ ] Remove `public/vite.svg`
- [ ] Uninstall `@radix-ui/react-toolbar`
- [ ] Uninstall `@radix-ui/react-context-menu`
- [ ] Uninstall `@radix-ui/react-toggle`

### Phase 4: Refactoring & Renaming
- [ ] Rename `src/styles/utility.css` to `src/styles/tokens-alpha.css` and update imports (check `index.css`).
- [ ] Remove legacy export from `PulseEffectsManager.tsx` and update imports if any (none found).
- [ ] Prune legacy flags from `featureFlags.ts`.
