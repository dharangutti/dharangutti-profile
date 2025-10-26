// generate-index.js (ESM version)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
