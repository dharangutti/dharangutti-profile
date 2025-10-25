import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const outputPath = new URL('./data/events.json', import.meta.url);
const events = [];

(async () => {
  await Promise.all([
    fetchLunarEclipses(),
    fetchConjunctions()
  ]);

  const deduped = deduplicate(events);
  fs.writeFileSync(outputPath, JSON.stringify(deduped, null, 2), 'utf-8');
  console.log(`✅ Generated ${deduped.length} events to data/events.json`);
})();

// 🌕 Lunar Eclipses from NASA
async function fetchLunarEclipses() {
  const url = 'https://eclipse.gsfc.nasa.gov/LEdecade/LEdecade2021.html';
  const res = await fetch(url);
  const html = await res.text();
  const dom = new JSDOM(html);
  const rows = dom.window.document.querySelectorAll('table tr');

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 5) return;

    const dateText = cells[0].textContent.trim();
    const type = cells[2].textContent.trim();
    const region = cells[5]?.textContent.trim() || 'See source';

    if (!dateText.includes('2025')) return;
    const date = new Date(`${dateText} 00:00 UTC`);
    if (isNaN(date)) return;

    const id = `2025-lunar-${type.toLowerCase().replace(/\s+/g, '-')}-${dateText.replace(/\s+/g, '').toLowerCase()}`;

    events.push({
      id,
      title: `${type} Lunar Eclipse`,
      start: date.toISOString(),
      end: new Date(date.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      location: region,
      explanation: `${type} lunar eclipse occurs when the Moon passes through Earth's shadow.`,
      link: url
    });
  });
}

// 🪐 Conjunctions from AstroPixels
async function fetchConjunctions() {
  const url = 'https://www.astropixels.com/almanac/almanac21/almanac2025ist.html';
  const res = await fetch(url);
  const html = await res.text();
  const lines = html.split('\n');

  lines.forEach(line => {
    if (!line.includes('Conjunction')) return;
    const match = line.match(/([A-Za-z]{3})\s+(\d{1,2})\s+.*?([A-Za-z]+)\s+Conjunction/);
    if (!match) return;

    const [_, monthStr, dayStr, body] = match;
    const monthMap = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    const month = monthMap[monthStr];
    const day = parseInt(dayStr);
    const date = new Date(Date.UTC(2025, month, day, 0, 0));

    const id = `2025-conjunction-${body.toLowerCase()}-${monthStr.toLowerCase()}${dayStr}`;

    events.push({
      id,
      title: `${body} Conjunction`,
      start: date.toISOString(),
      end: new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      location: "Visible globally",
      explanation: `A conjunction occurs when ${body} appears close to another celestial body in the sky.`,
      link: url
    });
  });
}

// 🧹 Deduplicate by ID
function deduplicate(arr) {
  const seen = new Set();
  return arr.filter(ev => {
    if (seen.has(ev.id)) return false;
    seen.add(ev.id);
    return true;
  });
}
