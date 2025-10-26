// generate-tips.js (ESM version)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tipsPath = path.join(__dirname, './data/tips.json');
const tips = JSON.parse(fs.readFileSync(tipsPath, 'utf8'));

// Curated weekly tips
const curated = [
  {
    title: "Use Data-Driven Tests for Coverage",
    category: "Scalability",
    explanation: "Parameterize your tests with multiple inputs to validate edge cases without duplicating logic.",
    link: "https://docs.pytest.org/en/latest/example/parametrize.html"
  },
  {
    title: "Log Failures with Context",
    category: "Debugging",
    explanation: "Include test name, input data, and expected vs actual results in failure logs to speed up triage.",
    link: "https://www.selenium.dev/documentation/en/"
  },
  {
    title: "Test Critical Paths First",
    category: "Prioritization",
    explanation: "Focus automation on user-critical flows like login, checkout, or data sync before edge cases.",
    link: "https://www.browserstack.com/guide/test-case-prioritization"
  }
];

// Get next Monday
const today = new Date();
const nextMonday = new Date(today);
nextMonday.setDate(today.getDate() + ((8 - today.getDay()) % 7));
const isoDate = nextMonday.toISOString().split('T')[0];

// Check for duplicate
if (tips.some(t => t.date === isoDate)) {
  console.log(`⚠️ Tip for ${isoDate} already exists. Skipping.`);
  process.exit(0);
}

// Add new tip
const nextTip = curated[tips.length % curated.length];
const newTip = {
  id: `tip-${isoDate}`,
  date: isoDate,
  ...nextTip
};

tips.push(newTip);
fs.writeFileSync(tipsPath, JSON.stringify(tips, null, 2));
console.log(`✅ Added tip for ${isoDate}: ${newTip.title}`);
