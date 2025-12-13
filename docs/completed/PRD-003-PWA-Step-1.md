# PWA Implementation Evaluation

## Goal Description
Transform the current "project demo" into a "High-Craft PWA" (Progressive Web App). The goal is to make the app installable (A2HS), reliable offline (service worker), and visually integrated with the OS (splash screens, icons, theme colors), while maintaining the "demo spirit" (easy to run/deploy).

## Strategy vs. Tactics

### Strategy: "Native-Lite" Wrapper
We should treat the PWA layer as a "Native-Lite" wrapper around the existing application. The app currently handles "simulated" offline states and drafts. The PWA layer should *actually* enable the app to load without network, but delegate the "business logic" of offline (e.g. queueing requests) to the existing application logic. We do not need a complex synchronization engine in the Service Worker; the app's existing `localStorage` logic handles resilience well. The Service Worker's role is strictly **Asset Delivery**.

### Tactics: Tooling Integration
Leverage `vite-plugin-pwa` to automate the complex, error-prone parts of PWA generation (manifest specificities, asset hashing, SW generation). This ensures we stay "High-Craft" by letting the tool handle browser compatibility quirks while we focus on the visual assets and configuration.

## Evaluation of Approaches

### 1. Manual Service Worker + Handmade Manifest
- **Pros:** Full control, zero magic.
- **Cons:** High effort to maintain asset lists (precaching), easy to break updates (cache invalidation is hard).
- **Verdict:** Too cumbersome for a prototype/demo.

### 2. `vite-plugin-pwa` (Minimal)
- **Pros:** Instant "installability", auto-caching of build assets.
- **Cons:** Generic "Android" feel if not customized.
- **Verdict:** Good baseline, but needs configuration to meet "High-Craft" standards.

### 3. `vite-plugin-pwa` (High-Craft Configuration) - **RECOMMENDED**
- **Pros:** Automates asset caching, allows deep configuration of Manifest for "App-like" feel (standalone, theme colors, shortcuts).
- **Cons:** Requires generating specific assets.
- **Verdict:** The correct path. It balances low maintenance code with high quality output.

## Recommended Path: High-Craft Configured Plugin

### 1. Asset Generation (Prerequisite)
We cannot have a "High-Craft" PWA without proper assets. We need to generate a full suite of icons from a master SVG.
- **Task:** Create `public/pwa-icons` folder.
- **Task:** Generate `192x192`, `512x512`, `apple-touch-icon` (180x180), and `maskable` variants. `vite.svg` is insufficient.

### 2. Vite Configuration (`vite-plugin-pwa`)
Install `vite-plugin-pwa` and configure it with the `generateSW` strategy.
- **RegisterWebManifest:** Auto-inject link tag.
- **Workbox Config:** Precache `index.html`, `js`, `css`, `svg`, `mp3` (critical for this app's sounds).
- **Manifest Config:**
    - `display: "standalone"` (Removes browser chrome)
    - `background_color`: Matches `var(--app-background)` (Dark mode check needed)
    - `theme_color`: Matches Header color to blend status bar.
    - `orientation`: "portrait" (Safety check apps are typically handheld).

### 3. Application Updates (The "Demo Spirit")
Since this is a demo, we want updates to apply immediately to avoid "stale demo code".
- **Strategy:** `registerType: 'autoUpdate'`.
- **Reasoning:** In a real heavy app, we'd ask the user to reload (`prompt` strategy). For a demo prototype, we want the latest code to just work when they refresh or open it.

### 4. Apple iOS Specifics
iOS PWA support is getting better but still needs help.
- **Meta Tags:** Add `apple-mobile-web-app-status-bar-style` (black-translucent or default) to `index.html`.
- **Splash Screens:** (Optional for MVP, but recommended for High-Craft) - iOS requires specific splash images to look native. For now, rely on the background color and icon.

## Affected Files

### Configuration
- `[MODIFY]` `vite.config.ts`: Add `VitePWA` plugin configuration.
- `[MODIFY]` `package.json`: Add `vite-plugin-pwa` dependency.

### Assets
- `[NEW]` `public/pwa-192x192.png`
- `[NEW]` `public/pwa-512x512.png`
- `[NEW]` `public/apple-touch-icon.png`
- `[NEW]` `public/maskable-icon.png`

### Core
- `[MODIFY]` `index.html`: Add iOS meta tags (plugin handles manifest link).
- `[MODIFY]` `src/main.tsx`: Import `registerSW` (virtual module) if we need custom handling, otherwise the plugin handles injection. *Correction:* The plugin's `injectRegister: 'auto'` usually handles this, but explicit import allows for logging/debugging in a demo environment.

### Documentation
- `[MODIFY]` `README.md`: Add "Installable PWA" to features list.

## Next Steps
1.  **Approval:** Confirm this plan is acceptable.
2.  **Asset Creation:** You (User) or I (Agent) need to generate png assets from the current logo.
3.  **Implementation:** Execute the config changes.
