export const horizons = [2031, 2041, 2046, 2051];

function publishedForecasts(records) {
  const today = new Date().toISOString().slice(0, 10);
  const seen = new Set();
  return records.flatMap(record => {
    if (record.publishedOn > today) return [];
    const versions = record.versions.filter(version => version.date <= today);
    const current = versions.at(-1);
    if (!current || !horizons.includes(current.horizon) || seen.has(record.id)) {
      throw new Error(`Invalid forecast configuration for ${record.id}`);
    }
    seen.add(record.id);
    return [{ ...record, versions, current }];
  });
}

async function fetchForecasts() {
  const response = await fetch('/data/forecasts.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Forecast request failed: ${response.status}`);
  return publishedForecasts(await response.json());
}

export const forecastData = fetchForecasts();
