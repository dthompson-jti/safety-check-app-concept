# Dark Mode Strategy & Specification

## 1. Core Philosophy: Elevation = Lightness
In dark mode, **lighter surfaces are higher** in the elevation hierarchy. This mirrors how light naturally falls on raised surfaces.

- **Deepest (Background):** Darkest Grey (e.g., `grey-950`)
- **Elevated (Cards):** Lighter Grey (e.g., `grey-900`)
- **Overlay (Modals):** Lightest Grey (e.g., `grey-800`)

## 2. Theme Variants

| Theme | `data-theme` | Description |
|:---|:---|:---|
| Light | *(none)* | Default light mode |
| Dark A | `dark-a` | Cards **lighter** than body (secondary=950, primary=900) |
| Dark B | `dark-b` | Cards **same** as body (primary=950, secondary=900) |
| Dark C | `dark-c` | High-fidelity greys (940→910→880→860→840) - **Default for Future Ideas** |

## 3. Reference Palette (Dark C)
*Active as of Dec 2024*

| Token | Hex | OKLCH L | Purpose |
|:---|:---|:---|:---|
| `grey-950` | `#0A0C12` | ~6% | Deepest |
| `grey-940` | `#0E1017` | ~8% | Dark C body |
| `grey-910` | `#161A24` | ~14% | Dark C cards |
| `theme-975` | `#011a42` | ~13% | Selected state base |

## 4. Semantic Status Colors (OKLCH Strategy)
To maintain consistency with light mode's "low chroma" pastels, dark mode uses specific low-saturation, low-lightness tokens.

**Target:** L≈15%, C≈0.03

| State | Background Token | Logic |
|:---|:---|:---|
| **Warning** | `yellow-900` | L≈18%, visible against grey body |
| **Error** | `red-900` | L≈18% |
| **Success** | `green-900` | L≈18% |
| **Info** | `blue-900` | L≈18% |

**Shadows:** Dark mode shadows are automatically strengthened (2-10x opacity) via `semantics.css` to ensure visibility against dark backgrounds.

## 5. Implementation Guide
- **File:** `src/styles/semantics.css` (Contains all `[data-theme='...']` blocks).
- **Hook:** `useTheme.ts` manages persistence and DOM application. **ALWAYS use this hook, never the atom directly.**
- **FOUC Prevention:** Blocking script in `index.html` restores theme from localStorage before paint.
