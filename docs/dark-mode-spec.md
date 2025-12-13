# Dark Mode Strategy & Specification

## Overview
This document defines the dark mode implementation strategy for the Safety Check App.

### Core Principle: Elevation = Lightness
In dark mode, **lighter surfaces are higher** in the elevation hierarchy. This mirrors how light naturally falls on raised surfaces.

---

## Theme Variants

| Theme | `data-theme` | Description |
|:---|:---|:---|
| Light | *(none)* | Default light mode |
| Dark A | `dark-a` | Cards **lighter** than body (secondary=950, primary=900) |
| Dark B | `dark-b` | Cards **same** as body (primary=950, secondary=900) |
| Dark C | `dark-c` | High-fidelity greys (940→910→880→860→840) |

---

## Expanded Grey Palette (Dark)

| Token | Hex | OKLCH L | Purpose |
|:---|:---|:---|:---|
| `grey-950` | `#0A0C12` | ~6% | Deepest |
| `grey-940` | `#0E1017` | ~8% | Dark C body |
| `grey-930` | `#11141B` | ~10% | |
| `grey-920` | `#141820` | ~12% | |
| `grey-910` | `#161A24` | ~14% | Dark C cards |
| `grey-900` | `#181D27` | ~13% | |
| `grey-880` | `#1C212C` | ~16% | |
| `grey-860` | `#202531` | ~18% | Dark C modals |
| `grey-840` | `#242936` | ~19% | |
| `grey-800` | `#252B37` | ~20% | |

---

## OKLCH Color Ramps (Status Colors)

All status colors use consistent OKLCH lightness steps:

| Step | OKLCH L | Usage |
|:---|:---|:---|
| 700 | ~38-42% | **Borders (Dark C)** |
| 800 | ~28% | Existing light-dark |
| 850 | ~22% | Secondary backgrounds (Dark C) |
| 900 | ~18% | **Primary backgrounds (Dark C)** |
| 950 | ~13% | Dark A/B backgrounds |
| 975 | ~10% | Theme-tinted selected states |

### Theme Palette Extension

The theme (blue) palette was extended with a `theme-975` primitive for ultra-dark selected states:

| Token | Hex | OKLCH L | Usage |
|:---|:---|:---|:---|
| `theme-950` | `#022762` | ~20% | Selected state hover (dark) |
| `theme-975` | `#011a42` | ~13% | Selected state base (dark) |

### Dark C Status Token Mapping (Updated)

| Type | Token Used | Notes |
|:---|:---|:---|
| Backgrounds | `-900` | L≈18%, visible against grey-940 body |
| Secondary | `-850` | L≈22% |
| Borders | `-700` | L≈38-42%, high contrast |
| Foregrounds | `-400` | Lighter for dark mode readability |

### Dark Mode Selected States

| Token | Primitive | Notes |
|:---|:---|:---|
| `--control-bg-selected` | `theme-975` | Subtle blue tint on dark bg |
| `--control-bg-selected-hover` | `theme-950` | Lighter on hover |
| `--control-fg-selected` | `theme-200` | Raised one step for contrast |
| `--control-fg-selected-hover` | `theme-100` | Near-white on hover |

---

## Component Behavior in Dark Mode

### Inverted Components

These components **invert** in dark mode (light-on-dark → dark-on-light):

- **Tooltip**: Maintains high contrast by inverting to light background with dark text

### Standard Dark Mode Components

These components follow standard semantic tokens (dark background in dark mode):

- **Popover** (including advanced avatar menu): Uses `--surface-bg-primary` and follows theme
- **Modals**: Standard elevation-based theming
- **Cards**: Standard elevation-based theming

### Enhanced Visual Depth

**Shadows** are automatically strengthened in all dark modes to improve visual hierarchy:

| Shadow Token | Light Mode Opacity | Dark Mode Opacity | Usage |
|:---|:---|:---|:---|
| `--surface-shadow-xs` | ~5% | 20% | Minimal elevation |
| `--surface-shadow-sm` | ~5-10% | 25% | Small components |
| `--surface-shadow-md` | ~6-10% | 20-30% | Cards |
| `--surface-shadow-lg` | ~5-8% | 25-35% | Elevated panels |
| `--surface-shadow-xl` | ~5-8% | 30-40% | **Popovers, dropdowns** |
| `--surface-shadow-2xl` | ~18% | 40-50% | Modals |
| `--surface-shadow-3xl` | ~14% | 40-45% | Maximum elevation |

> **Rationale**: Dark backgrounds reduce shadow visibility. Higher opacity shadows (2-10x stronger) maintain clear elevation hierarchy and visual separation between layers.

---

## Implementation Files

| File | Purpose |
|:---|:---|
| `src/styles/primitives.css` | Expanded grey + color palettes |
| `src/styles/semantics.css` | `[data-theme='dark-a/b/c']` blocks |
| `src/styles/tooltip.css` | Tooltip inversion |
| `src/styles/popover.css` | Popover inversion |
| `src/data/useTheme.ts` | Theme state hook |
| `index.html` | FOUC prevention script |

---

## FOUC Prevention

Blocking script in `index.html`:

```html
<script>
(function () {
  const stored = localStorage.getItem('app-theme');
  if (stored === 'dark-a' || stored === 'dark-b' || stored === 'dark-c') {
    document.documentElement.setAttribute('data-theme', stored);
  }
})();
</script>
```

---

## Developer Testing

Theme toggle: **Developer Tools → App Style → Theme** (Light / Dark A / Dark B / Dark C)
