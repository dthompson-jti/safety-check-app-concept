# Motion System Strategy & Specification

## Executive Summary
This document outlines the current motion strategy, implementation details, and technical specifications for animations within the application. It serves as a source of truth for maintaining consistency in "feel" across the app, primarily utilizing `framer-motion`.

## 1. Strategy

The motion design language is **"Cinematic & Responsive"**, focusing on high-craft feel through custom bezier curves and snappy spring dynamics.

### Core Principles
1.  **Emphasized Deceleration**: Large movements (Page slides, Modals) use a custom cubic bezier that starts fast and lands softly.
2.  **Snappy Feedback**: Micro-interactions (Toasts, Toggles) use high-stiffness springs for immediate responsiveness.
3.  **Visual Continuity**: Use valid `layoutId` sharing for tab indicators and morphed elements to maintain context.
4.  **Cinematic Transitions**: Complex states (NFC Scan) use sequenced timeline animations (SVG paths, stagger) rather than simple distinct states.

### Usage Inventory
| Component | Interaction | Tech |
| :--- | :--- | :--- |
| **Page Navigation** | Slide In/Out (Right) | `AnimatePresence`, `motion.div` |
| **Modals** | Slide Up / Slide In (Right) | `AnimatePresence`, `Variants` |
| **Toasts** | Spring Entry (Bottom) + Swipe | `motion.li`, `Radix Toast` |
| **Tabs** | Shared Underline | `layoutId` |
| **NFC Button** | Complex State Morph / SVG | `motion.path`, `motion.circle` |
| **Gestures** | filmStrip / SideMenu | `useMotionValue` |

---

## 2. Specification

### Constants & Tokens

#### Timing
- **Standard Duration**: `0.35s` (Views, Modals)
- **Fast Duration**: `0.2s` (Micro-interactions)
- **Exit Duration**: `0.15s` (Toasts, immediate dismissals)
- **Complex Sequence**: `0.4s` + delays (NFC Rings)

#### Curves (Easing)
**The "Safety Check" Curve**: A custom emphasized decelerate curve.
```typescript
const EASE_EMPHASIZED = [0.16, 1, 0.3, 1]; // cubic-bezier(0.16, 1, 0.3, 1)
```

#### Spring Physics
**The "Snappy" Spring**: Used for Toasts / Notification entering.
```typescript
const SPRING_SNAPPY = { type: 'spring', stiffness: 400, damping: 30 };
```

### Component Patterns

#### A. View / Page Transitions
**Pattern**: Slide in from right, slide out to right.
```tsx
<motion.div
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ 
    type: 'tween', 
    duration: 0.35, 
    ease: [0.16, 1, 0.3, 1] 
  }}
>
  {children}
</motion.div>
```

#### B. Full Screen Modal
**Pattern**: Flexible variants for direction.
```typescript
const variants = {
  hidden: { x: '100%' }, // or y: '100%'
  visible: { x: 0, y: 0 },
  exit: { 
    x: '100%',
    transition: { type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  }
};
```

#### C. Notification / Toast
**Pattern**: Spring up from bottom, scale in.
```tsx
<motion.li
  initial={{ y: -20, scale: 0.95, opacity: 0 }}
  animate={{ y: 0, scale: 1, opacity: 1 }}
  exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.15 } }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
>
```

---

## 3. Implementation Details

- **Global Context**: `AnimatePresence` with `mode="wait"` is used in `App.tsx` and `AppShell.tsx` to handle high-level route/view changes seamlessly.
- **Gesture System**: `GestureProvider.tsx` exposes `useMotionValue` hooks (`filmStripProgress`), allowing deep components to continuously react to swipe gestures without re-renders.
- **Performance**: 
  - `will-change` is implicitly handled by Framer Motion.
  - SVG animations use `vectorEffect="non-scaling-stroke"` for crisp rendering during scale.

---

## 4. Pill State Morphing Pattern (Instant Exit, Slow Enter)

When animating content swaps inside a fixed container (like the offline pill), use asymmetric timing to eliminate empty gaps.

### The Problem
`AnimatePresence mode="wait"` waits for exit to complete before enter starts. With equal 0.4s durations, the container appears empty for 0.4s.

### The Solution
Make exit nearly instant (0.05s), keep enter smooth (0.4s).

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentState}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
    }}
    exit={{ 
      opacity: 0, 
      transition: { duration: 0.05 } 
    }}
  >
    {content}
  </motion.div>
</AnimatePresence>
```

### Why It Works
- Old content vanishes immediately (user barely notices)
- New content appears smoothly (creates "morphing" feel)
- No empty container gap

### When to Use
- Pill/badge content changing between states
- List items transitioning between modes
- Any fixed-size container with swapping content

---

> [!NOTE] 
> **MUI Migration Strategy (Hypothetical)**
> 
> If migrating to Material UI (MUI), we would map these behaviors as follows:
> 
> **1. Page Transitions (Slide)**
> MUI's `<Slide>` component is the direct equivalent.
> ```tsx
> import Slide from '@mui/material/Slide';
> <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit timeout={350}>
>   <Paper>...</Paper>
> </Slide>
> ```
> *Note: MUI's default easing is `theme.transitions.easing.easeOut`. We would override this in the core theme to match `cubic-bezier(0.16, 1, 0.3, 1)`.*
> 
> **2. Modals (Dialog)**
> MUI `<Dialog>` accepts a `TransitionComponent`.
> ```tsx
> const Transition = React.forwardRef(function Transition(props, ref) {
>   return <Slide direction="up" ref={ref} {...props} />;
> });
> <Dialog TransitionComponent={Transition} ... />
> ```
> 
> **3. Shared Element Transitions (LayoutId)**
> MUI **does not** support shared element transitions out of the box. We would either:
> - Keep `framer-motion` purely for these specific interactions (it works fine inside MUI).
> - Drop the specific morphing effect (e.g., tab underline) in favor of standard MUI Tab indicators (css transition).
> 
> **4. Complex SVG (NFC Scan)**
> MUI has no timeline orchestration. We would need to:
> - Keep `framer-motion` for this component.
> - Rewrite using CSS `@keyframes` (harder to sync).
> - Use `react-spring` if that was the "MUI-preferred" alternative, though Framer Motion is generally standard for React now.

