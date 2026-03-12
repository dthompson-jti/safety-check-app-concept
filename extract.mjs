import fs from 'fs';

const content = fs.readFileSync('docs/knowledge-base/svg-update.svg', 'utf8');

// Use a regex to match both paths accurately
const regex = /<path[^>]*d="([^"]+)"/g;
let match;
let i = 1;

while ((match = regex.exec(content)) !== null) {
    const pathData = match[1];
    console.log(`Path ${i} length: ${pathData.length}`);
    fs.writeFileSync(`path${i}_extracted.txt`, pathData);
    i++;
}
