# Design PRD: Safeguard Room Checks (Desktop Companion)

## Executive Summary
This document defines the design specifications for the "Mega UI Update" of the Desktop Companion app. It strictly adheres to the **Design System Law** established by the reference project (`screen-studio-prototype-public`) and leverages the existing `buttons.css` token-based system already in the codebase.

## Goals

1. **Improve Desktop UX** — The current desktop experience feels unpolished. This update brings it to production quality with proper interactions, layout, and visual consistency.
2. **Design System Parity** — Ensure our design system works as well on desktop as it does in the reference project. Reuse `buttons.css`, `forms.css`, and semantic tokens instead of ad-hoc styles.
3. **Zero Mobile Regressions** — All changes are isolated to `src/desktop/`. Shared styles (`buttons.css`, `semantics.css`) are additive-only; no mutations that could break mobile.

---

## 1. Header Region

### 1.1 Action Buttons (Export & Overflow)

| Aspect | Current State | Target State |
|--------|--------------|--------------|
| **Implementation** | Custom `.outlineButton` and `.iconButton` in `DesktopHeader.module.css` | Reuse `.btn` from `buttons.css` |
| **Tokens** | Mix of `--surface-*` tokens, hardcoded `36px` height | Proper `--control-*` tokens via `data-variant` attributes |

**Target Tokens (from `buttons.css`):**
- Variant: `secondary` → `data-variant="secondary"`
- Size: `s` → `data-size="s"` (32px height) or `m` (38px height)
- Background: `var(--control-bg-secondary)`
- Border: `var(--control-border-secondary)`
- Hover: `var(--control-bg-secondary-hover)`
- Pressed: `var(--control-bg-secondary-pressed)`

**Files to Modify:**
- `src/desktop/components/DesktopHeader.tsx` — Replace `<button className={styles.outlineButton}>` with `<button className="btn" data-variant="secondary" data-size="s">`
- `src/desktop/components/DesktopHeader.module.css` — Remove `.outlineButton` and `.iconButton` definitions

---

### 1.2 Side Panel Layout Behavior

| Aspect | Current State | Target State |
|--------|--------------|--------------|
| **Panel Position** | `position: fixed` (overlay) | Inline grid column (push) |
| **Layout System** | Flexbox in `App.module.css` | CSS Grid with `grid-template-columns: 1fr auto` |
| **Content Resize** | Main content unchanged | Main content shrinks to `1fr` |

**Implementation Details:**

```css
/* App.module.css - Target */
.main {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr;
    min-height: 0;
}

.main[data-panel-open="true"] {
    grid-template-columns: 1fr 320px;
}
```

```css
/* DetailPanel.module.css - Target */
.panel {
    /* REMOVE: position: fixed; top/right/bottom/z-index */
    display: flex;
    flex-direction: column;
    background-color: var(--surface-bg-primary);
    border-left: 1px solid var(--surface-border-secondary);
    height: 100%;
}
```

**Files to Modify:**
- `src/desktop/App.tsx` — Move `<DetailPanel>` inside `.main`, add `data-panel-open` attribute
- `src/desktop/App.module.css` — Convert `.main` to grid
- `src/desktop/components/DetailPanel.module.css` — Remove fixed positioning

---

## 2. Search & Filter Bar

### 2.1 Search Input

| Aspect | Current State | Target State |
|--------|--------------|--------------|
| **Background** | `var(--surface-bg-secondary)` (gray) | `var(--surface-bg-primary)` (white) |
| **Border** | `var(--surface-border-secondary)` | `var(--surface-border-primary)` |
| **Focus** | None | `var(--control-focus-ring-standard)` |

**Files to Modify:**
- `src/desktop/components/DesktopToolbar.module.css` — Update `.searchContainer` tokens

---

### 2.2 Filter & Advanced Search Buttons

| Aspect | Current State | Target State |
|--------|--------------|--------------|
| **Implementation** | `.iconButton` in module CSS | `.btn` with `data-variant="secondary"` |

**Files to Modify:**
- `src/desktop/components/DesktopToolbar.tsx` — Replace custom button with `.btn`
- `src/desktop/components/DesktopToolbar.module.css` — Remove duplicate `.iconButton`

---

## 3. Data Table Architecture

### 3.1 Current State Assessment ✅

The DataTable implementation is **largely compliant** with the design system:

| Feature | Status | Notes |
|---------|--------|-------|
| Sticky Actions Column | ✅ Complete | `position: sticky`, `z-index: 5/15` |
| Scroll Shadow | ✅ Complete | `::before` pseudo-element with `box-shadow` |
| Column Dividers | ❌ Missing | Need `border-right` on cells |
| Token Usage | ✅ Complete | All colors use semantic tokens |

### 3.2 Column Dividers (TODO)

**Specification:**
```css
.th, .td {
    border-right: 1px solid var(--surface-border-secondary);
}
.th:last-child, .td:last-child {
    border-right: none;
}
```

**Files to Modify:**
- `src/desktop/components/DataTable.module.css`

---

## 4. Visual Components

### 4.1 Resident Status Badge

| Aspect | Current State | Target State |
|--------|--------------|--------------|
| **Container** | Orange square with white icon (`.specialStatusIcon`) | Transparent, dark gray icon |
| **Icon Color** | `var(--surface-fg-on-solid)` | `var(--surface-fg-primary)` |

**Files to Modify:**
- `src/desktop/components/DataTable.module.css` — Update `.specialStatusIcon`
- `src/desktop/components/DataTable.tsx` — Remove background container

---

## 5. Mobile Impact Assessment

> [!IMPORTANT]
> **Status: SAFE**
> - All changes are isolated to `src/desktop/*`
> - `src/styles/buttons.css` is shared but only adds new patterns, no mutations
> - `src/styles/semantics.css` remains unchanged
> - Mobile entry point (`src/App.tsx`) is untouched

---

## 6. Token Gap Analysis

| Token | Status | Location |
|-------|--------|----------|
| `--control-bg-secondary` | ✅ Exists | `semantics.css` |
| `--control-bg-secondary-hover` | ✅ Exists | `semantics.css` |
| `--control-bg-secondary-pressed` | ✅ Exists | `semantics.css` |
| `--control-border-secondary` | ✅ Exists | `semantics.css` |
| `--surface-bg-brand-solid` | ✅ Exists | `semantics.css` |
| `--control-bg-quaternary-hover` | ✅ Exists | `semantics.css` |

**Conclusion:** No new tokens need to be defined.

---

## 7. Implementation Priority

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P0 | Refactor buttons to use `.btn` | Low | High (consistency) |
| P0 | Side panel push layout | Medium | High (UX) |
| P1 | Search input white background | Trivial | Medium |
| P1 | Column dividers | Trivial | Low |
| P2 | Badge style update | Low | Low |

---

## Appendix: File Change Summary

| File | Action |
|------|--------|
| `src/desktop/App.tsx` | Restructure for grid layout |
| `src/desktop/App.module.css` | Convert to CSS Grid |
| `src/desktop/components/DesktopHeader.tsx` | Replace custom buttons with `.btn` |
| `src/desktop/components/DesktopHeader.module.css` | Remove redundant button styles |
| `src/desktop/components/DesktopToolbar.tsx` | Replace custom buttons with `.btn` |
| `src/desktop/components/DesktopToolbar.module.css` | Update search tokens, remove `.iconButton` |
| `src/desktop/components/DetailPanel.module.css` | Remove fixed positioning |
| `src/desktop/components/DataTable.module.css` | Add column dividers, update badge |
