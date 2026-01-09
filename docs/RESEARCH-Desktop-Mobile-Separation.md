# Desktop-Mobile Separation Strategies

## Problem Statement
Desktop UI updates are causing unintended regressions in mobile.

**Key Constraint**: All **design tokens** (colors, spacing, typography) are **shared**. The difference is in **component usage** — different button sizes, layouts, control heights, etc.

| Shared (Safe) | Platform-Specific (Risk) |
|---------------|--------------------------|
| Colors | Button sizes (`data-size`) |
| Spacing tokens | Control heights |
| Typography | Layout grids |
| Border radii | Touch targets |

---

## Current Architecture

```
src/
├── desktop/           # ✅ Isolated desktop components
│   ├── components/    #    Desktop-only (DataTable, DetailPanel)
│   └── App.tsx        #    Desktop root
├── features/          # Mobile-first feature folders
├── components/        # ⚠️ Shared components (Button, Select)
├── styles/            # Shared tokens (SAFE)
│   ├── primitives.css #    ✅ Base tokens
│   ├── semantics.css  #    ✅ Semantic tokens
│   ├── buttons.css    #    ⚠️ Size variants affect both
│   └── forms.css      #    ⚠️ Height defaults affect both
```

---

## Strategy Comparison

### 1. CSS Cascade Layers (Recommended)

**Approach**: Use `@layer` to create priority tiers.

```css
/* index.css */
@layer base, mobile, desktop;

/* buttons.css */
@layer mobile {
  .btn { height: 44px; } /* Mobile default */
}

/* desktop/styles.css */
@layer desktop {
  .btn { height: 36px; } /* Desktop override */
}
```

| Pros | Cons |
|------|------|
| Browser-native, no tooling | Requires CSS restructuring |
| Explicit priority chain | Learning curve for team |
| Zero runtime cost | Older browser support |

---

### 2. Scoped CSS Variables

**Approach**: Use `[data-platform="desktop"]` selector to scope tokens.

```css
:root {
  --control-height-md: 44px; /* Mobile default */
}

[data-platform="desktop"] {
  --control-height-md: 36px; /* Desktop override */
}
```

```tsx
// Desktop App.tsx
<div data-platform="desktop">...</div>
```

| Pros | Cons |
|------|------|
| Simple to implement | Requires wrapper element |
| Clear intent | Token scatter risk |
| Works now | Inspector noise |

---

### 3. Dedicated Desktop Theme File

**Approach**: Create `desktop-overrides.css` imported only by desktop entry.

```css
/* src/desktop/desktop-overrides.css */
.btn[data-size="s"] { height: 32px; }
.btn[data-size="m"] { height: 36px; }
```

```tsx
// src/desktop/App.tsx
import './desktop-overrides.css';
```

| Pros | Cons |
|------|------|
| Zero risk to mobile | Potential style duplication |
| Fast to implement | Separate maintenance burden |
| Clear ownership | Must track mobile changes |

---

### 4. Component Abstraction (Future)

**Approach**: Create platform-specific component variants.

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx       # Shared logic
│   │   ├── Button.mobile.css
│   │   └── Button.desktop.css
```

| Pros | Cons |
|------|------|
| Maximum isolation | Significant refactor |
| Clear ownership | Increased file count |
| Testable per-platform | Coordination overhead |

---

## Recommendation

Given that **tokens are shared** but **the same size prop should map to different values per platform**:

| Size Prop | Mobile | Desktop |
|-----------|--------|---------|
| `data-size="s"` | 36px | 32px |
| `data-size="m"` | 44px | 36px |
| `data-size="l"` | 48px | 44px |

### Primary Strategy: Platform-Scoped Size Variables

Use `[data-platform="desktop"]` to override control height tokens:

```css
/* primitives.css (mobile defaults) */
:root {
  --control-height-sm: 36px;
  --control-height-md: 44px;
  --control-height-lg: 48px;
}

/* desktop-overrides.css */
[data-platform="desktop"] {
  --control-height-sm: 32px;
  --control-height-md: 36px;
  --control-height-lg: 44px;
}
```

```tsx
// src/desktop/App.tsx
<div data-platform="desktop">
  {/* All children inherit desktop sizes */}
</div>
```

**Benefit**: Same component code (`data-size="m"`) works everywhere; CSS handles the mapping.

---

## Implementation Checklist

- [ ] Add `data-platform="desktop"` wrapper to desktop App
- [ ] Create `src/desktop/desktop-overrides.css` with size token overrides
- [ ] Import overrides in `src/desktop/App.tsx`
- [ ] Document pattern in `AGENTS.md`
