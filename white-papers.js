(function () {
  var statElements = document.querySelectorAll('[data-zenodo-record]');
  if (!statElements.length) return;

  var numberFormat = new Intl.NumberFormat();

  statElements.forEach(function (element) {
    var recordId = element.getAttribute('data-zenodo-record');
    if (!/^\d+$/.test(recordId || '')) {
      element.textContent = 'Zenodo stats unavailable';
      return;
    }

    var controller = new AbortController();
    var timeout = window.setTimeout(function () {
      controller.abort();
    }, 8000);

    fetch('https://zenodo.org/api/records/' + recordId, {
      headers: { Accept: 'application/json' },
      mode: 'cors',
      signal: controller.signal
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Zenodo API request failed');
        return response.json();
      })
      .then(function (record) {
        var stats = record && record.stats ? record.stats : {};
        var parts = [];

        if (Number.isFinite(Number(stats.unique_downloads))) {
  parts.push(numberFormat.format(Number(stats.unique_downloads)) + ' downloads');
}
if (Number.isFinite(Number(stats.unique_views))) {
  parts.push(numberFormat.format(Number(stats.unique_views)) + ' views');
}

        element.textContent = parts.length
          ? 'Zenodo: ' + parts.join(' · ')
          : 'Zenodo stats unavailable';
      })
      .catch(function () {
        element.textContent = 'Zenodo stats unavailable';
      })
      .finally(function () {
        window.clearTimeout(timeout);
      });
  });
})();
