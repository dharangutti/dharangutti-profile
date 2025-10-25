const root = document.getElementById('calendar-root');
const modal = document.getElementById('explain-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const modalCopy = document.getElementById('modal-copy');

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const today = new Date();
  let events = null;

  try {
    const resp = await fetch('/data/events.json', { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
    events = await resp.json();
  } catch (err) {
    console.warn('Could not fetch events feed, using demo data.', err);
    events = demoEvents();
  }

const oneYearFromNow = new Date(today);
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

const upcoming = events
  .map(normalizeEvent)
  .filter(e => e.start >= startOfDay(today) && e.start <= oneYearFromNow)
  .sort((a, b) => a.start - b.start)
  .slice(0, 20);


  renderEvents(upcoming);
  wireModal();
}

function normalizeEvent(raw) {
  return {
    id: raw.id || `${raw.title}-${raw.start}`,
    title: raw.title || 'Untitled Event',
    start: raw.start ? new Date(raw.start) : new Date(),
    end: raw.end ? new Date(raw.end) : null,
    location: raw.location || '',
    explanation: raw.explanation || '',
    link: raw.link || `/data/details/${(raw.id || raw.title || 'event')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()}.html`
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
  list.className = 'event-list';

  for (const ev of events) {
    const card = document.createElement('article');
    card.className = 'event-card';
    card.setAttribute('tabindex', '0');

    const when = document.createElement('div');
    when.className = 'event-when';
    when.textContent = formatEventDate(ev.start, ev.end);

    const title = document.createElement('h3');
    title.className = 'event-title';
    title.textContent = ev.title;

    const loc = document.createElement('p');
    loc.className = 'event-location';
    loc.textContent = ev.location;

    const controls = document.createElement('div');
    controls.className = 'event-controls';

    const explainBtn = document.createElement('button');
    explainBtn.className = 'btn small';
    explainBtn.textContent = 'Why does this happen?';
    explainBtn.disabled = !ev.explanation && !ev.link;
    explainBtn.addEventListener('click', () => openExplanation(ev));

    if (ev.link && (ev.link.startsWith('/') || /^https?:\/\/.+/.test(ev.link))) {
      const more = document.createElement('a');
      more.className = 'btn small secondary';
      more.href = ev.link;
      more.target = '_blank';
      more.rel = 'noopener noreferrer';
      more.textContent = 'More info';
      controls.appendChild(more);
    }

    controls.appendChild(explainBtn);
    card.appendChild(when);
    card.appendChild(title);
    if (loc.textContent) card.appendChild(loc);
    card.appendChild(controls);
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
  modal.style.display = 'block';
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  modal.style.display = 'none';
}

function wireModal() {
  if (!modal) return;
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

function demoEvents() {
  return [
    {
      id: 'demo-perseid',
      title: 'Perseid Meteor Shower Peak',
      start: new Date(new Date().getFullYear(), 7, 12, 22).toISOString(),
      end: new Date(new Date().getFullYear(), 7, 13, 6).toISOString(),
      location: 'Worldwide',
      explanation: 'The Perseids occur each year as Earth passes through the debris left by comet Swift–Tuttle.'
    },
    {
      id: 'demo-lunar-eclipse',
      title: 'Partial Lunar Eclipse',
      start: new Date(new Date().getFullYear(), 9, 29, 2).toISOString(),
      end: new Date(new Date().getFullYear(), 9, 29, 5).toISOString(),
      location: 'Visible over Africa, Europe, Asia',
      explanation: 'A partial lunar eclipse occurs when Earth partially blocks sunlight from reaching the Moon.'
    }
  ];
}
