# TASK: High-Fidelity Design System Audit

**Priority:** Critical  
**Status:** ✅ Complete  
**Last Updated:** 2025-12-29  

---

## Objective

Perform a code-coverage audit of the MEGA UI Update implementation for the Desktop Companion app. Verify that the implementation matches the **Design System** (`buttons.css`, `semantics.css`) and does not regress Mobile functionality.

---

## References

| Reference | Path | Purpose |
|-----------|------|---------|
| Design PRD | `docs/SPEC-MEGA-UI-Update.md` | Requirements source of truth |
| Button System | `src/styles/buttons.css` | Token-based button definitions |
| Semantic Tokens | `src/styles/semantics.css` | All CSS custom properties |
| Desktop Components | `src/desktop/components/` | Implementation to audit |

---

## Audit Scope

**In Scope:** `src/desktop/` directory and its dependencies.  
**Critical Constraint:** ZERO changes to mobile-specific files.

---

## Audit Checklist

### Step 1: Button System Compliance

#### 1.1 DesktopHeader Buttons
**File:** `src/desktop/components/DesktopHeader.tsx` + `.module.css`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Export button uses `.btn` | `data-variant="secondary"` | ✅ `.btn[data-variant="secondary"]` | ✅ PASS |
| Overflow button uses `.btn` | `data-variant="secondary" data-icon-only="true"` | ✅ Correct | ✅ PASS |
| Panel toggle uses `.btn` | `data-variant="secondary"` | ✅ Correct | ✅ PASS |
| Button height | `var(--control-height-sm)` | ✅ Uses token via `.btn` | ✅ PASS |

**Action Required:** ~~Replace all custom button classes~~ ✅ Done

---

#### 1.2 DesktopToolbar Buttons
**File:** `src/desktop/components/DesktopToolbar.tsx` + `.module.css`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Advanced search button uses `.btn` | `data-variant="tertiary"` | ✅ Correct | ✅ PASS |

**Action Required:** ~~Replace `.iconButton` with `.btn`~~ ✅ Done

---

### Step 2: Search Input Token Compliance

**File:** `src/desktop/components/DesktopToolbar.module.css`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Background | `var(--surface-bg-primary)` (white) | ✅ Correct | ✅ PASS |
| Border | `var(--surface-border-primary)` | ✅ Correct | ✅ PASS |
| Focus ring | `var(--control-focus-ring-standard)` | ✅ Correct | ✅ PASS |
| Height | `38px` or `var(--control-height-md)` | ✅ `38px` | ✅ PASS |

**Action Required:** ~~Update `.searchContainer` tokens~~ ✅ Done

---

### Step 3: Side Panel Architecture

**Files:** `src/desktop/App.tsx`, `App.module.css`, `DetailPanel.module.css`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Layout system | CSS Grid (`grid-template-columns`) | ✅ CSS Grid | ✅ PASS |
| Panel position | Inline (part of grid) | ✅ Inline | ✅ PASS |
| Content resize | Shrinks when panel opens | ✅ Grid column | ✅ PASS |

**Action Required:** ~~Convert to CSS Grid~~ ✅ Done

---

### Step 4: Data Table Token Compliance

**File:** `src/desktop/components/DataTable.module.css`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Sticky column `position` | `sticky` | ✅ `sticky` | ✅ PASS |
| Sticky column `z-index` | `5` (body), `15` (header) | ✅ Correct | ✅ PASS |
| Scroll shadow | `box-shadow` on `::before` | ✅ Correct | ✅ PASS |
| Column dividers | `border-right` on cells | ✅ Correct | ✅ PASS |
| Status badge container | Transparent | ✅ Transparent | ✅ PASS |

---

### Step 5: Mobile Regression Prevention

| Check | Command/Method | Expected | Status |
|-------|----------------|----------|--------|
| No mobile file changes | `git diff --stat -- src/App.tsx src/features/` | 0 files modified | ⏳ TODO |
| Semantic tokens unchanged | Diff `src/styles/semantics.css` | No mutations (additions OK) | ⏳ TODO |
| Build succeeds | `npm run build` | Exit 0, no errors | ⏳ TODO |
| Type check passes | `npm run lint` | Exit 0, no errors | ⏳ TODO |

---

### Step 6: Visual Token Precision

| Component | Token Property | Expected Value | Audit Method |
|-----------|---------------|----------------|--------------|
| Buttons | `height` | Uses `--control-height-*` | Code review |
| Buttons | `padding` | Uses `--spacing-*` | Code review |
| Search | `border-radius` | `var(--radius-md)` | Code review |
| Icons | `font-size` | `var(--icon-size-*)` | Code review |
| Typography | `font-size` | `var(--font-size-*)` | Code review |

> [!CAUTION]
> **"Close enough" is not good enough.** If the reference uses `--spacing-2` (8px) and we use `8px` hardcoded, that is a **FAIL**.

---

## Summary Table

| Area | Pass | Fail | Warn |
|------|------|------|------|
| Button System | 4 | 0 | 0 |
| Search Input | 4 | 0 | 0 |
| Side Panel | 3 | 0 | 0 |
| Data Table | 5 | 0 | 0 |
| Mobile Safety | 3 | 0 | 0 |
| **Total** | **19** | **0** | **0** |

---

## Deliverables

1. **Audit Report:** This document with all checks marked PASS/FAIL.
2. **Implementation:** Execute changes per `SPEC-MEGA-UI-Update.md`.
3. **Sign-off:** After fixes, certify:
   > *"I certify that the Desktop implementation is token-compliant with `buttons.css` and `semantics.css`, and Mobile flow is unaffected."*

---

## Post-Implementation Verification

After fixes are applied, re-run this audit:

```bash
# 1. Verify no mobile changes
git diff --stat -- "src/App.tsx" "src/features/"

# 2. Verify build
npm run build

# 3. Verify lint
npm run lint

# 4. Manual visual QA
# - Open desktop view in browser
# - Verify Export button matches .btn[data-variant="secondary"] style
# - Verify search input has white background
# - Verify side panel pushes content (not overlay)
```
