import fs from 'fs';

const p1 = fs.readFileSync('path1_extracted.txt', 'utf8');
const p2 = fs.readFileSync('path2_extracted.txt', 'utf8');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find the exact truncated string in the file (M20.852...Z")
    const startIndex = content.indexOf('d="M20.852 48.731');
    if (startIndex === -1) {
        console.log(`Could not find path2 in ${filePath}`);
        return;
    }

    const endIndex = content.indexOf('"', startIndex + 3);
    const oldPath = content.substring(startIndex + 3, endIndex);

    console.log(`Replacing path in ${filePath} (old length: ${oldPath.length}, new length: ${p2.length})`);
    content = content.replace(oldPath, p2);
    fs.writeFileSync(filePath, content);
}

replaceInFile('src/components/CriticalIcons.tsx');
replaceInFile('index.html');
