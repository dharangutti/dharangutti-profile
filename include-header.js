// include-header.js - fetch header.html and inject at top of the body, then dispatch a custom event.
(function () {
  var path = '/header.html'; // header is in the root; change only if you moved it
  fetch(path, { cache: 'no-store' })
    .then(function (r) {
      if (!r.ok) throw new Error('header fetch failed: ' + r.status);
      return r.text();
    })
    .then(function (html) {
      var holder = document.createElement('div');
      holder.innerHTML = html;
      var header = holder.querySelector('header') || holder.firstElementChild;
      if (header) {
        // Insert at top of <body>
        document.body.insertBefore(header, document.body.firstChild);
        // Notify listeners that the header has been included
        var event = new CustomEvent('header-included', { detail: { path: path } });
        window.dispatchEvent(event);
      }
    })
    .catch(function (err) {
      // Fail silently but log for debugging
      console.warn('Header include failed:', err);
    });
})();
