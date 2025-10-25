const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const outputPath = path.join(__dirname, 'data/events.json');
const events = [];

(async () => {
  await Promise.all([
    fetchMeteorShowers(),
    fetchLunarEclipses(),
    fetchConjunctions()
  ]);

  fs.writeFileSync(outputPath, JSON.stringify(events, null, 2), 'utf-8');
  console.log(`✅ Generated ${events.length} events to data/events.json`);
})();

// 🌠 Meteor Showers from TimeandDate
async function fetchMeteorShowers() {
  const url = 'https://www.timeanddate.com/astronomy/meteor-shower/list.html';
  const res = await fetch(url);
  const html = await res.text();
  const dom = new JSDOM(html);
  const rows = dom.window.document.querySelectorAll('table tbody tr');

  rows.forEach(row => {
    const cols = row.querySelectorAll('td');
    if (cols.length < 6) return;

    const name = cols[1].textContent.trim();
    const range = cols[2].textContent.trim();
    const visibility = cols[5].textContent.trim();
    const [startStr, endStr] = range.split('–').map(s => s.trim());
    if (!startStr || !endStr) return;

    const year = 2025;
    const start = new Date(`${startStr} ${year} 22:00 UTC`);
    const end = new Date(`${endStr} ${year} 06:00 UTC`);
    if (isNaN(start) || isNaN(end)) return;

    events.push({
      id: `${year}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      title: `${name} Meteor Shower Peak`,
      start: start.toISOString(),
      end: end.toISOString(),
      location: visibility,
      explanation: `The ${name} meteor shower occurs annually as Earth passes through debris from its parent comet.`,
      link: url
    });
  });
}

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
    const region = cells[5]?.textContent.trim() || 'Global';

    if (!dateText.includes('2025')) return;
    const date = new Date(`${dateText} 00:00 UTC`);
    if (isNaN(date)) return;

    events.push({
      id: `2025-lunar-${type.toLowerCase()}`,
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

    events.push({
      id: `2025-conjunction-${body.toLowerCase()}-${monthStr.toLowerCase()}${dayStr}`,
      title: `${body} Conjunction`,
      start: date.toISOString(),
      end: new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      location: "Visible globally",
      explanation: `A conjunction occurs when ${body} appears close to another celestial body in the sky.`,
      link: url
    });
  });
}
