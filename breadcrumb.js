/* breadcrumb.js - lightweight breadcrumb generator
   Behavior tailored for flat .html pages and simple nested folders.
   - Render target: #breadcrumb (change via window.BREADCRUMB_OPTIONS.selector)
   - Root is absolute: https://dharangutti.in (change via window.BREADCRUMB_OPTIONS.rootUrl)
   - Pre-filled nameMap for your pages; override with window.BREADCRUMB_OPTIONS.nameMap
   Usage:
     <script>
       window.BREADCRUMB_OPTIONS = { rootName: 'Home', rootUrl: 'https://dharangutti.in', selector: '#breadcrumb' };
     </script>
     <script src="/path/to/breadcrumb.js"></script>
*/
(function () {
  var opts = (window.BREADCRUMB_OPTIONS && typeof window.BREADCRUMB_OPTIONS === 'object') ? window.BREADCRUMB_OPTIONS : {};
  var rootName = opts.rootName || 'Home';
  var rootUrl = (opts.rootUrl || 'https://dharangutti.in').replace(/\/$/, '');
  var selector = opts.selector || '#breadcrumb';
  var nameMap = Object.assign({
    'index': 'Home',
    'engineering-notebook': 'Engineering Notebook',
    'white-papers': 'White Papers',
    'automation-tips': 'Automation Tips',
    'celestial-calendar': 'Celestial Calendar',
    'contact': 'Contact',
    'cv': 'CV'
  }, opts.nameMap || {});

  function capitalize(s) {
    return String(s).replace(/\b\w/g, function (ch) { return ch.toUpperCase(); });
  }

  function cleanSegment(seg) {
    // Remove .html/.htm extension for display keys, also strip trailing slashes
    return seg.replace(/\.(html|htm)$/i, '').replace(/\/$/, '');
  }

  function buildCrumbs() {
    var container = document.querySelector(selector);
    if (!container) return;

    var rawPath = window.location.pathname || '/';
    // Normalize multiple slashes and remove trailing index if it is present as /index.html in path
    rawPath = rawPath.replace(/\/+/g, '/');

    // Remove leading/trailing slash, split to segments
    var rawSegments = rawPath.replace(/^\/|\/$/g, '').split('/').filter(Boolean);

    // If root (no segments), just render root
    var crumbs = [];
    crumbs.push({ name: rootName, url: rootUrl + '/' });

    if (rawSegments.length) {
      // We'll accumulate original segments to preserve .html filenames in URLs when present.
      var accumSegments = [];
      for (var i = 0; i < rawSegments.length; i++) {
        var orig = rawSegments[i]; // e.g., 'automation-tips.html' or 'projects'
        var clean = cleanSegment(orig); // 'automation-tips' or 'projects'
        // skip index segments when they appear
        if (clean.toLowerCase() === 'index') {
          // treat as landing page for previous segment and do not add a breadcrumb for 'index'
          continue;
        }

        accumSegments.push(orig);
        // Build URL: join accumSegments with '/' and prefix rootUrl
        var urlPath = '/' + accumSegments.join('/');
        var url = rootUrl + urlPath;

        // Display name: prefer nameMap for clean key, else decode + replace dashes/underscores and capitalize
        var display = nameMap[clean] || decodeURIComponent(clean).replace(/[-_]/g, ' ');
        display = capitalize(display);

        crumbs.push({ name: display, url: url });
      }
    }

    render(crumbs, container);
    injectJsonLd(crumbs);
  }

  function render(crumbs, container) {
    var nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Breadcrumb');
    nav.className = 'breadcrumb';

    var ol = document.createElement('ol');
    ol.className = 'breadcrumb-list';

    crumbs.forEach(function (c, idx) {
      var li = document.createElement('li');
      li.className = 'breadcrumb-item';
      if (idx < crumbs.length - 1) {
        var a = document.createElement('a');
        a.href = c.url;
        a.textContent = c.name;
        li.appendChild(a);
      } else {
        var span = document.createElement('span');
        span.textContent = c.name;
        span.setAttribute('aria-current', 'page');
        li.appendChild(span);
      }
      ol.appendChild(li);
    });

    container.innerHTML = '';
    container.appendChild(nav);
    nav.appendChild(ol);
  }

  function injectJsonLd(crumbs) {
    try {
      var itemList = crumbs.map(function (c, i) {
        return {
          "@type": "ListItem",
          "position": i + 1,
          "name": c.name,
          "item": c.url
        };
      });
      var ld = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": itemList
      };
      var script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(ld);
      document.head.appendChild(script);
    } catch (e) {
      console.warn('Breadcrumb JSON-LD failed', e);
    }
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(buildCrumbs);
})();
