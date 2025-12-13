# PRD-006: Time Display Options

> [!CAUTION]
> **REMOVED**: This feature was removed on 2025-12-10. The application now uses Relative (countdown) time display only. See `docs/legacy-sound-implementation.md` for the pattern used to document legacy features.


## 1. Overview
User-configurable time display format for Check Cards: Relative (countdown), Absolute (wall-clock), or Dual (both).

## 2. Problem & Goals
**Problem:** Relative countdown requires mental math for planning.
**Goal:** Let users choose their preferred time format with zero clicks per check.

## 3. Scope
**In Scope:** Settings toggle, CheckCard rendering, global state persistence.
**Out of Scope:** Per-card customization, History view changes.

## 4. UX/UI Specification

### Modes
| Mode | Display | Style |
|------|---------|-------|
| **Relative** (Default) | `14m 32s` | Bold, Status Color |
| **Absolute** | `10:42 AM` | Bold, Status Color, 1fps |
| **Dual** | Top: `10:42 AM` (Dimmed) / Bottom: `14m 32s` (Color) | Stacked, same size/weight |

### Wireframe (Dual Mode)
```
+-------------------------------------------------------+
| A2-205                                          [Due] |
|                                              10:42 AM | <- 14px, Medium, Dimmed
| Sofia Petrova                                   51.3s | <- 14px, Bold, Color
+-------------------------------------------------------+
```

### Settings UI
Add to `SettingsModal.tsx` under "Preferences":
```
Time Display
[ Relative | Absolute | Dual ]
```

## 5. Architecture

### State
- `appConfigAtom.timeDisplayMode: 'relative' | 'absolute' | 'dual'`

### Components
- `CheckCard.tsx`: Read `timeDisplayMode`, render accordingly.
- `SettingsModal.tsx`: Add `SegmentedControl` for toggle.

### CSS
```css
.timeDisplay {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}
.dualSecondary {
  font-size: 14px;
  font-weight: 500;
  /* Inherit color/tokens, apply opacity */
  opacity: 0.7;
}
```

## 6. File Manifest
- `[MODIFIED] src/data/atoms.ts`
- `[MODIFIED] src/features/Schedule/CheckCard.tsx`
- `[MODIFIED] src/features/Schedule/CheckCard.module.css`
- `[MODIFIED] src/features/Overlays/SettingsModal.tsx`

## 7. Unintended Consequences
| Concern | Mitigation |
|---------|------------|
| `missed` status | Return "Missed" text in all modes |
| Card height increase (Dual) | Acceptable; already variable |

## 8. Definition of Done
- [ ] Toggle in Settings persists to localStorage
- [ ] Relative mode unchanged (regression)
- [ ] Absolute mode shows seconds, 1fps
- [ ] Dual mode correct layout
- [ ] `npm run lint` and `npm run build` pass
