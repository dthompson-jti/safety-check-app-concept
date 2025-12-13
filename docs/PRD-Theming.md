Here are the two detailed PRDs. I have vetted the previous architectural concepts and refined them to align strictly with the **High-Craft CSS Principles** and **One-Shot Excellence** protocols defined in your project files.

---

# PRD 1: White-Label "Chameleon" Configuration

### 1. Overview
This initiative decouples the application's visual identity from its codebase. By introducing a `BrandLogo` component and extending the global configuration state, we allow the application to dynamically adopt a client's branding (Name, Logo, Theme Color) at runtime. This transforms the app from a generic tool into a tailored enterprise solution.

### 2. Problem & Goals
**The Problem:** Currently, the app name ("Safety Check App") and logo are hardcoded. Deploying for a new client requires code changes and a new build, which is inefficient for a multi-tenant or white-label strategy.
**The Goal:**
*   Enable runtime injection of branding assets via the `DeveloperModal` (simulating an API config).
*   Ensure logos of varying aspect ratios (square, wide, tall) always look "high-craft" and aligned without layout shifts (CLS).
*   Persist branding across sessions.

### 3. Scope & Key Initiatives
**In Scope:**
*   **State:** Extend `appConfigAtom` to include `branding` schema.
*   **Component:** Create `BrandLogo.tsx` with intelligent aspect ratio handling.
*   **UI:** Update `AppSideMenu` and `LoginView` to consume the new component.
*   **Settings:** Add "Branding Simulation" controls to `DeveloperModal`.

**Out of Scope:**
*   Dynamic Favicon generation (requires server-side or complex DOM manipulation outside React's typical scope).
*   Full CSS theme color generation (we will stick to replacing the logo and text name for this iteration).

### 4. UX/UI Specification & Wireframes

**Interaction Design:**
*   **Transition:** When a logo is changed in settings, it should cross-fade smoothly, not snap.
*   **Fallback:** If no logo is provided, the app defaults to the existing Shield Icon.

**Component: `BrandLogo` (Visual Contract)**
The logo component acts as a "Frame" that ensures visual consistency regardless of the image provided.

```text
[ Login View Context ]
+--------------------------------------------------+
|  [ Frame: max-w: 280px, h: 120px ]               |
|  [ Flex: Center, Align: Center ]                 |
|                                                  |
|       +-----------------------------+            |
|       |  Client Logo (contain)      |            |
|       |                             |            |
|       +-----------------------------+            |
|                                                  |
+--------------------------------------------------+
|  Title: var(--font-size-xl) "Client Name"        |
+--------------------------------------------------+

[ Side Menu Context ]
+--------------------------------------------------+
| [ Frame: w: 40px, h: 40px ]  [ Text Container ]  |
| +-------+                    |                   |
| | Logo  |                    |  Client Name      |
| | (img) |                    |  var(--fg-sec)    |
| +-------+                    |                   |
+--------------------------------------------------+
```

### 5. Architecture & Implementation Plan

**A. Data Schema (`src/data/atoms.ts`)**
We will modify the `AppConfig` interface to include a `branding` object.
```typescript
interface BrandingConfig {
  appName: string;
  logoUrl: string | null; // Base64 or URL
  /**
   * 'contain': Standard. Shows full logo within box.
   * 'cover': For abstract patterns/icons.
   */
  logoFit: 'contain' | 'cover';
}
// Default state: appName: "eProbation", logoUrl: null (uses Shield Icon)
```

**B. The `BrandLogo` Component Strategy**
We will not use a simple `<img>` tag. We will use a `div` with a background image or a strictly styled `img` inside a container to enforce the "Bounding Box Strategy" defined in the analysis.
*   **Props:** `variant: 'hero' | 'sidebar'`, `src`, `alt`.
*   **CSS Contract:**
    *   **Hero:** `height: 120px`, `width: 100%`, `object-fit: contain`.
    *   **Sidebar:** `height: 40px`, `width: 40px`, `object-fit: contain`.

**C. Developer Tools Integration**
We will add a File Input (accepting images) that converts the file to a Base64 string before saving it to the atom. This allows local testing of persistent branding without a backend.

### 6. File Manifest

**Directory: `src/data`**
*   `atoms.ts` `[MODIFIED]`: Update `AppConfig` interface and default state.
*   `brandingMock.ts` `[NEW]`: Export some Base64 strings of sample logos (Wide, Square, Tall) for the "Presets" buttons.

**Directory: `src/components`**
*   `BrandLogo.tsx` `[NEW]`: The generic logo container.
*   `BrandLogo.module.css` `[NEW]`: Styles for the bounding box strategy.

**Directory: `src/features/Shell`**
*   `AppSideMenu.tsx` `[MODIFIED]`: Replace hardcoded "eProbation" and icon with `BrandLogo` and dynamic text.
*   `AppSideMenu.module.css` `[MODIFIED]`: Adjust header spacing to accommodate variable logo widths.

**Directory: `src/features/Session`**
*   `LoginView.tsx` `[MODIFIED]`: Replace hero icon with `BrandLogo`.

**Directory: `src/features/Overlays`**
*   `DeveloperModal.tsx` `[MODIFIED]`: Add "Branding" section with Name input, Image Upload, and Preset buttons.

### 7. Unintended Consequences Check
*   **Side Menu Contrast:** If a user uploads a black logo (transparent PNG) and the side menu background is dark (or changes to dark mode), the logo will disappear.
    *   *Fix:* The `BrandLogo` sidebar variant will include a conditional `filter: drop-shadow(0 1px 2px rgba(255,255,255,0.5))` or a subtle background container if needed.
*   **LocalStorage Limits:** Base64 images can be large. `localStorage` has a 5MB limit.
    *   *Fix:* We will implement a soft cap or resize logic in the `DeveloperModal` before saving, or simply warn the dev this is for testing only.

### 8. Risks & Mitigations
*   **Risk:** Image flicker on load.
    *   **Mitigation:** Use a skeleton loader or keep the default icon visible until the `img.onLoad` event fires.
*   **Risk:** Extremely wide logos breaking the Side Menu layout.
    *   **Mitigation:** CSS `max-width: 100%` and `overflow: hidden` on the container.

### 9. Definition of Done
1.  User can open Developer Tools, change the App Name, and see it update instantly in the Side Menu.
2.  User can upload a custom logo (or select a preset), and it persists after page reload.
3.  The Login View displays the custom logo centered and contained within 120px height.
4.  The Side Menu displays the custom logo constrained to 40px height/width.
5.  If "Reset Data" is clicked, branding reverts to "eProbation" and the Shield Icon.

---

