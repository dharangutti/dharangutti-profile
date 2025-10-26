// scripts/generate-index.js
const fs = require('fs');
const path = require('path');

const notebookDir = path.join(__dirname, './notebook');
const files = fs.readdirSync(notebookDir)
  .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .sort((a, b) => b.localeCompare(a)); // newest first

if (files.length === 0) {
  console.log('⚠️ No notebook entries found.');
  process.exit(0);
}

const index = {
  latest: files[0],
  archive: files.slice(1)
};

fs.writeFileSync(path.join(notebookDir, 'notebook-index.json'), JSON.stringify(index, null, 2));
console.log(`✅ Notebook index generated. Latest: ${files[0]}`);
