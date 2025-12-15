# IDEA: Lighthouse Performance Optimization

## Current State (December 2024)

### Lighthouse Scores
| Metric | Score |
|--------|-------|
| **Performance** | 53 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

### Core Web Vitals
| Metric | Value | Target |
|--------|-------|--------|
| LCP (Largest Contentful Paint) | 3,220ms | < 2,500ms |
| Time to First Byte | 70ms | ✅ Good |
| Element Render Delay | 3,150ms | Needs reduction |

### Network Payload: 5,281 KB

| Asset | Size | Notes |
|-------|------|-------|
| `MaterialSymbols...woff2` | **4,078 KB** | 77% of total payload |
| `vendor-heavy.js` | 96 KB | framer-motion, QR scanner |
| `index.js` | 73 KB | App bundle |
| `error.mp3` | 38 KB | Audio feedback |
| `vendor-ui.js` | 31 KB | Radix UI |
| `Inter-roman.var.woff2` | 352 KB | Variable Font (100-900) |

### Main Thread Work: 2,390ms

| Category | Time |
|----------|------|
| Script Evaluation | 1,527ms |
| Other | 624ms |
| Style & Layout | 210ms |
| Rendering | 29ms |

---

## Current Optimizations (Implemented)

1. **Critical SVG Icons** — Login screen uses inline SVGs (`CriticalIcons.tsx`) instead of font
2. **Async Font Loading** — Material Symbols uses `fetchpriority="low"` preload
3. **Inline Critical CSS** — Background colors and dark mode detection in `index.html`
4. **Code Splitting** — `LoginView` and `AppShell` lazy-loaded via `React.lazy()`
5. **Manual Chunks** — Vendor libraries split into `vendor-react`, `vendor-ui`, `vendor-heavy`

---

## Proposed Improvements

### High Impact

#### 1. Icon Font Subsetting
**Impact:** Reduce payload by ~4 MB (77% reduction)

The full Material Symbols font includes thousands of icons. The app uses ~50.

**Approach:**
- Use [glyphhanger](https://github.com/filamentgroup/glyphhanger) or [fonttools](https://fonttools.readthedocs.io/) to subset
- Generate a custom `.woff2` with only used icons
- Expected size: ~50 KB (vs 4 MB)

**Files to modify:**
- `public/fonts/MaterialSymbolsRounded.woff2` (replace)
- `src/styles/fonts.css` (update if font name changes)

---

#### 2. Preload Critical JS Chunks
**Impact:** Reduce LCP by ~500ms

Add `<link rel="modulepreload">` for the vendor-react chunk to start downloading earlier.

```html
<link rel="modulepreload" href="/assets/vendor-react-[hash].js">
```

**Challenge:** Hash changes per build, requires Vite plugin or manual update.

---

### Medium Impact

#### 3. Defer Audio Assets
**Impact:** Reduce initial payload by ~50 KB

`error.mp3` and `success.mp3` are downloaded on initial load. They could be dynamically imported when first needed.

**Files to modify:**
- `src/data/useAudio.ts` or wherever audio is loaded

---

#### 4. Replace howler.js
**Impact:** Reduce JS by ~37 KB

`howler.js` is 37KB. The Web Audio API can handle simple sound effects directly.

**Trade-off:** Requires custom implementation, may affect iOS Safari compatibility.

---

### Low Impact (Hosting Constraints)

#### 5. Cache Headers
GitHub Pages defaults to 10-minute cache. Custom headers require:
- A different hosting provider (Vercel, Netlify)
- Or a CDN in front of GitHub Pages

---

## Acceptance Criteria

- [ ] Performance score ≥ 80
- [ ] LCP < 2,500ms
- [ ] Total payload < 1 MB (excluding fonts loaded async)
- [ ] Icon font < 100 KB

---

## References

- [Material Symbols subsetting guide](https://developers.google.com/fonts/docs/material_symbols#self-hosting_guide)
- [Lighthouse Performance scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
- [Vite modulepreload](https://vitejs.dev/guide/build.html#preload-directives-generation)
