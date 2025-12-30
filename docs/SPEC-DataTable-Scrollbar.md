# SPEC: DataTable Scrollbar Refinement

**Status:** Ready for Implementation  
**Complexity:** Low (CSS-only, ~15 lines)  
**Estimated Time:** 15 minutes  
**Target:** Desktop DataTable Component

---

## Goal

Implement a "high-craft" scrollbar for the Desktop DataTable that is:
1. **Visible by default** (20% opacity for clear spatial awareness)
2. **Prominent on container hover** (60% opacity for clear interaction cue)
3. **Solid on thumb hover** (100% opacity for precise control)
4. **Consistent across both axes** (vertical AND horizontal scrollbars)
5. **Zero layout shift** (scrollbar gutter always reserved)
6. **Matched width** (12px width to match global defaults)

---

## Background Context

### Current State
The DataTable currently uses **global browser defaults** for scrollbars (from `src/styles/scrollbars.css`). These are functional but not optimized for the desktop dashboard's high-craft aesthetic.

### Why This Change?
- **UX Improvement**: Subtle scrollbars reduce visual clutter while maintaining discoverability
- **Design System Alignment**: Uses semantic tokens consistent with the rest of the desktop UI
- **Dual-Axis Support**: Table scrolls both vertically (lazy load) AND horizontally (resizable columns), both need consistent treatment

### Architecture Notes
- **Sticky Column Integration**: The "Actions" column is pinned `right: 0`. Scrollbar sits in the gutter outside this column (no conflicts).
- **Lazy Load Sentinel**: The `IntersectionObserver` on the bottom skeleton row continues to work (vertical scroll).
- **Phantom Spacer**: The invisible spacer column absorbs width changes (horizontal scroll). Scrollbar behavior doesn't affect this.

---

## Implementation Steps

### Step 1: Locate the Target File

**File:** `src/desktop/components/DataTable.module.css`

Open this file. You'll see the `.scrollArea` class definition around **line 14-20**:

```css
.scrollArea {
    flex: 1;
    overflow: auto;
    min-height: 0;
    background: var(--surface-bg-primary);
    /* Fill deadspace with white */
}
```

### Step 2: Add Scrollbar Styles

**Insert the following CSS immediately AFTER the `.scrollArea` block** (after line 20):

```css
/* Custom Scrollbar Styling - Subtle by Default, Prominent on Hover */

/* Webkit browsers (Chrome, Edge, Safari) - Both vertical and horizontal */
.scrollArea::-webkit-scrollbar {
    width: 12px;   /* Vertical scrollbar - matched to global default */
    height: 12px;  /* Horizontal scrollbar - matched to global default */
}

.scrollArea::-webkit-scrollbar-track {
    background: transparent;
}

.scrollArea::-webkit-scrollbar-thumb {
    /* Rest State: 20% opacity */
    background-color: rgba(var(--surface-fg-quaternary-rgb), 0.2);
    border-radius: 6px;
    border: 3px solid transparent;
    background-clip: content-box; /* Creates inner padding effect */
    transition: background-color 200ms ease;
}

/* Container Hover: 60% opacity */
.scrollArea:hover::-webkit-scrollbar-thumb {
    background-color: rgba(var(--surface-fg-quaternary-rgb), 0.6);
}

/* Thumb Hover/Active: 100% opacity */
.scrollArea::-webkit-scrollbar-thumb:hover,
.scrollArea::-webkit-scrollbar-thumb:active {
    background-color: var(--surface-fg-quaternary);
}

/* Firefox: Always-visible thin scrollbar (browser limitation, no hover) */
.scrollArea {
    scrollbar-width: thin;
    scrollbar-color: var(--surface-fg-quaternary) transparent;
}
```

### Step 3: Understanding the Code

**Line-by-Line Explanation:**

1. **Width/Height (12px)**: Applies to both vertical and horizontal scrollbars. Matched to global `scrollbars.css` for consistency.

2. **Track (transparent)**: The scrollbar "track" (background channel) is invisible, letting the table background show through.

3. **Thumb (subtle)**: The draggable "thumb" starts at 40% opacity using `rgba(var(--surface-fg-quaternary-rgb), 0.4)`.

4. **Border + Clip**: The `border: 3px solid transparent` combined with `background-clip: content-box` creates visual "padding" inside the thumb.

5. **Transition**: 200ms fade when hover state changes (smooth, not jarring).

6. **Hover States**:
   - `.scrollArea:hover` → Full opacity (easier to see/target)
   - `:hover` or `:active` on thumb itself → Darkest variant (`--surface-fg-tertiary`)

7. **Firefox Fallback**: `scrollbar-width: thin` + `scrollbar-color` is the best Firefox can do (no transparency support). Always visible, but thin and subtle.

---

## Verification Steps

### Visual Test 1: Default State (Subtle)
1. Open the desktop app (`npm run dev:desktop`)
2. Navigate to the Live Monitor or Historical Review page
3. **Observe**: Scrollbars (both vertical and horizontal) should be visible but **very subtle** (faint grey)

### Visual Test 2: Hover State (Prominent)
1. Hover your mouse over the table area (not on a specific row, just the general table container)
2. **Observe**: Scrollbars should become **noticeably more opaque** (full grey)
3. Move mouse away
4. **Observe**: Scrollbars should fade back to subtle state (~200ms transition)

### Visual Test 3: Direct Thumb Hover
1. Hover directly over the scrollbar thumb (the draggable handle)
2. **Observe**: Thumb should darken to an even stronger grey (`--surface-fg-tertiary`)

### Functional Test 1: Vertical Scroll (Lazy Load)
1. Scroll to the bottom of the table
2. **Observe**: Skeleton row appears, then new data loads
3. **Verify**: Scrollbar thumb adjusts size/position correctly as more rows load

### Functional Test 2: Horizontal Scroll (Column Resize)
1. Resize a column to make the table wider than the viewport
2. **Observe**: Horizontal scrollbar appears (subtle)
3. Scroll left/right
4. **Verify**: "Actions" column stays pinned to the right edge

### Cross-Browser Test
1. Test in **Chrome** (Webkit): Should see opacity transitions
2. Test in **Firefox** (if available): Should see thin, always-visible scrollbar (no opacity change, expected)

---

## Expected File Changes

**File Modified:** `src/desktop/components/DataTable.module.css`

**Lines Added:** ~33 lines (after line 20)

**Git Diff Preview:**
```diff
 .scrollArea {
     flex: 1;
     overflow: auto;
     min-height: 0;
     background: var(--surface-bg-primary);
-    /* Fill deadspace with white */
 }
+
+/* Custom Scrollbar Styling - Subtle by Default, Prominent on Hover */
+
+.scrollArea::-webkit-scrollbar {
+    width: 10px;
+    height: 10px;
+}
+
+.scrollArea::-webkit-scrollbar-track {
+    background: transparent;
+}
+
+.scrollArea::-webkit-scrollbar-thumb {
+    background-color: rgba(156, 163, 175, 0.3);
+    border-radius: 5px;
+    border: 2px solid transparent;
+    background-clip: content-box;
+    transition: background-color 200ms ease;
+}
+
+.scrollArea:hover::-webkit-scrollbar-thumb {
+    background-color: var(--surface-fg-quaternary);
+}
+
+.scrollArea::-webkit-scrollbar-thumb:hover,
+.scrollArea::-webkit-scrollbar-thumb:active {
+    background-color: var(--surface-fg-tertiary);
+}
+
+.scrollArea {
+    scrollbar-width: thin;
+    scrollbar-color: var(--surface-fg-quaternary) transparent;
+}
 
 .table {
     width: max-content;
```

---

## Troubleshooting

### Issue: "Scrollbar is completely invisible"
**Cause:** The `rgba()` hardcoded value might not match your theme.  
**Fix:** Check `src/styles/semantics.css` for the actual hex value of `--surface-fg-quaternary` in your theme, convert to RGB, and replace `156, 163, 175`.

### Issue: "Horizontal scrollbar NOT appearing even when table is wide"
**Cause:** Check if table columns are constrained or phantom spacer is broken.  
**Debug:** Inspect `.table` in DevTools. Verify `width: max-content` is applied. Check if total column widths exceed container.

### Issue: "Sticky Actions column is covered by scrollbar"
**Cause:** This shouldn't happen (scrollbar is in the gutter), but if you see overlap:  
**Fix:** Check `.stickyColumn` z-index (should be 5 for content, 15 for header). Scrollbar z-index is implicit (lower).

### Issue: "Firefox scrollbar is too prominent"
**Context:** Firefox doesn't support opacity on scrollbars. The `thin` keyword + semantic color is the best we can do.  
**Expected:** Always-visible subtle scrollbar in Firefox is acceptable (design trade-off).

---

## Design Tokens Used

| Token | Value (Light Theme) | Usage |
|-------|---------------------|-------|
| `--surface-fg-quaternary` | `#9CA3AF` (grey-400) | Scrollbar thumb default (full opacity on hover) |
| `--surface-fg-tertiary` | `#6B7280` (grey-500) | Scrollbar thumb active/hover (darker) |

> **Note:** The hardcoded `rgba(156, 163, 175, 0.3)` matches `--surface-fg-quaternary` at 30% opacity. If design tokens are updated, this hardcoded value should be updated as well.

---

## Future Enhancements (Optional)

If user feedback suggests the scrollbar disappearing during active scrolling is jarring:

**Enhancement:** Add `:active` state detection to keep scrollbar prominent during scroll.

**Implementation:** Would require a lightweight JS hook (`useScrollbarVisibility`) to set a CSS variable when scrolling. Estimated +30 lines code, +20 minutes work.

**Defer Until:** User feedback indicates current implementation is insufficient.

---

## Success Criteria Checklist

Before marking this task complete, verify:

- [ ] Vertical scrollbar is subtle at rest, prominent on hover
- [ ] Horizontal scrollbar (when table is wide) behaves identically
- [ ] Opacity transitions are smooth (~200ms)
- [ ] Lazy load (scroll to bottom) still triggers correctly
- [ ] Sticky Actions column remains pinned with no visual glitches
- [ ] No layout shift when scrollbar state changes (gutter always reserved)
- [ ] Firefox shows consistent thin scrollbar (no errors in console)

---

## Related Documentation

- [STRATEGY-DataTable-UX.md](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/docs/STRATEGY-DataTable-UX.md) - Table architecture (Phantom Spacer, Skeleton Sentinel)
- [STRATEGY-CSS-Principles.md](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/docs/STRATEGY-CSS-Principles.md) - Design token usage, layout stability principles
- [scrollbars.css](file:///c:/Users/dthompson/Documents/CODE/safety-check-app-concept/src/styles/scrollbars.css) - Global scrollbar defaults (reference only, not modified)
