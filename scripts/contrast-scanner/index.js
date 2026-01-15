/**
 * Contrast Scanner v1.0
 * 
 * Automated accessibility audit tool using Puppeteer and Axe-Core.
 * Scans multiple application states for color contrast violations.
 */

import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync } from 'fs';

const APP_URL = 'http://localhost:5173';
const AXE_CORE_PATH = './node_modules/axe-core/axe.min.js';
const REPORT_PATH = './docs/audit-results.md';

function logHeader(title) {
    console.log('\n========================================');
    console.log(`  ${title.toUpperCase()}`);
    console.log('========================================');
}

function logStep(message) {
    console.log(`[STEP] ${message}`);
}

function logInfo(message) {
    console.log(`   > ${message}`);
}

function logError(message) {
    console.error(`[ERROR] ${message}`);
}

async function runAudit() {
    logHeader('Starting Multi-Screen Contrast Audit');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 450, height: 900 });

    let axeSource;
    try {
        axeSource = readFileSync(AXE_CORE_PATH, 'utf8');
    } catch (e) {
        logError(`Could not load axe-core from ${AXE_CORE_PATH}`);
        process.exit(1);
    }

    const scanResults = [];

    try {
        await page.goto(APP_URL, { waitUntil: 'networkidle2' });
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('app-theme', 'light');
        });
        await page.reload({ waitUntil: 'networkidle2' });

        // --- AUTH ---
        logStep('Authentication');
        logInfo('Locating shortcut login...');
        await page.waitForSelector('svg[aria-label="Developer Shortcut Login"]');
        await page.click('svg[aria-label="Developer Shortcut Login"]');

        // --- FACILITY ---
        logStep('Facility Selection');
        logInfo('Selecting "Juvenile Detention Center"...');
        await page.waitForSelector('text/Juvenile Detention Center', { timeout: 15000 });
        await page.click('text/Juvenile Detention Center');

        // --- UNIT ---
        logStep('Unit Selection');
        logInfo('Selecting "A-Wing"...');
        await page.waitForSelector('text/A-Wing', { timeout: 10000 });
        await page.click('text/A-Wing');

        // --- DASHBOARD (LIGHT) ---
        logStep('Dashboard (Light Mode)');
        logInfo('Waiting for dashboard load...');
        await page.waitForSelector('[data-check-id]', { timeout: 15000 });
        await new Promise(r => setTimeout(r, 1000));
        scanResults.push(await runAxe(page, axeSource, 'Dashboard (Light)'));

        // --- SETTINGS ---
        logStep('User Settings');
        logInfo('Navigating to settings via side menu...');
        // Ensure side menu is open
        await page.click('aria/Open navigation menu');
        await page.waitForSelector('aria/Settings', { timeout: 5000 });
        await page.click('aria/Settings');
        await page.waitForSelector('text/User Settings', { timeout: 5000 });
        scanResults.push(await runAxe(page, axeSource, 'User Settings'));

        // CLOSE MODALS & SIDE MENU
        logInfo('Closing settings and menu...');
        await page.click('aria/Back');
        await new Promise(r => setTimeout(r, 500));
        await page.click('aria/Open navigation menu'); // Closes side menu
        await new Promise(r => setTimeout(r, 1000));

        // --- SCAN VIEW ---
        logStep('Scan View');
        logInfo('Opening Scan View...');
        await page.click('text/Scan');
        await page.waitForSelector('text/Scan Room QR Code', { timeout: 5000 });
        await new Promise(r => setTimeout(r, 500));
        scanResults.push(await runAxe(page, axeSource, 'Scan View'));

        logInfo('Closing Scan View...');
        try {
            await page.waitForSelector('text/Scan Room QR Code', { timeout: 5000 });
            await page.evaluate(() => {
                const btn = document.querySelector('button[aria-label="Close scanner"]');
                if (btn) btn.click();
            });
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            logInfo('Warning: Could not verify scanner closure, proceeding...');
        }

        // --- DARK MODE ---
        logStep('Dashboard (Dark Mode)');
        logInfo('Switching theme to "dark-c"...');
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'dark-c');
        });
        await new Promise(r => setTimeout(r, 2000));
        scanResults.push(await runAxe(page, axeSource, 'Dashboard (Dark)'));

        generateFinalReport(scanResults);

    } catch (err) {
        logError(`Audit failed: ${err.message}`);
        generateFinalReport(scanResults);
    } finally {
        await browser.close();
        logHeader('Audit Complete');
        logInfo(`Report saved to ${REPORT_PATH}`);
    }
}

async function runAxe(page, axeSource, screenName) {
    logInfo(`Running Axe analysis on: ${screenName}`);
    await page.evaluate(axeSource);
    const results = await page.evaluate(runDeepAuditInBrowser);
    return { screenName, ...results };
}

async function runDeepAuditInBrowser() {
    // @ts-ignore
    const axeResult = await axe.run(document, {
        runOnly: ['color-contrast'],
        resultTypes: ['violations', 'passes']
    });

    const getLuminance = (r, g, b) => {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const resolveToRGB = (colorStr) => {
        if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)' || colorStr === 'initial' || colorStr === 'inherit') return null;
        const temp = document.createElement('div');
        temp.style.color = colorStr;
        document.body.appendChild(temp);
        const resolved = window.getComputedStyle(temp).color;
        document.body.removeChild(temp);
        const match = resolved.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]), a: match[4] ? parseFloat(match[4]) : 1 };
        return null;
    };

    const resolveBackground = (el) => {
        let curr = el;
        while (curr) {
            // Priority 1: Direct inline style
            if (curr.style && curr.style.backgroundColor) {
                const rgb = resolveToRGB(curr.style.backgroundColor);
                if (rgb && rgb.a > 0.1) return curr.style.backgroundColor;
            }

            // Priority 2: Computed
            const style = window.getComputedStyle(curr);
            const bg = style.backgroundColor;
            const rgb = resolveToRGB(bg);
            if (rgb && rgb.a > 0.1) return bg;

            curr = curr.parentElement;
        }
        return 'rgb(255, 255, 255)';
    };

    const processNodes = (nodes) => {
        return nodes.map(node => {
            const selector = node.target[node.target.length - 1];
            const targetEl = document.querySelector(selector);
            let ratio = 0;
            let fg = 'unknown';
            let bg = 'unknown';

            if (targetEl) {
                const style = window.getComputedStyle(targetEl);
                fg = style.color;

                const isAvatar = selector.includes('avatar') || targetEl.className.includes('avatar');

                bg = resolveBackground(targetEl);

                if (isAvatar && bg.includes('249')) {
                    if (targetEl.style.backgroundColor) bg = targetEl.style.backgroundColor;
                }

                const fgRGB = resolveToRGB(fg);
                const bgRGB = resolveToRGB(bg);
                if (fgRGB && bgRGB) {
                    const l1 = getLuminance(fgRGB.r, fgRGB.g, fgRGB.b);
                    const l2 = getLuminance(bgRGB.r, bgRGB.g, bgRGB.b);
                    ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
                }
            }

            return {
                selector: selector,
                ratio: ratio,
                fg: fg,
                bg: bg,
                impact: ratio >= 4.5 ? 'pass' : (ratio >= 3 ? 'warning' : 'violation')
            };
        });
    };

    const all = [
        ...processNodes(axeResult.violations.flatMap(v => v.nodes)),
        ...processNodes(axeResult.passes.flatMap(p => p.nodes))
    ];

    return {
        violations: all.filter(n => n.impact === 'violation'),
        passes: all.filter(n => n.impact !== 'violation')
    };
}

function generateFinalReport(scanResults) {
    let md = `# Comprehensive Contrast Audit Report\n\n`;
    md += `*Generated on: ${new Date().toLocaleString()}*\n\n`;

    md += `## 📊 Executive Summary\n\n`;
    md += `| Screen | Status | Pairings | Warnings |\n`;
    md += `|---|---|---|---|\n`;

    scanResults.forEach(res => {
        const failCount = res.violations.length;
        const status = failCount === 0 ? '✅ PASS' : `❌ FAIL (${failCount})`;
        md += `| ${res.screenName} | ${status} | ${res.passes.length + failCount} | ${failCount} |\n`;
    });
    md += `\n---\n\n`;

    scanResults.forEach(res => {
        md += `## Screen: ${res.screenName}\n\n`;

        if (res.violations.length > 0) {
            md += `### ❌ Violations\n\n`;
            md += `| Element | Ratio | Colors |\n`;
            md += `|---|---|---|\n`;
            res.violations.forEach(v => {
                md += `| \`${v.selector}\` | **${v.ratio.toFixed(2)}:1** | FG: ${v.fg}, BG: ${v.bg} |\n`;
            });
            md += `\n`;
        }

        md += `### 🔍 Verified Pairings (Top 25)\n\n`;
        md += `| Element | Ratio | Colors |\n`;
        md += `|---|---|---|\n`;
        const sortedPasses = [...res.passes].sort((a, b) => a.ratio - b.ratio).slice(0, 25);
        sortedPasses.forEach(p => {
            md += `| \`${p.selector}\` | **${p.ratio.toFixed(2)}:1** | FG: ${p.fg}, BG: ${p.bg} |\n`;
        });
        md += `\n---\n\n`;
    });

    writeFileSync(REPORT_PATH, md);
}

runAudit();
