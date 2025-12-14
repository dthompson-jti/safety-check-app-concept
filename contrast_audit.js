const fs = require('fs');
const path = require('path');

// --- Helper Functions for Color Math ---

function hexToRgb(hex) {
    // Handle short hex #FFF
    if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    // Handle alpha #RRGGBBAA - ignore alpha for contrast calculation usually, strictly speaking we assume opaque background
    // But if alpha is present, we might need to assume a white background for calculations or just strip it if it's 100%
    // For this audit, we'll try to handle simple solid colors standardly.
    // If it's 8 chars (RRGGBBAA), we will parse.

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{0,2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: result[4] ? parseInt(result[4], 16) / 255 : 1
    } : null;
}

function luminanace(r, g, b) {
    var a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(rgb1, rgb2) {
    // If alpha < 1, blend with white background for estimation (common auditing practice)
    const blend = (fg, bg) => {
        if (fg.a >= 1) return fg;
        // simplistic blending over white
        const r = Math.round(fg.r * fg.a + 255 * (1 - fg.a));
        const g = Math.round(fg.g * fg.a + 255 * (1 - fg.a));
        const b = Math.round(fg.b * fg.a + 255 * (1 - fg.a));
        return { r, g, b, a: 1 };
    }

    const c1 = blend(rgb1);
    const c2 = blend(rgb2); // Background is usually opaque, but just in case

    const lum1 = luminanace(c1.r, c1.g, c1.b);
    const lum2 = luminanace(c2.r, c2.g, c2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

// --- Parsing Logic ---

const primitivesState = {};
const themes = {
    'root': {}, // Light/Default
    'dark-a': {},
    'dark-b': {},
    'dark-c': {}
};

function parseCssFile(filePath, isPrimitives) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let currentTheme = 'root';

    lines.forEach(line => {
        line = line.trim();
        // Check for theme blocks
        if (line.includes('[data-theme=\'dark-a\']')) currentTheme = 'dark-a';
        else if (line.includes('[data-theme=\'dark-b\']')) currentTheme = 'dark-b';
        else if (line.includes('[data-theme=\'dark-c\']')) currentTheme = 'dark-c';
        else if (line.includes(':root')) currentTheme = 'root';

        // Very basic parsing for --variable: value;
        const match = line.match(/^--([\w-]+):\s*(.+);/);
        if (match) {
            const name = match[1];
            let value = match[2];

            // Normalize value (remove comments)
            value = value.replace(/\/\*.*\*\//g, '').trim();

            if (isPrimitives) {
                primitivesState[name] = value; // Store primitive value
            } else {
                themes[currentTheme][name] = value;
            }
        }
    });
}

function resolveColor(themeName, varName, visited = new Set()) {
    if (visited.has(varName)) return null; // Cycle detection
    visited.add(varName);

    // 1. Check if it's a direct hex/rgb value
    if (varName.startsWith('#') || varName.startsWith('rgb')) return varName;

    // 2. Resolve variable
    let value = null;

    // Check specific theme first
    if (themes[themeName] && themes[themeName][varName]) {
        value = themes[themeName][varName];
    }
    // Fallback to root if not in theme (but only if we are resolving a semantic var check)
    // Actually, inheritance: if checking dark-a, and it's not defined there, it might fallback to root? 
    // CSS variables inherit, but usually they are defined in the scope.
    // In this file structure, semantics.css defines root then overrides in themes.
    // So if not in theme, check root.
    else if (themes['root'][varName]) {
        value = themes['root'][varName];
    }
    // Check primitives
    else if (primitivesState[varName]) {
        value = primitivesState[varName];
    }
    // Handle bare variable usage like var(--foo)
    else if (varName.startsWith('var(')) {
        const inner = varName.match(/var\((--[\w-]+)\)/)[1];
        return resolveColor(themeName, inner, visited);
    }
    // Sometimes value is "var(--foo)" string from map

    if (!value) return null;

    // If value contains var(), resolve it
    if (value.startsWith('var(')) {
        const inner = value.match(/var\((--[\w-]+)\)/)[1];
        return resolveColor(themeName, inner, visited);
    }

    return value;
}

// --- Execution ---

const rootDir = 'c:\\Users\\dthompson\\Documents\\CODE\\safety-check-app-concept\\src\\styles';
parseCssFile(path.join(rootDir, 'primitives.css'), true);
parseCssFile(path.join(rootDir, 'semantics.css'), false);

// Build report
const report = [];

Object.keys(themes).forEach(themeName => {
    console.log(`Analyzing Theme: ${themeName}`);
    report.push(`## Theme: ${themeName}`);

    const tokenNames = new Set([...Object.keys(themes['root']), ...Object.keys(themes[themeName])]);
    const foregrounds = [];
    const backgrounds = [];

    tokenNames.forEach(name => {
        if (name.includes('fg') || name.includes('text') || name.includes('icon')) foregrounds.push(name);
        if (name.includes('bg') || name.includes('surface') || name.includes('control-bg')) backgrounds.push(name);
    });

    // Define smart pairings to avoid n^2 noise
    // We mainly care about "surface-fg" vs "surface-bg" and "control-fg" vs "control-bg"
    // Also cross pollination: text usually sits on surface-bg-primary or secondary.

    const results = [];

    // 1. Generic Surface Text on Surface Backgrounds
    const surfaceFgs = foregrounds.filter(f => f.startsWith('surface-fg'));
    const surfaceBgs = backgrounds.filter(b => b.startsWith('surface-bg'));

    surfaceFgs.forEach(fgName => {
        const fgHex = resolveColor(themeName, fgName);
        if (!fgHex) return;
        const fgRgb = hexToRgb(fgHex);
        if (!fgRgb) return;

        surfaceBgs.forEach(bgName => {
            const bgHex = resolveColor(themeName, bgName);
            if (!bgHex) return;
            const bgRgb = hexToRgb(bgHex);
            if (!bgRgb) return;

            // Heuristic to skip unlikely pairs? 
            // e.g. white text on white bg is bad but also likely not intended.
            // Let's just calc and filter by "Fail".

            const ratio = contrast(fgRgb, bgRgb);

            // Contextual labeling
            let level = 'AA';
            let min = 4.5;
            // Large text heuristic? We don't know usage. Assume body text (4.5) for everything to be safe,
            // unless it's explicitly "disabled" or "subtle" maybe?
            if (fgName.includes('disabled') || bgName.includes('disabled')) min = 1; // Ignore disabled

            let status = ratio >= min ? 'Pass' : 'FAIL';

            // Only report failures or close calls?
            // Reporting everything is too much.
            // Let's report FAILs.
            if (status === 'FAIL' && min > 1) {
                results.push({
                    pair: `${fgName} on ${bgName}`,
                    fg: fgHex,
                    bg: bgHex,
                    ratio: ratio.toFixed(2),
                    required: min
                });
            }
        });
    });

    // 2. Control Text on Control Backgrounds
    const controlFgs = foregrounds.filter(f => f.startsWith('control-fg'));
    const controlBgs = backgrounds.filter(b => b.startsWith('control-bg'));

    controlFgs.forEach(fgName => {
        const fgHex = resolveColor(themeName, fgName);
        if (!fgHex) return;
        const fgRgb = hexToRgb(fgHex);
        if (!fgRgb) return;

        controlBgs.forEach(bgName => {
            const bgHex = resolveColor(themeName, bgName);
            if (!bgHex) return;
            const bgRgb = hexToRgb(bgHex);
            if (!bgRgb) return;

            const ratio = contrast(fgRgb, bgRgb);
            let min = 4.5;
            if (fgName.includes('disabled') || bgName.includes('disabled')) min = 1;

            // Common sense filtering: 
            // - Don't check 'on-solid' text against 'transparent' background (unless we assume composite)
            // - Don't check 'primary' text against 'primary' bg (usually same color family)

            let status = ratio >= min ? 'Pass' : 'FAIL';
            if (status === 'FAIL' && min > 1) {
                results.push({
                    pair: `${fgName} on ${bgName}`,
                    fg: fgHex,
                    bg: bgHex,
                    ratio: ratio.toFixed(2),
                    required: min
                });
            }
        });
    });

    if (results.length > 0) {
        report.push('| Pair | FG | BG | Ratio | Req |');
        report.push('|---|---|---|---|---|');
        // Sort by worst ratio
        results.sort((a, b) => parseFloat(a.ratio) - parseFloat(b.ratio));
        results.forEach(r => {
            report.push(`| ${r.pair} | \`${r.fg}\` | \`${r.bg}\` | **${r.ratio}** | ${r.required} |`);
        });
    } else {
        report.push('No contrast violations found.');
    }
    report.push('\n');
});

console.log(report.join('\n'));
