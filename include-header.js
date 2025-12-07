// include-header.js - optional: fetch header.html and inject at top of the body.
// Use if you don't want to copy/paste header.html into every page.
// NOTE: scripts inside fetched HTML will not execute — you still need to include breadcrumb.js and styles in each page.
(function () {
  var path = '/path/to/header.html'; // <-- change this path to where you host header.html
  fetch(path).then(function (r) {
    if (!r.ok) throw new Error('header fetch failed');
    return r.text();
  }).then(function (html) {
    var holder = document.createElement('div');
    holder.innerHTML = html;
    var header = holder.querySelector('header') || holder.firstElementChild;
    if (header) document.body.insertBefore(header, document.body.firstChild);
  }).catch(function (err) {
    // fail silently; header can be pasted in pages instead
    console.warn('Header include failed:', err);
  });
})();
