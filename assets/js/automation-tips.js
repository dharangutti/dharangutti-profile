fetch('data/tips.json')
  .then(res => res.json())
  .then(tips => {
    const container = document.getElementById('tips-root');

    const sorted = tips
      .map(t => ({ ...t, date: new Date(t.date) }))
      .sort((a, b) => b.date - a.date); // newest first

    if (sorted.length === 0) {
      container.innerHTML = '<p>No tips available yet. Check back next Monday!</p>';
      return;
    }

    sorted.forEach(tip => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Tip: ${tip.title}`);
      card.addEventListener('click', () => showModal(tip));
      card.innerHTML = `
  <h3 class="event-title">${tip.title}</h3>
  <p class="event-meta"><strong>Category:</strong> ${tip.category}</p>
  <small class="event-meta">${tip.date.toDateString()}</small>
  <div class="event-actions">
    <button class="btn small explain-btn">View Explanation</button>
    ${tip.link ? `<a href="${tip.link}" target="_blank" class="btn small secondary">Learn more</a>` : ''}
  </div>
`;

      card.querySelector('.explain-btn').addEventListener('click', () => showModal(tip));
      container.appendChild(card);
    });
  });

// 🧠 Modal logic
function showModal(tip) {
  document.getElementById('modal-title').textContent = tip.title;
  document.getElementById('modal-body').textContent = tip.explanation;
  document.getElementById('explain-modal').setAttribute('aria-hidden', 'false');
}

document.getElementById('modal-close').onclick =
document.getElementById('modal-cancel').onclick = () => {
  document.getElementById('explain-modal').setAttribute('aria-hidden', 'true');
};

document.getElementById('modal-copy').onclick = () => {
  const text = document.getElementById('modal-body').textContent;
  navigator.clipboard.writeText(text);
};
