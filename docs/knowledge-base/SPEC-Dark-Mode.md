# Dark Mode Strategy & Specification

## 1. Core Philosophy: Elevation = Lightness
In dark mode, **lighter surfaces are higher** in the elevation hierarchy. This mirrors how light naturally falls on raised surfaces.

- **Deepest (Background):** Darkest Grey (e.g., `grey-950`)
- **Elevated (Cards):** Lighter Grey (e.g., `grey-900`)
- **Overlay (Modals):** Lightest Grey (e.g., `grey-800`)

## 2. Accessibility & Contrast Strategy
All dark themes must meet **WCAG AA (4.5:1)** contrast ratios. This requires specific semantic overrides that differ from light mode patterns.

### The "Light-on-Dark" Contrast Shift
Primitives that work in light mode (e.g., `red-600` on white) usually fail in dark mode. We use a **"Shift to 400"** strategy for status colors.

| Semantic Token | Light Mode Primitive | Dark Mode Primitive | Rationale |
|:---|:---|:---|:---|
| `--surface-fg-alert-primary` | `red-700` | **`red-300`** | `700` on white, `300` on dark for accessibility. |
| `--surface-fg-warning-primary` | `yellow-700` | **`yellow-300`** | High contrast strategy across both themes. |
| `--surface-fg-success-primary` | `green-700` | **`green-300`** | Consistent 700/300 mapping. |

### Primary Button Contrast
Primary Brand buttons require specific overrides in dark mode to avoid "white text on light brand color" or low-contrast borders.

| Semantic Token | Light Mode Value | Dark Mode Value |
|:---|:---|:---|
| `control-bg-theme` | `theme-700` | **`theme-800`** (Deep Brand) |
| `control-fg-on-solid` | `white` | **`grey-50`** (Soft White) |
| `control-border-primary` | `theme-700` | **`theme-800`** |

## 3. Theme Variants

| Theme | `data-theme` | Description |
|:---|:---|:---|
| Light | *(none)* | Default light mode. |
| Theme | `data-theme` | Description |
|:---|:---|:---|
| Light | *(none)* | Default light mode. |
| Dark C | `dark-c` | **Production Dark.** High Fidelity. Granular grey scale (`940` body, `910` cards). |
| *Archive* | *`dark-a`* | *Commented out. (High Contrast)* |
| *Archive* | *`dark-b`* | *Commented out. (Merged Surfaces)* |

## 4. Reference Palette (Dark C)
*Active as of Dec 2024*

| Token | Hex | OKLCH L | Purpose |
|:---|:---|:---|:---|
| `grey-950` | `#0A0C12` | ~6% | Deepest |
| `grey-940` | `#0E1017` | ~8% | Dark C body |
| `grey-910` | `#161A24` | ~14% | Dark C cards |
| `theme-800` | *(mapped)* | ~30% | Primary Action Background |

## 5. Implementation Guide
- **File:** `src/styles/semantics.css` (Contains all `[data-theme='...']` blocks).
- **Rule:** Never use primitives (e.g., `var(--primitives-red-400)`) directly in components. usage.
- **Hook:** `useTheme.ts` manages persistence and DOM application. **ALWAYS use this hook, never the atom directly.**
