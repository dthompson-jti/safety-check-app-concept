Analysis of the Issues
Side Menu & Tile Animation: The CheckCard components have a layout prop. When the AppShell transforms the main view (pushes it right), or when the AppHeader performs an internal layout update (due to state changes), Framer Motion detects a delta in the tiles' screen position and attempts to "animate" them to their new place, causing them to float or drift.
Scanner/NFC Layout Jumps: The code currently unmounts the AppHeader and AppFooter when entering these modes (isChromeVisible). Removing these elements from the DOM changes the available viewport height, causing the ScheduleView in the background to jump up to fill the void. When closing the scanner, the chrome remounts, pushing the list back down.
"Darker Strip" / Z-Index Bleed: The full-screen overlays (NfcWriteView, ScanView) perform entrance animations. If their z-index is lower than the Side Menu or if they don't fully cover the AppShell's transformed state, parts of the underlying UI bleed through during the transition.
Execution Plan
Stabilize the Chrome (AppShell.tsx): Remove the conditional rendering for AppHeader and AppFooter. They should remain mounted at all times. We will let the full-screen overlays cover them naturally using z-index.
Enforce Stacking Context (css): Update Z-indices to ensure Overlays (105) > Side Menu (100) > Chrome (50) > Content (1).
Audit Motion Profile: Tighten transition durations from 0.4s to 0.25s with a snappier easing curve to feel "rock solid."
Fix AppHeader Stability: Remove layout attributes that cause the header to resize visually during state changes.
Fix CheckCard Thrashing: Restrict the layout prop to only animate position, not size, to reduce calculation overhead during parent transforms.