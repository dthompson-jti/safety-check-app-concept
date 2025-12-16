import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '../src/config.ts');

try {
    const data = fs.readFileSync(configPath, 'utf8');

    // Look for: export const APP_VERSION = 'v4.20';
    const versionRegex = /(export const APP_VERSION = 'v)(\d+\.\d+)(\.?\d*)(';)/;

    const match = data.match(versionRegex);

    if (match) {
        const fullVersion = match[2] + match[3]; // e.g., "4.20" or "4.20.1"
        const parts = fullVersion.split('.').map(Number);

        // Increment the last part
        parts[parts.length - 1]++;

        const newVersion = parts.join('.');
        const replacement = `${match[1]}${newVersion}${match[4]}`;

        const newData = data.replace(versionRegex, replacement);

        fs.writeFileSync(configPath, newData, 'utf8');
        console.log(`Version updated from ${fullVersion} to ${newVersion}`);
    } else {
        console.error('Could not find APP_VERSION pattern in src/config.ts');
        process.exit(1);
    }
} catch (err) {
    console.error('Error updating version:', err);
    process.exit(1);
}
