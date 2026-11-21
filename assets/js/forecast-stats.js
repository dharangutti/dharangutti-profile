import { forecastData, horizons } from './forecast-data.js';
import { getForecastVote } from './forecast-polls.js';

const formatDate = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' });

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function summarize(forecasts) {
  const horizonCounts = new Map(horizons.map(year => [year, 0]));
  const categoryCounts = new Map();
  let revised = 0;
  let latestPublication = '';
  let latestRevision = '';

  for (const { current, publishedOn, versions } of forecasts) {
    horizonCounts.set(current.horizon, horizonCounts.get(current.horizon) + 1);
    categoryCounts.set(current.category, (categoryCounts.get(current.category) ?? 0) + 1);
    if (publishedOn > latestPublication) latestPublication = publishedOn;
    if (versions.length > 1) {
      revised += 1;
      if (current.date > latestRevision) latestRevision = current.date;
    }
  }

  return { horizonCounts, categoryCounts, revised, latestPublication, latestRevision };
}

function buildMetrics(metrics) {
  const list = element('dl', 'forecast-metrics');
  for (const [label, value] of metrics) {
    const item = element('div', 'forecast-metric');
    item.append(element('dt', null, label), element('dd', null, value));
    list.append(item);
  }
  return list;
}

function buildBars(entries, total) {
  const list = element('ul', 'forecast-stats-bars');
  list.setAttribute('role', 'list');
  for (const [label, count] of entries) {
    const row = element('li');
    const track = element('span', 'forecast-stats-track');
    const fill = element('span', 'forecast-stats-fill');
    track.setAttribute('aria-hidden', 'true');
    fill.style.width = `${total ? 100 * count / total : 0}%`;
    track.append(fill);
    row.append(element('span', 'forecast-stats-bar-label', label), element('strong', null, count), track);
    list.append(row);
  }
  return list;
}

function buildDistribution(title, entries, total, previewSize = entries.length) {
  const panel = element('div', 'forecast-stats-panel');
  panel.append(element('h3', null, title));
  if (!entries.length) {
    panel.append(element('p', 'forecast-stats-note', 'Categories appear as forecasts are published.'));
    return panel;
  }

  panel.append(buildBars(entries.slice(0, previewSize), total));
  if (entries.length > previewSize) {
    const remainder = entries.length - previewSize;
    const details = element('details', 'forecast-stats-more');
    details.append(
      element('summary', null, `${remainder} more ${remainder === 1 ? 'category' : 'categories'}`),
      buildBars(entries.slice(previewSize), total)
    );
    panel.append(details);
  }
  return panel;
}

function buildDates(dates) {
  const list = element('dl', 'forecast-stats-dates');
  for (const [label, date, empty] of dates) {
    const row = element('div');
    const value = element('dd');
    if (date) {
      const parsed = new Date(`${date}T00:00:00Z`);
      const time = element('time', null, Number.isNaN(parsed.valueOf()) ? date : formatDate.format(parsed));
      time.dateTime = date;
      value.append(time);
    } else {
      value.textContent = empty;
    }
    row.append(element('dt', null, label), value);
    list.append(row);
  }
  return list;
}

function buildParticipation(forecasts) {
  const revisions = new Map(forecasts.map(({ id, versions }) => [id, versions.length]));
  const answered = new Set();
  for (const [id, revision] of revisions) {
    if (getForecastVote(id, revision)) answered.add(id);
  }

  const panel = element('div', 'forecast-stats-panel forecast-stats-participation');
  const tally = element('span', 'forecast-stats-tally');
  const updateTally = () => { tally.textContent = `${answered.size} of ${revisions.size} polls`; };
  updateTally();
  panel.append(
    element('h3', null, 'Your votes'),
    tally,
    element('p', 'forecast-stats-note', 'Responses on this browser for current forecast versions.')
  );

  document.addEventListener('forecast-vote-change', ({ detail: { id, revision, vote } }) => {
    if (revisions.get(id) !== revision) return;
    if (vote) answered.add(id);
    else answered.delete(id);
    updateTally();
  });
  return panel;
}

function renderStats(container, forecasts) {
  const summary = container.dataset.forecastStats === 'summary';
  const total = forecasts.length;
  const { horizonCounts, categoryCounts, revised, latestPublication, latestRevision } = summarize(forecasts);
  const occupied = [...horizonCounts.values()].filter(Boolean).length;
  const metrics = buildMetrics([
    ['Published forecasts', total],
    ['Technology categories', categoryCounts.size],
    ['Horizons with forecasts', `${occupied} of ${horizons.length}`],
    ['Forecasts with revisions', revised]
  ]);
  const distribution = buildDistribution('Forecasts by horizon', [...horizonCounts], total);
  const dates = [['Latest publication', latestPublication, 'No forecasts yet']];

  if (!summary) {
    const categories = [...categoryCounts].sort(([labelA, countA], [labelB, countB]) =>
      countB - countA || labelA.localeCompare(labelB)
    );
    dates.push(['Latest revision', latestRevision, 'No revisions yet']);
    container.replaceChildren(
      metrics,
      distribution,
      buildDistribution('Forecasts by category', categories, total, 5),
      buildParticipation(forecasts),
      buildDates(dates)
    );
    return;
  }

  const overview = element('div', 'forecast-stats-overview');
  overview.append(metrics, buildDates(dates));
  container.replaceChildren(overview, distribution);
}

const container = document.querySelector('[data-forecast-stats]');
if (container) {
  try {
    renderStats(container, await forecastData);
  } catch {
    container.textContent = 'Forecast statistics are currently unavailable.';
  }
}
