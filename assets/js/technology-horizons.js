import { horizons, forecastData } from './forecast-data.js';
import { createForecastPoll } from './forecast-polls.js';

const status = document.querySelector('#forecast-status');
const controls = document.querySelector('#forecast-controls');
const category = document.querySelector('#forecast-category');
const search = document.querySelector('#forecast-search');
const reset = document.querySelector('#forecast-reset');
const batchSize = 6;
const dateFormat = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeZone: 'UTC'
});

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function time(date) {
  const node = element('time', dateFormat.format(new Date(date)));
  node.dateTime = date;
  return node;
}

function forecastCount(count) {
  return `${count} ${count === 1 ? 'forecast' : 'forecasts'}`;
}

function versionHistory(versions) {
  const history = element('details', undefined, 'forecast-history');
  const items = element('ol');
  items.reversed = true;
  for (let index = versions.length - 1; index >= 0; index -= 1) {
    const version = versions[index];
    const item = element('li');
    const title = element('strong', version.title);
    const metadata = element('p');
    metadata.append(time(version.date), ` · ${version.horizon} · ${version.category}`);
    if (version.placeholder) metadata.append(' · Placeholder');
    item.append(title, metadata, element('p', version.text));
    items.append(item);
  }
  history.append(element('summary', `Version history (${versions.length})`), items);
  return history;
}

function forecastCard({ id, publishedOn, versions, current }) {
  const card = element('article', undefined, 'forecast-card');
  card.id = `forecast-${id}`;

  const tags = element('p', undefined, 'forecast-card-topline');
  tags.append(element('span', current.category, 'forecast-card-category'));
  if (current.placeholder) tags.append(element('span', 'Placeholder', 'forecast-card-placeholder'));

  const title = element('h4', current.title);
  title.tabIndex = -1;
  const metadata = element('p', 'First published ', 'forecast-card-meta');
  metadata.append(time(publishedOn));
  if (versions.length > 1) metadata.append(' · Updated ', time(current.date));

  card.append(
    tags,
    title,
    metadata,
    element('p', current.text, 'forecast-card-copy'),
    createForecastPoll(id, versions.length),
    versionHistory(versions)
  );
  return card;
}

function emptyHorizon(year, hasForecasts) {
  const empty = element('p', undefined, 'forecast-empty');
  if (hasForecasts) {
    empty.append(
      element('strong', 'No matching forecasts'),
      'Try another search term or clear the filters.'
    );
  } else {
    empty.append(
      element('strong', `No forecasts published for ${year} yet`),
      'New forecasts for this horizon will appear here when published.'
    );
  }
  return empty;
}

function showForecasts(forecasts) {
  const categories = [...new Set(forecasts.map(({ current }) => current.category))].sort(
    (first, second) => first.localeCompare(second)
  );
  for (const name of categories) {
    const option = element('option', name);
    option.value = name;
    category.append(option);
  }

  const sections = new Map(horizons.map(year => {
    const section = document.querySelector(`#forecasts-${year}`);
    return [year, {
      count: section.querySelector('.forecast-horizon-count'),
      list: section.querySelector('.forecast-cards'),
      more: section.querySelector('.forecast-more'),
      entries: [],
      limit: batchSize
    }];
  }));

  const sorted = [...forecasts].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
  for (const forecast of sorted) {
    const { current } = forecast;
    sections.get(current.horizon).entries.push({
      forecast,
      searchText: `${current.title} ${current.text} ${current.category}`.toLowerCase()
    });
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    const filtered = Boolean(query || category.value);
    let visibleCount = 0;
    let matchCount = 0;
    reset.hidden = !filtered;

    for (const [year, section] of sections) {
      const { count, list, more, entries, limit } = section;
      const matching = entries.filter(({ forecast, searchText }) =>
        (!category.value || forecast.current.category === category.value) && searchText.includes(query)
      );
      const shown = matching.slice(0, limit);
      visibleCount += shown.length;
      matchCount += matching.length;
      count.textContent = filtered ? `${matching.length} of ${forecastCount(entries.length)}` : forecastCount(entries.length);

      if (shown.length) {
        const cards = document.createDocumentFragment();
        for (const entry of shown) {
          entry.card ??= forecastCard(entry.forecast);
          cards.append(entry.card);
        }
        list.replaceChildren(cards);
      } else {
        list.replaceChildren(emptyHorizon(year, entries.length > 0));
      }

      const remaining = matching.length - shown.length;
      more.hidden = remaining === 0;
      if (remaining) {
        more.textContent = `Show ${Math.min(batchSize, remaining)} more for ${year} (${remaining} remaining)`;
      }
    }

    if (visibleCount < matchCount) {
      status.textContent = `Showing ${visibleCount} of ${forecastCount(matchCount)}${filtered ? ' matching your filters' : ''}`;
    } else if (filtered) {
      status.textContent = `${forecastCount(matchCount)} match${matchCount === 1 ? 'es' : ''} your filters`;
    } else {
      status.textContent = `${forecastCount(matchCount)} published`;
    }
  }

  function applyFilters() {
    for (const section of sections.values()) section.limit = batchSize;
    render();
  }

  for (const [year, section] of sections) {
    document.querySelector(`[data-horizon-count="${year}"]`).textContent = forecastCount(section.entries.length);
    section.more.addEventListener('click', () => {
      const firstNew = section.limit;
      section.limit += batchSize;
      render();
      section.list.children[firstNew]?.querySelector('h4').focus();
    });
  }

  controls.hidden = false;
  category.addEventListener('change', applyFilters);
  search.addEventListener('input', applyFilters);
  reset.addEventListener('click', () => {
    search.value = '';
    category.value = '';
    search.focus();
    applyFilters();
  });
  render();
}

try {
  showForecasts(await forecastData);
} catch (error) {
  status.textContent = 'Forecasts could not be loaded. Refresh the page to try again.';
  console.error(error);
}
