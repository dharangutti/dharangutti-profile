import { forecastData, horizons } from './forecast-data.js';

function renderStats(container, forecasts) {
  const counts = new Map(horizons.map(year => [year, 0]));
  const categories = new Set();
  let revised = 0;
  let latest;

  for (const forecast of forecasts) {
    const { current, publishedOn, versions } = forecast;
    counts.set(current.horizon, counts.get(current.horizon) + 1);
    categories.add(current.category);
    if (versions.length > 1) revised += 1;
    if (!latest || publishedOn >= latest.publishedOn) latest = forecast;
  }

  const list = document.createElement('dl');
  const stats = [
    ['Published forecasts', forecasts.length],
    ['Technology categories', categories.size],
    ['Forecasts by horizon', [...counts].map(([year, count]) => `${year} (${count})`).join(' · ')],
    ['Forecasts with revisions', revised],
    ['Latest publication', latest?.publishedOn ?? 'No forecasts published yet']
  ];

  for (const [label, value] of stats) {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    row.append(term, description);
    list.append(row);
  }

  container.replaceChildren(list);
}

const container = document.querySelector('[data-forecast-stats]');
try {
  renderStats(container, await forecastData);
} catch {
  container.textContent = 'Forecast statistics are currently unavailable.';
}
