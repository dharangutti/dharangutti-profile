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
  const oneYearFromNow = new Date(today);
  oneYearFromNow.setFullYear(today.getFullYear() + 1);

  try {
    const res = await fetch('/data/events.json');
    const events = await res.json();

    const filtered = events
      .map(normalizeEvent)
      .filter(e => e.start >= today && e.start <= oneYearFromNow)
      .sort((a, b) => a.start - b.start);

    renderEvents(filtered);
  } catch (err) {
    console.error('Failed to load events:', err);
    root.innerHTML = '<p>Could not load events.</p>';
  }

  wireModal();
}

function normalizeEvent(raw) {
  return {
    id: raw.id,
    title: raw.title,
    start: new Date(raw.start),
    end: raw.end ? new Date(raw.end) : null,
    location: raw.location || '',
    explanation: raw.explanation || '',
    link: raw.link || ''
  };
}

function renderEvents(events) {
  root.innerHTML = '';
  if (!events.length) {
    root.innerHTML = `<p>No upcoming events found.</p>`;
    return;
  }

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
    explainBtn.disabled = !ev.explanation && !ev.id;
    explainBtn.addEventListener('click', () => openExplanation(ev));

    if (ev.link) {
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
    card.appendChild(loc);
    card.appendChild(actions);
    root.appendChild(card);
  }
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
  modalBody.innerHTML = '<p>Loading explanation…</p>';

  const detailsPath = `/data/details/${ev.id}.html`;

  fetch(detailsPath)
    .then(res => {
      if (!res.ok) throw new Error("Details not found");
      return res.text();
    })
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const main = doc.querySelector("main");
      modalBody.innerHTML = main ? main.innerHTML : "<p>No explanation available.</p>";
    })
    .catch(() => {
      modalBody.textContent = ev.explanation || "No explanation available.";
    });

  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "flex";
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  modal.style.display = "none";
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
