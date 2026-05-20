const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '.next', 'server', 'edge', 'chunks', '_0nugaei._.js');
if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const targetLine = lines[475]; // 0-indexed for line 476
  if (targetLine) {
    console.log("Length of line 476:", targetLine.length);
    const start = Math.max(0, 107063 - 150);
    const end = Math.min(targetLine.length, 107063 + 150);
    console.log("Surrounding code:");
    console.log(targetLine.substring(start, end));
  } else {
    console.error("Line 476 not found");
  }
} else {
  console.error("File not found");
}
