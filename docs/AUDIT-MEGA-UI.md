# AUDIT: Desktop MEGA UI & DataTable

**Status:** Open  
**Reporter:** Antigravity (QA Lead)  
**Date:** 2025-12-29  
**Scope:** `src/desktop/`

## 🛑 Critical Issues

### 1. Ghost Data in Detail Panel
*   **File:** `src/desktop/components/DetailPanel.tsx`
*   **Issue:** Hardcoded to read from `filteredHistoricalChecksAtom`.
*   **Impact:** Supervisors see incorrect resident data when clicking rows in the **Live Monitor**.
*   **Recommendation:** Refactor `DetailPanel` to be polymorphic based on the active view.

### 2. Suppressed Visual Feedback (Accessibility)
*   **File:** `src/desktop/components/DesktopToolbar.module.css`
*   **Issue:** `outline: none` and `box-shadow: none` on search focus.
*   **Impact:** Violates high-craft standards and accessibility.
*   **Recommendation:** Restore `var(--control-focus-ring-standard)` on `.searchContainer:focus-within`.

### 3. Missing Column Dividers
*   **File:** `src/desktop/components/DataTable.module.css`
*   **Issue:** Explicitly disabled in CSS (`L86`).
*   **Impact:** Fails [SPEC-MEGA-UI-Update.md:L120](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/docs/SPEC-MEGA-UI-Update.md#L120). Reduced scannability.
*   **Recommendation:** Apply `border-right: 1px solid var(--surface-border-secondary)` to cells.

---

## ⚠️ State & Architecture Inconsistencies

### 1. Fragmented Selection
*   **Files:** `LiveMonitorView.tsx` vs `HistoricalReviewView.tsx`
*   **Issue:** Live uses local state; Historical uses a global atom.
*   **Impact:** Selection is lost when switching views.
*   **Recommendation:** Unify row selection into a single `selectedChecksAtom`.

---

## 📈 Optimization Opportunities

| Feature | Requirement | Recommendation |
|:---|:---|:---|
| **Skeleton Sync** | [AGENTS:L300](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/AGENTS.md#L300) | Use **WAAPI** to sync shimmer across all 15+ rows. |
| **Auto-Fit** | [STRATEGY-UX:L65](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/docs/STRATEGY-DataTable-UX.md#L65) | Read font-size from tokens via `getComputedStyle`. |
| **Buttons** | [AGENTS:L32](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/AGENTS.md#L32) | Standardize Close/Context buttons to use `.btn` system. |

---

## Verification Plan

1. **Integrated Selection**: Select rows in Live -> Switch to Historical -> Verify selection persists.
2. **Visual Audit**: Verify borders exist between all columns.
3. **Accessibility**: Tab to Search -> Verify focus ring is visible.
4. **Regression**: `npm run build` shows 0 errors.
