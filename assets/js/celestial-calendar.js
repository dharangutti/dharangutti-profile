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
    const events = await fetchRSSFeed("https://skyandtelescope.org/feed/");
    const filtered = events
      .filter(e => e.date >= today && e.date <= oneYearFromNow)
      .sort((a, b) => a.date - b.date)
      .slice(0, 20);

    renderEvents(filtered);
  } catch (err) {
    console.warn("RSS fetch failed, using demo data:", err);
    renderEvents(demoEvents());
  }

  wireModal();
}

async function fetchRSSFeed(url) {
  const res = await fetch(url);
  const xml = await res.text();
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const items = [...doc.querySelectorAll("item")];

  return items.map(item => ({
    title: item.querySelector("title")?.textContent || "Untitled",
    date: new Date(item.querySelector("pubDate")?.textContent),
    location: "See source",
    explanation: item.querySelector("description")?.textContent || "",
    link: item.querySelector("link")?.textContent || ""
  }));
}

function demoEvents() {
  const now = new Date();
  return [
    {
      title: "Perseid Meteor Shower",
      date: new Date(now.getFullYear(), 7, 12, 22),
      location: "Worldwide",
      explanation: "Occurs as Earth passes through debris from comet Swift–Tuttle.",
      link: "https://www.timeanddate.com/astronomy/meteor-shower/list.html"
    },
    {
      title: "Total Lunar Eclipse",
      date: new Date(now.getFullYear(), 9, 29, 2),
      location: "Africa, Europe, Asia",
      explanation: "Earth blocks sunlight from reaching the Moon.",
      link: "https://eclipse.gsfc.nasa.gov/LEdecade/LEdecade2021.html"
    }
  ];
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
    meta.textContent = ev.date.toLocaleString();

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

function openExplanation(ev) {
  modalTitle.textContent = ev.title;
  modalBody.textContent = ev.explanation || 'No explanation available.';
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
