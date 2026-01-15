# SPEC: Mobile Header Offline State (Implemented)

## Status
**✅ COMPLETE** - Implemented 2024-12-30

## Objective
Create a smooth, low-CLS offline state transition for the mobile header that maintains visibility of status badges while adding an offline pill with sync capabilities.

## Implemented Architecture

### 1. Layout & Height
- **Online State:** Header height = `calc(var(--modal-header-height) + 6px)` (66px)
- **Offline State:** Same height (no layout shift)
- **Transition:** 0.5s all properties via CSS

### 2. Component Hierarchy
```
.header[data-offline="true"]
  └── .headerContent
        ├── .leftActions [Menu Button - stationary]
        ├── .centerContent
        │     ├── .statusBadgesWrapper (motion.div, y: -2 when offline)
        │     │     └── <StatusBar variant="solid" />
        │     └── .offlinePillWrapper (AnimatePresence)
        │           └── .offlineBar (button, data-status="offline|syncing|connected")
        │                 └── .offlineBarContent
        │                       └── .offlineContentRow (AnimatePresence mode="wait")
        │                             ├── [offline] "Offline: MM:SS — N Queued"
        │                             ├── [syncing] sync icon + "Connecting..."
        │                             └── [connected] check icon + "Connected"
        └── .rightActions [User Avatar - stationary]
```

### 3. Animation Sequence

#### Entering Offline Mode (0.5s)
1. Header background fades to translucent dark (`rgba(37, 43, 55, 0.85)`)
2. Status badges animate up (`y: -2`)
3. Offline pill slides up from below (`y: 12` → `y: -6`)

#### Pill Content State Changes
- **Exit:** Instant (0.05s opacity fade) - eliminates empty gap
- **Enter:** Smooth (0.4s scale 0.95→1 + opacity)
- **Min-width:** 115px - prevents size jump between states

#### Connected Success Sequence (1.7s total)
1. `0.0s` - Content starts morphing (check icon + "Connected")
2. `0.4s` - Content settles; background fade begins (grey → green over 0.3s)
3. `0.7s` - Pulse animation starts (outward glow, 1s)
4. `1.7s` - Animation complete, returns to online

### 4. Styling Tokens

| Element | Token/Value |
|---------|-------------|
| Offline Background | `rgba(37, 43, 55, 0.85)` with `blur(var(--blur-glass))` |
| Pill Background | `var(--surface-bg-secondary-solid)` |
| Pill Border | `1px solid rgba(255, 255, 255, 0.15)` |
| Pill Radius | `var(--radius-pill)` |
| Timer Text | `var(--font-size-sm)`, 500 weight, `var(--surface-fg-on-solid)` |
| Queued Text | `var(--font-size-sm)`, 400 weight, `var(--surface-fg-on-solid-faint)` |
| Icon Color | `var(--surface-fg-on-solid)` (via inline style - CSS module limitation) |
| Success Background | `var(--surface-bg-success-solid)` |
| Success Pulse | `rgba(13, 147, 90, 0.6)` expanding to 8px |

### 5. Key Implementation Notes

#### CSS Module + Global Class Limitation
Material Symbols icons require inline styles for color because CSS module descendant selectors can't target the unhashed `.material-symbols-rounded` class:
```tsx
<span 
  className="material-symbols-rounded"
  style={{ color: 'var(--surface-fg-on-solid)' }}
>check</span>
```

#### Framer Motion Transition Typing
Different enter/exit durations are specified by embedding transition in each prop:
```tsx
animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
exit={{ opacity: 0, transition: { duration: 0.05 } }}
```

#### Overflow for Pulse
`.offlinePillWrapper` must have `overflow: visible` to allow success pulse box-shadow to expand.

### 6. Key Files
- `src/features/Shell/AppHeader.tsx` - Component logic
- `src/features/Shell/AppHeader.module.css` - All styles and animations
- `src/data/atoms.ts` - `connectionStatusAtom` state management
