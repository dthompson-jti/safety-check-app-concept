# UI Audit: Dev Changes (Validated)

---

## 1. Primary Color

- File: `src/theme.ts`
- Line: 45
- Current: `colorPrimaryMain: '#202F3F'`
- Target: `colorPrimaryMain: '#155ACA'`

---

## 2. H1 Color

- File: `src/theme.ts`
- Line: 50
- Current: `colorH1: '#365376'`
- Target: `colorH1: '#181D27'`

---

## 3. H1 Typography

- File: `src/theme.ts`
- Lines: 99-100
- Current:
  - `fontSize: '1.25rem'` (20px)
  - `fontWeight: 400`
- Target:
  - `fontSize: '1.5rem'` (24px)
  - `fontWeight: 600`

---

## 4. H3 Typography

- File: `src/theme.ts`
- Lines: 120-121
- Current:
  - `fontSize: '1.25rem'` (20px)
  - `fontWeight: 600`
- Target:
  - `fontSize: '0.875rem'` (14px)
  - `fontWeight: 600`

---

## 5. Font Family

- File: `src/theme.ts`
- Lines: 96-97
- Current: `'-apple-system, BlinkMacSystemFont, "Segoe UI Variable"...'`
- Target: `'Inter, -apple-system, BlinkMacSystemFont, sans-serif'`
- Action: Add Google Fonts import to `index.html`

---

## 6. Card Background

- File: `src/styles.scss`
- Line: 41
- Current: `--card-background-color: #FFFFFF`
- Target: `--card-background-color: #F9F9F9`

---

## 7. Alert/Missed Color

- File: `src/styles.scss`
- Line: 51
- Current: `--header-missed-text: #e3403a`
- Target: `--header-missed-text: #D63230`

---

## 8. Warning/Due Color

- File: `src/styles.scss`
- Line: 52
- Current: `--header-due-text: #dd8f5d`
- Target: `--header-due-text: #C45500`

---

## 9. Header Background

- File: `src/features/home/components/HomeHeader/HomeHeader.scss`
- Location: Add to `.home-header-container`
- Current: Solid (inherits MUI AppBar primary)
- Target:
  ```scss
  background-color: rgba(249, 249, 249, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  ```

---

## 10. Header Padding

- File: `src/features/home/components/HomeHeader/HomeHeader.scss`
- Line: 12
- Current: `padding: 1rem !important` (16px all sides)
- Target: `padding: 0.5rem 1rem !important` (8px top/bottom, 16px left/right)

---

## 11. Card Border Radius

- File: `src/features/home/components/ResidentCard/ResidentCard.scss`
- Line: 11
- Current: `border-radius: 0.8rem` (12.8px)
- Target: `border-radius: 0.5rem` (8px)

---

## 12. Button Height (Add Override)

- File: `src/theme.ts`
- Location: Add to `components` object
- Current: MUI default (~36px)
- Target:
  ```typescript
  MuiButton: {
    styleOverrides: {
      root: { minHeight: '44px' }
    }
  }
  ```

---

## 13. Button Radius (Add Override)

- File: `src/theme.ts`
- Location: Add to `components.MuiButton.styleOverrides.root`
- Current: MUI default (4px)
- Target: `borderRadius: '8px'`

---

## 14. Global Border Radius

- File: `src/theme.ts`
- Location: Add to `themeOptions`
- Current: None defined
- Target:
  ```typescript
  shape: { borderRadius: 8 }
  ```

---

## 15. Input Height (Add Override)

- File: `src/theme.ts`
- Location: Add to `components` object
- Current: MUI default (56px)
- Target:
  ```typescript
  MuiOutlinedInput: {
    styleOverrides: {
      root: { minHeight: '44px' }
    }
  }
  ```

---

## 16. Focus Ring

- File: `src/styles.scss`
- Lines: 92-100
- Current: `outline: none` (removed entirely)
- Target:
  ```scss
  *:focus-visible {
    outline: 2px solid #155ACA;
    outline-offset: 2px;
  }
  ```

---

## 17. Icons (Architectural)

- Current: MUI SVG (`@mui/icons-material`)
- Target: Material Symbols Font
- Files to Change:
  - `index.html`: Add font link
  - All components importing `@mui/icons-material/*`
- Example: `src/features/home/components/HomeHeader/HomeHeader.tsx` Lines 2-4

---

## Summary by File

| File | Changes |
|------|---------|
| `src/theme.ts` | 1, 2, 3, 4, 5, 12, 13, 14, 15 |
| `src/styles.scss` | 6, 7, 8, 16 |
| `HomeHeader.scss` | 9, 10 |
| `ResidentCard.scss` | 11 |
| `index.html` | 5 (font), 17 (icons) |
