# Contrast Scanner

**Contrast Scanner** is an automated accessibility auditing tool designed to verify color contrast compliance across the Safety Check application.

## 🚀 Overview

This tool programmatically navigates through the application, captures color data from key interface elements, and evaluates them against WCAG 2.1 AA standards (4.5:1 minimum contrast ratio).

It goes beyond standard static analysis by:
1.  **Running in a real browser environment** using Puppeteer.
2.  **Resolving complex color stacks**, including semi-transparent overlays and computed styles.
3.  **Simulating user journeys** to reach deep states like "Workflows" and "Settings".

## 🛠 Tech Stack

-   **Node.js**: Runtime environment.
-   **Puppeteer**: Headless Chrome automation for navigation and interaction.
-   **Axe-Core**: Industry-standard accessibility engine for identifying violations.
-   **Custom Resolvers**: Specialized logic to calculate `rgba` values from computed styles where Axe might return "incomplete".

## 📖 How It Works

1.  **Initialization**: Launches a headless 450x900 (mobile layout) browser instance.
2.  **Authentication**: Automatically logs in via the "Developer Shortcut".
3.  **Navigation**: Scripts clicking through Facility -> Unit -> Dashboard.
4.  **Sampling**:
    -   Injects `axe-core` into the page.
    -   Runs a deep audit which recursively checks background/foreground pairings.
    -   Apply specific logic for edge cases (e.g., Avatars, specific status badges).
5.  **Reporting**: Generates a Markdown report at `docs/audit-results.md` summarizing passes, warnings, and violations.

## 📦 Usage

Run the scanner from the project root:

```bash
node scripts/contrast-scanner/index.js
```

*Note: The development server (`npm run dev`) must be running on `http://localhost:5173`.*

## 🔮 Scalability & Future Support

The scanner is architected to scale:
-   **CI/CD Integration**: Can be added to a GitHub Action workflow to block PRs on accessibility regressions.
-   **Regression Testing**: Thresholds can be set to fail the build if the number of warnings exceeds a limit.
-   **New Routes**: Additional user flows (e.g., "Add Check", "Incident Report") can be added as new `logStep` blocks in the `runAudit` function.
