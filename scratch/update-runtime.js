const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const appDir = path.join(__dirname, '..', 'app');

walkDir(appDir, (filePath) => {
  const ext = path.extname(filePath);
  if (ext === '.tsx' || ext === '.ts') {
    const base = path.basename(filePath);
    if (base === 'page.tsx' || base === 'route.ts') {
      let content = fs.readFileSync(filePath, 'utf8');
      
      const pattern1 = /export\s+const\s+runtime\s*=\s*['"]edge['"]\s*;?/g;
      if (pattern1.test(content)) {
        console.log(`Updating ${filePath}...`);
        const updated = content.replace(pattern1, "export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';");
        fs.writeFileSync(filePath, updated, 'utf8');
      }
    }
  }
});

console.log("Done updating runtimes!");
