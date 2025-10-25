import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const outputPath = new URL('./data/events.json', import.meta.url);
const events = [];

(async () => {
  await Promise.all([
    fetchLunarEclipses(),
    fetchConjunctions(),
    fetchSpaceMissions()
  ]);

  const deduped = deduplicate(events);
  const filtered = deduped.filter(e => isWithinNextYear(new Date(e.start)));

  fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2), 'utf-8');
  console.log(`✅ Generated ${filtered.length} upcoming events to data/events.json`);
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
    const region = cells[5]?.textContent.trim();

    if (!dateText.includes('2025') && !dateText.includes('2026')) return;
    const date = new Date(`${dateText} 00:00 UTC`);
    if (isNaN(date)) return;

    const id = `lunar-${type.toLowerCase().replace(/\s+/g, '-')}-${dateText.replace(/\s+/g, '').toLowerCase()}`;
    const location = region && !region.match(/\d{2}h\d{2}m/) ? region : 'See source';

    events.push({
      id,
      title: `${type} Lunar Eclipse`,
      start: date.toISOString(),
      end: new Date(date.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      location,
      explanation: `During a ${type.toLowerCase()} lunar eclipse, the Moon passes through Earth's shadow.`,
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

    const id = `conjunction-${body.toLowerCase()}-${monthStr.toLowerCase()}${dayStr}`;
    const title = `${body} Conjunction`;

    events.push({
      id,
      title,
      start: date.toISOString(),
      end: new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      location: "Visible globally",
      explanation: `A conjunction occurs when ${body} appears close to another celestial body in the sky.`,
      link: url
    });
  });
}

// 🚀 Space Missions from curated feed
async function fetchSpaceMissions() {
  const missions = [
    {
      id: 'mission-escapade-dec2025',
      title: 'NASA ESCAPADE Mars Mission',
      start: '2025-12-01T00:00:00Z',
      end: '2025-12-01T06:00:00Z',
      location: 'Mars orbit',
      explanation: 'ESCAPADE will study Mars’ magnetic field and plasma environment using twin spacecraft.',
      link: 'https://indianexpress.com/article/trending/top-10-listing/top-10-upcoming-space-missions-10096397/'
    },
    {
      id: 'mission-nisar-2025',
      title: 'NASA-ISRO NISAR Earth Observation Launch',
      start: '2025-11-15T00:00:00Z',
      end: '2025-11-15T03:00:00Z',
      location: 'Low Earth Orbit',
      explanation: 'NISAR will monitor Earth’s surface changes using dual-frequency radar.',
      link: 'https://indianexpress.com/article/trending/top-10-listing/top-10-upcoming-space-missions-10096397/'
    },
    {
      id: 'mission-gaganyaan-test-2025',
      title: 'ISRO Gaganyaan Uncrewed Test Flight',
      start: '2025-10-30T00:00:00Z',
      end: '2025-10-30T02:00:00Z',
      location: 'Low Earth Orbit',
      explanation: 'ISRO will test life support and safety systems for India’s first human spaceflight.',
      link: 'https://indianexpress.com/article/trending/top-10-listing/top-10-upcoming-space-missions-10096397/'
    }
  ];

  events.push(...missions);
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

// 📅 Filter events within next year
function isWithinNextYear(startDate) {
  const now = new Date();
  const oneYearLater = new Date();
  oneYearLater.setFullYear(now.getFullYear() + 1);
  return startDate >= now && startDate <= oneYearLater;
}
