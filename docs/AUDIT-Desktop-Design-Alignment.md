# Desktop Design Alignment Audit

> **Reference:** `screen-studio-prototype-public`  
> **Target:** `safety-check-app-concept` (desktop components only)

---

## Executive Summary

This audit compares the desktop UI patterns between the reference project and the current project across 8 key areas. The reference project demonstrates a highly refined design system with unified component patterns, semantic token usage, and polished interaction states.

---

## 1. Side Panel

### Reference: `ResizablePanel.tsx` + `ResizablePanel.module.css`

| Aspect | Reference Implementation |
|--------|-------------------------|
| **Resize Handle** | 9px invisible hit area with 1px visible indicator |
| **Hover/Active States** | Indicator expands to 3px with `--control-border-primary` color |
| **Smooth Resize** | Disables transition during drag (`transition: 'none'`), re-enables on mouseUp |
| **Cursor** | Sets `document.body.style.cursor = 'col-resize'` globally during drag |
| **Animated Visibility** | Smooth width animation with `transform: translateX()` for content |

### Reference: Panel Header (`panel.module.css`)

| Aspect | Reference Value |
|--------|-----------------|
| **Height** | `44px` fixed |
| **Background** | `--surface-bg-secondary` |
| **Title** | 14px, font-weight 600, letter-spacing -0.21px |
| **Close Button** | `quaternary` variant, size `s` |

### Current: `DetailPanel.module.css`

| Aspect | Current Implementation | Gap |
|--------|------------------------|-----|
| **Resize Handle** | 6px width, no visual indicator | ❌ Missing visual feedback |
| **Hover/Active States** | Changes entire handle bg to `--control-bg-selected` | ❌ Too aggressive |
| **Smooth Resize** | No transition management | ❌ Janky during drag |
| **Cursor** | Local only | ⚠️ Not global |
| **Header Height** | Uses padding, not fixed height | ⚠️ Inconsistent |
| **Close Button** | Custom inline styles | ❌ Not using Button component |

### Recommended Changes

1. **Create shared `ResizablePanel` component** with:
   - 9px hit area, centered 1px indicator
   - Indicator expands to 3px on hover/active
   - Global cursor management
   - Transition disabling during drag

2. **Standardize panel header**:
   - Fixed 44px height
   - Use `Button` component with `variant="quaternary"` size="s"`
   - Consistent padding: `0 var(--spacing-4)`

---

## 2. Buttons

### Reference: `buttons.css` (147 lines)

| Aspect | Reference Value |
|--------|-----------------|
| **Border Width** | `1px solid` (tertiary uses `1px 1px 2px 1px` for bottom emphasis) |
| **Font Weight** | `500` |
| **Transition** | `background-color 0.2s, box-shadow 0.2s, border-color 0.2s` |
| **Size `m`** | height: 38px, border-radius: `--spacing-2` (8px) |
| **Size `s`** | height: 34px, border-radius: `--spacing-2` (8px) |
| **Size `xs`** | height: 1.5rem (24px), border-radius: `--radius-md` (6px) |
| **Icon-only** | Uses `--radius-xl` for fully rounded |
| **On-solid hover** | Uses `--control-bg-on-solid-hover` with no visible border |

### Current: `buttons.css` (254 lines)

| Aspect | Current Value | Gap |
|--------|---------------|-----|
| **Font Weight** | `600` | ⚠️ Heavier than reference |
| **Gap** | `var(--spacing-2)` inside button | ✅ Present |
| **On-solid variant** | Present with correct tokens | ✅ Matches |
| **@media (hover: hover)** | Applied to all hover states | ✅ Good |
| **Destructive variant** | Present | ✅ Current has it, reference doesn't |

### Recommended Changes

1. **Font weight alignment** - Consider reducing to `500` for consistency
2. **No critical gaps** - Current implementation is actually more comprehensive

---

## 3. Selection Toolbar

### Reference: `ActionToolbar.module.css`

```css
.actionToolbar {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);                    /* 4px between items */
  background-color: var(--surface-bg-brand-solid);
  border-radius: var(--spacing-3);          /* 12px - well rounded */
  padding: var(--spacing-2);                /* 8px internal */
  color: var(--control-fg-on-solid);
  box-shadow: var(--surface-shadow-lg);
}
```

### Reference: Toolbar Divider (`panel.module.css`)

```css
.floatingToolbarDivider {
  width: 2px;
  height: 20px;
  background-color: var(--surface-border-theme);
  margin: 0 var(--spacing-2);               /* 8px horizontal margin */
}
```

### Current: `BulkActionFooter.module.css`

| Aspect | Current | Reference | Gap |
|--------|---------|-----------|-----|
| **Border Radius** | `--radius-lg` | `--spacing-3` (12px) | ⚠️ May differ |
| **Padding** | `--spacing-2` | `--spacing-2` | ✅ Matches |
| **Gap** | `--spacing-2` | `--spacing-1` | ⚠️ Slightly larger |
| **Divider Width** | No dedicated style | 2px | ❌ Missing |
| **Divider Height** | — | 20px | ❌ Missing |

### Recommended Changes

1. **Border radius**: Align to `var(--spacing-3)` (12px)
2. **Gap**: Reduce to `var(--spacing-1)` (4px)
3. **Add toolbar divider** style with 2px width, 20px height

---

## 4. List Menu Items

### Reference: `menu.css` - Menu Item States

| State | Background | Border | Box-shadow |
|-------|------------|--------|------------|
| **Rest** | none | transparent | none |
| **Hover/Highlighted** | `--control-bg-tertiary-hover` | `--control-border-tertiary-hover` | `inset 0 -2px 0 0 --control-border-tertiary-hover` |
| **Checked (Selected)** | `--control-bg-selected` | transparent | none |
| **Checked + Hover** | `--control-bg-selected-hover` | `--control-border-selected-hover` | `inset 0 -2px 0 0 --control-border-selected-hover` |
| **Focus-visible** | Same as hover | Same | `inset 0 0 0 2px --control-focus-ring-standard` added |

### Reference: Menu Item Layout

```css
.menu-item {
  gap: var(--spacing-3);                    /* 12px */
  padding: var(--spacing-2) var(--spacing-1p5);  /* 8px 6px */
  border-radius: var(--spacing-2);          /* 8px */
  border: 1px solid transparent;
}
```

### Current: `menu.css` (221 lines)

| Aspect | Status |
|--------|--------|
| States match | ✅ Very close alignment |
| Gap | ✅ Matches |
| Padding | ✅ Matches |
| Border radius | ✅ Matches |
| Focus ring | ⚠️ Uses `--ring-width-focus` variable instead of `2px` |

### Recommended Changes

1. **Minor**: Current is well-aligned, only difference is focus ring uses token which is fine
2. **No action needed** - current menu system is comprehensive

---

## 5. Popover Menus

### Reference: `menu.css` - Popover Container

```css
.menu-popover {
  z-index: 1100;
  background-color: var(--surface-bg-primary);
  border-radius: var(--spacing-3);          /* 12px */
  box-shadow: var(--surface-shadow-xl);
  border: 1px solid var(--surface-border-primary);
  padding: var(--spacing-1);                /* 4px internal */
  min-width: 220px;
  gap: 2px;                                 /* 2px between items */
}
```

### Reference: Destructive Variant

```css
.menu-item.destructive { 
  color: var(--surface-fg-alert-primary); 
}
.menu-item.destructive:hover {
  background-color: var(--control-bg-alert-hover);
  border-color: var(--control-border-alert);
  color: var(--control-fg-on-solid);
}
```

### Current: `RowContextMenu.module.css`

| Aspect | Current | Reference | Gap |
|--------|---------|-----------|-----|
| **Border Radius** | `--radius-md` | `--spacing-3` (12px) | ⚠️ Different token |
| **Padding** | `--spacing-1` | `--spacing-1` | ✅ Matches |
| **Gap** | `2px` | `2px` | ✅ Matches |
| **Min-width** | `180px` | `220px` | ⚠️ Slightly narrower |
| **Destructive hover border** | None | `--control-border-alert` | ❌ Missing |

### Recommended Changes

1. **Border radius**: Use `var(--spacing-3)` for 12px
2. **Min-width**: Increase to `220px`
3. **Destructive hover**: Add border color for visual weight
4. **Consider**: Migrate to use global `menu.css` classes instead of module

---

## 6. Context Menu

### Reference Usage
The reference uses Radix UI `ContextMenu` with global `.menu-popover` and `.menu-item` classes, providing unified styling across all menu types.

### Current Implementation
`RowContextMenu.tsx` uses a custom implementation with:
- Custom portal logic
- Module CSS instead of global menu classes
- Manual positioning

### Recommended Changes

1. **Consider adopting Radix UI ContextMenu** for consistency
2. **At minimum**: Use global `.menu-popover` and `.menu-item` classes
3. **Add keyboard navigation** if not present

---

## 7. Search Boxes

### Reference: `SearchInput.module.css`

| Aspect | Reference Value |
|--------|-----------------|
| **Height** | `38px` fixed (matches button height) |
| **Border Radius** | `6px` |
| **Padding** | `--spacing-1p5` (6px) `--spacing-3` (12px) |
| **Focus Border** | `--surface-border-theme` |
| **Focus Shadow** | `0 0 0 2px var(--control-focus-ring-standard)` |
| **Standalone Variant** | Visible border, bg: `--surface-bg-primary` |
| **Integrated Variant** | No border/bg, for use inside popovers |
| **Input Reset** | Uses `all: unset` for clean slate |

### Current: `SearchInput.module.css`

| Aspect | Current | Gap |
|--------|---------|-----|
| **Height** | `--control-height-md` token | ⚠️ Different, but may be same value |
| **Border Radius** | `--radius-sm` | ⚠️ Check token value |
| **Focus Shadow** | Uses `--ring-width-focus` token | ⚠️ Token vs hardcoded |
| **Input Reset** | `all: unset` | ✅ Matches |
| **Variants** | Both present | ✅ Matches |

### Current: `DesktopToolbar.module.css` (Inline Search)

```css
.searchContainer {
  height: 40px;                    /* Slightly taller than reference */
  width: 240px;
  border-radius: var(--radius-md);
}
```

| Aspect | Issue |
|--------|-------|
| **Inline implementation** | ❌ Not using shared SearchInput component |
| **Height** | 40px vs reference 38px |
| **Custom styling** | ❌ Duplicated, inconsistent |

### Recommended Changes

1. **Replace inline search** in `DesktopToolbar` with shared `SearchInput` component
2. **Align height** to 38px
3. **Verify border-radius token** resolves to 6px

---

## 8. Empty States

### Reference: `EmptyStateMessage.module.css`

```css
.emptyStateContainer {
  padding: var(--spacing-8) var(--spacing-4);
  color: var(--surface-fg-secondary);
}
.placeholderIcon {
  font-size: 64px !important;
  color: var(--surface-fg-quinary);
  opacity: 0.5;
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 64;
}
.emptyStateMessage {
  font-size: 0.9em;
  color: var(--surface-fg-tertiary);
}
```

### Current: `EmptyStateMessage.module.css`

| Aspect | Status |
|--------|--------|
| Container padding | ✅ Matches |
| Icon styling | ✅ Nearly identical |
| Message styling | ✅ Matches |

### Recommended Changes

**None** - Current implementation aligns well with reference.

---

## Summary: Priority Changes

### High Priority (Visual Impact)

| Component | Change | Files Affected |
|-----------|--------|----------------|
| **Side Panel Resize** | Add visual indicator, smooth drag | `DetailPanel.module.css`, new `ResizablePanel.tsx` |
| **Context Menu** | Use global menu classes, fix radius | `RowContextMenu.module.css` or migrate to global |
| **Toolbar Radius** | Align to 12px | `BulkActionFooter.module.css` |

### Medium Priority (Consistency)

| Component | Change | Files Affected |
|-----------|--------|----------------|
| **Desktop Search** | Use shared `SearchInput` component | `DesktopToolbar.tsx` |
| **Panel Header** | Fixed 44px height, use Button component | `DetailPanel.module.css`, `DetailPanel.tsx` |
| **Toolbar Gap** | Reduce to 4px, add divider style | `BulkActionFooter.module.css` |

### Low Priority (Polish)

| Component | Change | Files Affected |
|-----------|--------|----------------|
| **Button Font Weight** | Consider 500 vs 600 | `buttons.css` |
| **Menu Min-Width** | 180px → 220px | `RowContextMenu.module.css` |
| **Destructive Hover** | Add border color | `RowContextMenu.module.css` |

---

## Design Token Gaps

The reference uses hardcoded values in some places where the current project uses design tokens:
- Reference: `height: 38px` → Current: `--control-height-md`
- Reference: `border-radius: 6px` → Current: `--radius-sm`
- Reference: `font-size: 14px` → Current: `--font-size-md`

**Recommendation**: Current project's use of tokens is **correct**. Verify token values resolve to match reference pixel values.

---

## Verification Checklist

After implementation, verify:

1. [ ] Side panel resize shows visual indicator on hover
2. [ ] Resize is smooth during drag (no jank)
3. [ ] Context menus have 12px border radius
4. [ ] Toolbar has consistent 12px rounded corners
5. [ ] Search input height matches buttons (38px or token equivalent)
6. [ ] Destructive menu items have red border on hover
7. [ ] **Mobile views are unchanged** (critical)
