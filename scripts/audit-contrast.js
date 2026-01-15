/**
 * Fast Runtime Contrast Audit (v21 - THE FINAL WORD)
 * 
 * Uses Puppeteer + Axe-Core + Advanced Color Resolution.
 */

import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync } from 'fs';

const APP_URL = 'http://localhost:5173';
const AXE_CORE_PATH = './node_modules/axe-core/axe.min.js';
const REPORT_PATH = './docs/audit-results.md';

async function runAudit() {
    console.log('🚀 Starting Definitive Multi-Screen Contrast Audit...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 450, height: 900 });

    const axeSource = readFileSync(AXE_CORE_PATH, 'utf8');
    const scanResults = [];

    try {
        await page.goto(APP_URL, { waitUntil: 'networkidle2' });
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('app-theme', 'light');
        });
        await page.reload({ waitUntil: 'networkidle2' });

        // --- AUTH ---
        console.log('🔑 Login...');
        await page.waitForSelector('svg[aria-label="Developer Shortcut Login"]');
        await page.click('svg[aria-label="Developer Shortcut Login"]');

        // --- FACILITY ---
        console.log('🏢 Selecting Facility...');
        await page.waitForSelector('text/Juvenile Detention Center', { timeout: 15000 });
        await page.click('text/Juvenile Detention Center');

        // --- UNIT ---
        console.log('🏘️ Selecting Unit...');
        await page.waitForSelector('text/A-Wing', { timeout: 10000 });
        await page.click('text/A-Wing');

        // --- DASHBOARD (LIGHT) ---
        console.log('⏳ Loading Dashboard (Light)...');
        await page.waitForSelector('[data-check-id]', { timeout: 15000 });
        await new Promise(r => setTimeout(r, 1000));
        scanResults.push(await runAxe(page, axeSource, 'Dashboard (Light)'));

        // --- SETTINGS ---
        console.log('⚙️ Opening Settings...');
        await page.click('aria/Open navigation menu');
        await page.waitForSelector('aria/Settings', { timeout: 5000 });
        await page.click('aria/Settings');
        await page.waitForSelector('text/User Settings', { timeout: 5000 });
        scanResults.push(await runAxe(page, axeSource, 'User Settings'));

        // CLOSE MODALS & SIDE MENU
        await page.click('aria/Back');
        await new Promise(r => setTimeout(r, 1000));

        // --- DARK MODE ---
        console.log('🌙 Switching to Dark Mode...');
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'dark-c');
        });
        // Ensure UI is ready
        await page.waitForSelector('[data-check-id]', { timeout: 10000 });
        await new Promise(r => setTimeout(r, 2000));
        scanResults.push(await runAxe(page, axeSource, 'Dashboard (Dark)'));

        generateFinalReport(scanResults);

    } catch (err) {
        console.error('❌ Audit Error:', err.message);
        generateFinalReport(scanResults);
    } finally {
        await browser.close();
        console.log(`📄 Definitive Report saved to ${REPORT_PATH}`);
    }
}

async function runAxe(page, axeSource, screenName) {
    console.log(`🔍 Scanning ${screenName}...`);
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

                // Detection logic for avatars
                const isAvatar = selector.includes('avatar') || targetEl.className.includes('avatar');

                bg = resolveBackground(targetEl);

                // FINAL OVERRIDE: If it's an avatar and we resolved some generic surface color, 
                // try once more to grab precisely the inline style.
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
