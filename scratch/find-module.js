const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '.next', 'server', 'edge', 'chunks', '_0nugaei._.js');
if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Let's find "n.webcrypto||globalThis.crypto" and print the surrounding block (e.g. 1000 characters before and after)
  const pattern = "n.webcrypto||globalThis.crypto";
  const index = content.indexOf(pattern);
  if (index !== -1) {
    console.log("Pattern found at index:", index);
    const start = Math.max(0, index - 2000);
    const end = Math.min(content.length, index + 2000);
    console.log("--- Surrounding bundle code ---");
    console.log(content.substring(start, end));
  } else {
    // Try a simpler match
    console.log("Pattern not found with literal string. Trying regex...");
    const regex = /webcrypto\s*\|\|\s*globalThis\.crypto/i;
    const match = content.match(regex);
    if (match) {
      console.log("Match found at index:", match.index);
      console.log(content.substring(match.index - 500, match.index + 500));
    } else {
      console.log("No match found in the whole file!");
    }
  }
} else {
  console.error("File not found");
}
