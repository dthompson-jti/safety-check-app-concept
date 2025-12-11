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
| 800 | ~28% | Existing light-dark |
| 850 | ~22% | **Borders** |
| 900 | ~18% | Mid |
| 950 | ~13% | Secondary backgrounds |
| 975 | ~8% | **Primary backgrounds (darkest)** |

### Dark C Status Token Mapping

| Type | Token Used |
|:---|:---|
| Backgrounds | `-975` (darkest) |
| Secondary | `-950` |
| Borders | `-850` |

---

## Inverted Components

These components **invert** in dark mode (light-on-dark → dark-on-light):

- Tooltip
- Popover

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
