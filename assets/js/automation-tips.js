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
      card.className = 'card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Tip: ${tip.title}`);
      card.addEventListener('click', () => showModal(tip));
      card.innerHTML = `
        <h3>${tip.title}</h3>
        <p>${tip.explanation}</p>
        <small><strong>${tip.category}</strong> • ${tip.date.toDateString()}</small>
        ${tip.link ? `<p><a href="${tip.link}" target="_blank">Learn more</a></p>` : ''}
      `;
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
