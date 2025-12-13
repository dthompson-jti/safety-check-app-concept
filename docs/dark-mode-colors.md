# Semantic State Color Analysis (OKLCH)

## The Problem
In light mode, semantic backgrounds use very light pastels (e.g., `yellow-50: #FFF9EB`) that provide subtle tinting.
In dark mode, we're using deep saturated colors (e.g., `yellow-950: #4E1D08` or custom `#1a1508`) which creates inconsistency.

## OKLCH Analysis

### Light Mode (Current - Working Well)
| State | BG Color | OKLCH (L, C, H) | Notes |
|:---|:---|:---|:---|
| Warning | `yellow-50` (#FFF9EB) | L:98%, C:0.03, H:95° | Very light, low chroma |
| Error | `red-50` (#FFF3F2) | L:97%, C:0.02, H:20° | Very light, low chroma |
| Success | `green-50` (#E6FFEF) | L:97%, C:0.04, H:145° | Very light, low chroma |
| Info | `blue-25` (#F4FAFF) | L:98%, C:0.02, H:230° | Very light, low chroma |

**Pattern:** L≈97-98%, C≈0.02-0.04 (very low saturation)

### Dark Mode (Current - Problematic)
| State | BG Color | OKLCH (L, C, H) | Issue |
|:---|:---|:---|:---|
| Warning | `#1a1508` | L:12%, C:0.05, H:85° | Hue shifted, too brown |
| Error | `red-950` (#54150C) | L:20%, C:0.10, H:25° | Too saturated |
| Success | `green-950` (#0A331E) | L:22%, C:0.06, H:155° | Acceptable |
| Info | `blue-950` (#062B40) | L:20%, C:0.05, H:220° | Acceptable |

**Problem:** Inconsistent lightness (12-22%) and chroma (0.05-0.10)

## Proposed Solution: Consistent Dark Mode Palette

**Target:** L≈15%, C≈0.03 (matching low chroma pattern of light mode)

### Recommended Values
| State | Proposed Color | OKLCH Target | Hex |
|:---|:---|:---|:---|
| Warning | Low-chroma amber | L:15%, C:0.03, H:85° | `#1f1812` |
| Error | Low-chroma red | L:15%, C:0.03, H:20° | `#1f1415` |
| Success | Low-chroma green | L:15%, C:0.03, H:145° | `#121a15` |
| Info | Low-chroma blue | L:15%, C:0.03, H:230° | `#12151a` |

### Border Strategy

Light mode uses `-500/-600` variants for borders (high visibility).

**Dark A/B** use `-600` (slightly muted but visible):
| State | Light Border | Dark A/B Border |
|:---|:---|:---|
| Warning | `yellow-500` | `yellow-600` (#CD6000) |
| Error/Alert | `red-500` | `red-600` (#E3403A) |
| Success | `green-500` | `green-600` (#0D935A) |
| Info | `blue-500` | `blue-600` (#0085C9) |

**Dark C** uses `-700` for higher contrast against the deeper grey body (grey-940):
| State | Dark C Border | OKLCH L |
|:---|:---|:---|
| Warning | `yellow-700` (#B04100) | ~42% |
| Error/Alert | `red-700` (#BB2E28) | ~40% |
| Success | `green-700` (#017647) | ~38% |
| Info | `blue-700` (#016AA2) | ~42% |

### Dark C Background Mapping (Updated 2024-12)

Dark C backgrounds were shifted UP for visibility (from 975/950 to 900/850):

| State | Token | Primitive | OKLCH L |
|:---|:---|:---|:---|
| Warning BG | `--surface-bg-warning-primary` | `yellow-900` | ~18% |
| Warning BG Secondary | `--surface-bg-warning-secondary` | `yellow-850` | ~22% |
| Alert BG | `--surface-bg-error-primary` | `red-900` | ~18% |
| Info BG | `--surface-bg-info` | `blue-900` | ~18% |
| Success BG | `--surface-bg-success` | `green-900` | ~18% |
