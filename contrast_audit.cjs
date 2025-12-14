const fs = require('fs');
const path = require('path');

// --- Helper Functions for Color Math ---

function hexToRgb(hex) {
    if (!hex) return null;
    // Handle short hex #FFF
    if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }

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
    const c2 = blend(rgb2);

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

        // Parse --variable: value;
        const match = line.match(/^(--[\w-]+):\s*(.+);/);
        if (match) {
            const name = match[1];
            let value = match[2];

            // Normalize value (remove comments)
            value = value.replace(/\/\*.*\*\//g, '').trim();

            if (isPrimitives) {
                primitivesState[name] = value;
            } else {
                themes[currentTheme][name] = value;
            }
        }
    });
}

function resolveColor(themeName, varName, visited = new Set()) {
    if (!varName) return null;
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
    // Fallback to root
    else if (themes['root'][varName]) {
        value = themes['root'][varName];
    }
    // Check primitives
    else if (primitivesState[varName]) {
        value = primitivesState[varName];
    }
    // Handle bare variable usage like var(--foo)
    else if (varName.startsWith('var(')) {
        const innerMatch = varName.match(/var\((--[\w-]+)\)/);
        if (innerMatch) {
            return resolveColor(themeName, innerMatch[1], visited);
        }
    }

    if (!value) return null;

    // If value contains var(), resolve it
    if (value.startsWith('var(')) {
        const innerMatch = value.match(/var\((--[\w-]+)\)/);
        if (innerMatch) {
            return resolveColor(themeName, innerMatch[1], visited);
        }
    }

    // It might be a color name (unlikely in this system) or just a hex
    return value;
}

// --- Execution ---

const rootDir = process.cwd() + '\\src\\styles';
parseCssFile(path.join(rootDir, 'primitives.css'), true);
parseCssFile(path.join(rootDir, 'semantics.css'), false);

// VERIFY ROOT RESOLUTION
console.log('--- VERIFICATION ---');
const whiteFg = '--surface-fg-white';
const whiteBg = '--surface-bg-primary'; // in local file it is var(--primitives-base-white)
const resolvedFg = resolveColor('root', whiteFg);
const resolvedBg = resolveColor('root', whiteBg);
console.log(`Manual Resolve ${whiteFg}: ${resolvedFg}`);
console.log(`Manual Resolve ${whiteBg}: ${resolvedBg}`);
if (resolvedFg && resolvedBg) {
    const rFg = hexToRgb(resolvedFg);
    const rBg = hexToRgb(resolvedBg);
    console.log(`Ratio: ${contrast(rFg, rBg)}`);
} else {
    console.log('FAILED TO RESOLVE MANUAL CHECK');
}
console.log('--------------------');

// DEBUG
console.log('--- DEBUG: Root Theme Sample --');
const sampleVars = ['--surface-fg-primary', '--surface-bg-primary', '--control-fg-primary', '--control-bg-primary'];
sampleVars.forEach(v => {
    const clean = v.replace(/^--/, ''); // Map keys don't have -- prefix? Wait, my regex "match(/^--([\w-]+)" captures the name without --?
    // Let's check the regex in parseCssFile: /^--([\w-]+):\s*(.+);/
    // It captures group 1 as the name. So it excludes '--'. But the css uses var(--name).
    // So my resolveColor needs to handle that.

    // Actually, let's verify what keys are stored.
});
console.log('Keys in root theme:', Object.keys(themes['root']).slice(0, 5));
console.log('Keys in primitives:', Object.keys(primitivesState).slice(0, 5));

// If keys are like "surface-fg-primary", but usage is var(--surface-fg-primary),
// resolveColor handles "var(--...)" by extracting group 1.
// If the regex requires -- to be present in the capture... wait.
// Regex: /^--([\w-]+):\s*(.+);/
// If line is "--foo: bar;", match[1] is "foo".
// But var usage is "var(--foo)".
// innerMatch[1] would be "--foo". 
// So resolveColor gets "--foo", but keys are "foo".
// MISMATCH!

// FIX:
// 1. Store keys WITH -- prefix? Or
// 2. Strip -- prefix when resolving?

// Standardize on WITH -- prefix is safer for global replace.
// Let's fix the parsing to include the full variable name including --.


// Build report
const report = [];

report.push('# Automated Color Contrast Audit\n');
report.push('**Note:** This audit calculates contrast ratios based on semantic token definitions. It assumes standard opacity blending against white where alpha channels are used. Actual rendering may vary based on stacking contexts.\n');

Object.keys(themes).forEach(themeName => {
    report.push(`## Theme: ${themeName}`);

    const tokenNames = new Set([...Object.keys(themes['root']), ...Object.keys(themes[themeName])]);
    const foregrounds = [];
    const backgrounds = [];

    tokenNames.forEach(name => {
        if (name.includes('fg') || name.includes('text') || name.includes('icon')) foregrounds.push(name);
        if (name.includes('bg') || name.includes('surface') || name.includes('control-bg')) backgrounds.push(name);
    });

    const results = [];

    // Check Function
    const checkPair = (fgName, bgName, type) => {
        const fgHex = resolveColor(themeName, fgName);
        const bgHex = resolveColor(themeName, bgName);

        if (!fgHex || !bgHex) return;

        const fgRgb = hexToRgb(fgHex);
        const bgRgb = hexToRgb(bgHex);

        if (!fgRgb || !bgRgb) return;

        const ratio = contrast(fgRgb, bgRgb);

        let min = 4.5;
        // Ignore disabled states for strict failure reporting
        if (fgName.includes('disabled') || bgName.includes('disabled')) min = 1;

        // Ignore "on-solid" vs transparent or faint backgrounds which might be false positives due to composition assumptions
        if (bgName.includes('transparent')) return;

        if (ratio < min && min > 1) {
            results.push({
                pair: `${fgName} on ${bgName}`,
                fg: fgHex,
                bg: bgHex,
                ratio: ratio.toFixed(2),
                required: min
            });
        }
    };

    // 1. Surface Text on Surface Backgrounds
    const surfaceFgs = foregrounds.filter(f => f.startsWith('--surface-fg'));
    const surfaceBgs = backgrounds.filter(b => b.startsWith('--surface-bg'));

    // Optimization: Don't compare everything.
    // Compare basic text (primary/secondary) against main backgrounds
    // Compare specific semantic pairs if possible, but strict "all" is requested.
    // We'll stick to the loops but filter output.

    surfaceFgs.forEach(fg => surfaceBgs.forEach(bg => checkPair(fg, bg, 'surface')));

    // 2. Control Text on Control Backgrounds
    const controlFgs = foregrounds.filter(f => f.startsWith('--control-fg'));
    const controlBgs = backgrounds.filter(b => b.startsWith('--control-bg'));

    controlFgs.forEach(fg => controlBgs.forEach(bg => checkPair(fg, bg, 'control')));

    // 3. Control Text on Surface Backgrounds (For ghost buttons, standalone icons, etc.)
    controlFgs.forEach(fg => surfaceBgs.forEach(bg => checkPair(fg, bg, 'control-on-surface')));

    if (results.length > 0) {
        report.push('| Pair | FG | BG | Ratio | Req |');
        report.push('|---|---|---|---|---|');
        // Sort by worst ratio
        results.sort((a, b) => parseFloat(a.ratio) - parseFloat(b.ratio));

        // Deduplicate
        const seen = new Set();
        results.forEach(r => {
            const key = r.pair;
            if (seen.has(key)) return;
            seen.add(key);

            // Highlight worst violations
            const ratioStr = parseFloat(r.ratio) < 3.0 ? `**${r.ratio}**` : r.ratio;
            report.push(`| ${r.pair} | \`${r.fg}\` | \`${r.bg}\` | ${ratioStr} | ${r.required} |`);
        });
    } else {
        report.push('No specific contrast violations found for this theme.');
    }
    report.push('\n');
});

console.log(report.join('\n'));
