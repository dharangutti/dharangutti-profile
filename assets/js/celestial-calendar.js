const root = document.getElementById('calendar-root');
const modal = document.getElementById('explain-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const modalCopy = document.getElementById('modal-copy');

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const today = startOfDay(new Date());
  const oneYearFromNow = new Date(today);
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  try {
    const [meteors, eclipses, conjunctions] = await Promise.allSettled([
      fetchMeteorShowers(),
      fetchLunarEclipses(),
      fetchConjunctions()
    ]);

    const all = [meteors, eclipses, conjunctions]
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .map(normalizeEvent)
      .filter(e => e.start >= today && e.start <= oneYearFromNow)
      .sort((a, b) => a.start - b.start)
      .slice(0, 20);

    renderEvents(all);
  } catch (err) {
    console.warn('Failed to load celestial events:', err);
    root.innerHTML = '<p>Could not load events.</p>';
  }

  wireModal();
}

function normalizeEvent(raw) {
  return {
    id: raw.id || `${raw.title}-${new Date(raw.start).toISOString()}`,
    title: raw.title || 'Untitled Event',
    start: new Date(raw.start),
    end: raw.end ? new Date(raw.end) : null,
    location: raw.location || '',
    explanation: raw.explanation || '',
    link: raw.link || ''
  };
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function renderEvents(events) {
  root.innerHTML = '';
  if (!events.length) {
    root.innerHTML = `<p>No upcoming events found.</p>`;
    return;
  }

  const list = document.createElement('div');
  list.className = 'calendar-root';

  for (const ev of events) {
    const card = document.createElement('article');
    card.className = 'event-card';
    card.setAttribute('tabindex', '0');

    const title = document.createElement('h3');
    title.className = 'event-title';
    title.textContent = ev.title;

    const meta = document.createElement('div');
    meta.className = 'event-meta';
    meta.textContent = formatEventDate(ev.start, ev.end);

    const loc = document.createElement('div');
    loc.className = 'event-meta';
    loc.textContent = ev.location;

    const actions = document.createElement('div');
    actions.className = 'event-actions';

    const explainBtn = document.createElement('button');
    explainBtn.className = 'btn small';
    explainBtn.textContent = 'Why does this happen?';
    explainBtn.disabled = !ev.explanation && !ev.link;
    explainBtn.addEventListener('click', () => openExplanation(ev));

    if (ev.link && /^https?:\/\/.+/.test(ev.link)) {
      const more = document.createElement('a');
      more.className = 'btn small secondary';
      more.href = ev.link;
      more.target = '_blank';
      more.rel = 'noopener noreferrer';
      more.textContent = 'More info';
      actions.appendChild(more);
    }

    actions.appendChild(explainBtn);
    card.appendChild(title);
    card.appendChild(meta);
    if (loc.textContent) card.appendChild(loc);
    card.appendChild(actions);
    list.appendChild(card);
  }

  root.appendChild(list);
}

function formatEventDate(start, end) {
  const optsDate = { year: 'numeric', month: 'short', day: 'numeric' };
  const optsTime = { hour: '2-digit', minute: '2-digit' };
  const startDate = start.toLocaleDateString(undefined, optsDate);
  const startTime = start.toLocaleTimeString(undefined, optsTime);
  if (!end) return `${startDate} • ${startTime}`;
  if (start.toDateString() === end.toDateString()) {
    const endTime = end.toLocaleTimeString(undefined, optsTime);
    return `${startDate} • ${startTime}–${endTime}`;
  }
  const endDate = end.toLocaleDateString(undefined, optsDate);
  const endTime = end.toLocaleTimeString(undefined, optsTime);
  return `${startDate} ${startTime} – ${endDate} ${endTime}`;
}

function openExplanation(ev) {
  modalTitle.textContent = ev.title;
  if (ev.explanation) {
    modalBody.textContent = ev.explanation;
  } else if (ev.link) {
    modalBody.innerHTML = `See more: <a href="${ev.link}" target="_blank" rel="noopener noreferrer">${ev.link}</a>`;
  } else {
    modalBody.textContent = 'No explanation available.';
  }
  modal.setAttribute('aria-hidden', 'false');
  modal.style.display = 'flex';
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  modal.style.display = 'none';
}

function wireModal() {
  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  modalCopy.addEventListener('click', () => {
    const text = modalBody.innerText || modalBody.textContent;
    navigator.clipboard?.writeText(text).then(() => {
      modalCopy.textContent = 'Copied ✓';
      setTimeout(() => (modalCopy.textContent = 'Copy Explanation'), 1500);
    }).catch(() => {
      modalCopy.textContent = 'Copy failed';
      setTimeout(() => (modalCopy.textContent = 'Copy Explanation'), 1500);
    });
  });
  modal.addEventListener('click', (ev) => {
    if (ev.target === modal) closeModal();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closeModal();
  });
}

// Feed Parsers Using DOMParser

async function fetchMeteorShowers() {
  const res = await fetch('https://www.timeanddate.com/astronomy/meteor-shower/list.html');
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const rows = doc.querySelectorAll('table tbody tr');
  const year = new Date().getFullYear();
  const events = [];

  rows.forEach(row => {
    const cols = row.querySelectorAll('td');
    if (cols.length < 6) return;

    const name = cols[1].textContent.trim();
    const dateRange = cols[2].textContent.trim();
    const visibility = cols[5].textContent.trim();
    const [startStr, endStr] = dateRange.split('–').map(s => s.trim());
    if (!startStr || !endStr) return;

    const start = new Date(`${startStr} ${year} 22:00 UTC`);
    const end = new Date(`${endStr} ${year} 06:00 UTC`);
    if (start < new Date()) return;

    events.push({
      title: `${name} Meteor Shower`,
      start,
      end,
      location: visibility,
      explanation: '',
      link: 'https://www.timeanddate.com/astronomy/meteor-shower/list.html'
    });
  });

  return events;
}

async function fetchLunarEclipses() {
  const res = await fetch('https://eclipse.gsfc.nasa.gov/LEdecade/LEdecade2021.html');
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const rows = doc.querySelectorAll('table tr');
  const events = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 5) return;

    const dateText = cells[0].textContent.trim();
    const type = cells[2].textContent.trim();
    const region = cells[5]?.textContent.trim() || 'Global';

    if (!dateText.includes('2025') || !type.toLowerCase().includes('total')) return;

    const date = new Date(`${dateText} 00:00 UTC`);
    if (date < new Date()) return;

    events.push({
      title: `${type} Lunar Eclipse`,
      start: date,
      end: new Date(date.getTime() + 3 * 60 * 60 * 1000),
      location: region,
      explanation: '',
      link: 'https://eclipse.gsfc.nasa.gov/LEdecade/LEdecade2021.html'
    });
  });

  return events;
}

async function fetchConjunctions() {
  const res = await fetch('https://www.astropixels.com/almanac/almanac21/almanac2025ist.html');
  const html = await res.text();
 
