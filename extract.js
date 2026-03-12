const fs = require('fs');
const content = fs.readFileSync('docs/knowledge-base/svg-update.svg', 'utf8');
const parts = content.split('d="');
const path1 = parts[1].split('"')[0];
const path2 = parts[2].split('"')[0];

console.log('Path 1 length:', path1.length);
console.log('Path 2 length:', path2.length);

fs.writeFileSync('path1_extracted.txt', path1);
fs.writeFileSync('path2_extracted.txt', path2);
