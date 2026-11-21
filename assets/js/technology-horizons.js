import { horizons, forecastData } from './forecast-data.js';
const status = document.querySelector('#forecast-status');
const controls = document.querySelector('#forecast-controls');
const category = document.querySelector('#forecast-category');
const search = document.querySelector('#forecast-search');
const pollOptions = ['Likely', 'Unsure', 'Unlikely'];

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function poll(id, revision) {
  const fieldset = element('fieldset', undefined, 'forecast-poll');
  const buttons = element('div');
  const feedback = element('p');
  const key = `technology-horizons:vote:${id}:v${revision}`;
  let vote;
  try {
    vote = localStorage.getItem(key);
  } catch {
    // Polls remain usable for the current page when browser storage is unavailable.
  }

  feedback.setAttribute('role', 'status');
  for (const option of pollOptions) {
    const button = element('button', option);
    button.type = 'button';
    button.addEventListener('click', () => {
      vote = vote === option ? null : option;
      updateSelection();
      try {
        if (vote) localStorage.setItem(key, vote);
        else localStorage.removeItem(key);
        feedback.textContent = vote ? `Saved on this browser: ${vote}.` : 'Response cleared.';
      } catch {
        feedback.textContent = 'Browser storage is unavailable. Your response lasts until this page is reloaded.';
      }
    });
    buttons.append(button);
  }

  function updateSelection() {
    for (const button of buttons.children) {
      button.setAttribute('aria-pressed', String(button.textContent === vote));
    }
  }

  updateSelection();
  feedback.textContent = pollOptions.includes(vote)
    ? `Saved on this browser: ${vote}.`
    : 'Your response is stored on this browser.';
  fieldset.append(element('legend', 'How likely is this forecast?'), buttons, feedback);
  return fieldset;
}

function versionLabel(version, index) {
  return `Version ${index + 1} · ${version.date}${version.placeholder ? ' · Placeholder' : ''}`;
}

function forecastCard({ id, publishedOn, versions, current }) {
  const card = element('article', undefined, 'forecast-card');
  card.id = `forecast-${id}`;
  card.append(
    element('h3', current.title),
    element('p', `${current.category} · First published ${publishedOn}${current.placeholder ? ' · Placeholder' : ''}`),
    element('p', current.text)
  );

  const history = element('details');
  history.append(element('summary', `Version history (${versions.length})`));
  versions.forEach((version, index) => {
    history.append(
      element('h4', versionLabel(version, index)),
      element('p', `${version.title} · ${version.horizon} · ${version.category}`),
      element('p', version.text)
    );
  });
  card.append(history, poll(id, versions.length));
  return card;
}

function showForecasts(forecasts) {
  const categories = [...new Set(forecasts.map(({ current }) => current.category))].sort();
  for (const name of categories) {
    const option = element('option', name);
    option.value = name;
    category.append(option);
  }

  const sections = new Map(horizons.map(year => {
    const section = document.querySelector(`#forecasts-${year}`);
    return [year, { heading: section.querySelector('h2'), list: section.querySelector('div'), entries: [] }];
  }));

  for (const forecast of forecasts) {
    sections.get(forecast.current.horizon).entries.push({
      category: forecast.current.category,
      searchText: `${forecast.current.title} ${forecast.current.text} ${forecast.current.category}`.toLowerCase(),
      card: forecastCard(forecast)
    });
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    let visibleCount = 0;

    for (const [year, { heading, list, entries }] of sections) {
      const matching = entries.filter(entry =>
        (!category.value || entry.category === category.value) && entry.searchText.includes(query)
      );
      visibleCount += matching.length;
      heading.textContent = `${year} (${entries.length})`;

      if (matching.length) {
        const cards = document.createDocumentFragment();
        for (const entry of matching) cards.append(entry.card);
        list.replaceChildren(cards);
      } else {
        const message = entries.length
          ? 'No forecasts match these filters. Try adjusting the category or search.'
          : `No forecasts have been published for ${year} yet. New entries will appear here as they are published.`;
        list.replaceChildren(element('p', message, 'forecast-empty'));
      }
    }

    status.textContent = `Showing ${visibleCount} of ${forecasts.length} published forecasts`;
  }

  controls.hidden = false;
  category.addEventListener('change', render);
  search.addEventListener('input', render);
  render();
}

try {
  showForecasts(await forecastData);
} catch (error) {
  status.textContent = 'Forecasts could not be loaded. Please refresh the page to try again.';
  console.error(error);
}
