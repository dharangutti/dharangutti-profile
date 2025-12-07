/* breadcrumb.js - lightweight breadcrumb generator
   Added: will wait for header-included event if header is injected after DOM load.
*/
(function () {
  // --- existing options code unchanged ---
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
    return seg.replace(/\.(html|htm)$/i, '').replace(/\/$/, '');
  }

  // Expose build function so we can call it from an event if header is fetched later
  function buildCrumbs() {
    var container = document.querySelector(selector);
    if (!container) return;

    var rawPath = window.location.pathname || '/';
    rawPath = rawPath.replace(/\/+/g, '/');
    var rawSegments = rawPath.replace(/^\/|\/$/g, '').split('/').filter(Boolean);

    var crumbs = [];
    crumbs.push({ name: rootName, url: rootUrl + '/' });

    if (rawSegments.length) {
      var accumSegments = [];
      for (var i = 0; i < rawSegments.length; i++) {
        var orig = rawSegments[i];
        var clean = cleanSegment(orig);
        if (clean.toLowerCase() === 'index') continue;
        accumSegments.push(orig);
        var urlPath = '/' + accumSegments.join('/');
        var url = rootUrl + urlPath;
        var display = nameMap[clean] || decodeURIComponent(clean).replace(/[-_]/g, ' ');
        display = capitalize(display);
        crumbs.push({ name: display, url: url });
      }
    }

    render(crumbs, container);
    injectJsonLd(crumbs);
  }

  // Keep render, injectJsonLd, ready helpers unchanged (copy from your file)
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
        return { "@type": "ListItem", "position": i + 1, "name": c.name, "item": c.url };
      });
      var ld = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": itemList };
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

  // Run when DOM ready if #breadcrumb is already present
  ready(function () {
    if (document.querySelector(selector)) {
      buildCrumbs();
    } else {
      // If header will be injected later, wait for the custom event
      window.addEventListener('header-included', function () {
        buildCrumbs();
      }, { once: true });
      // Also set a fallback timeout in case the event never fires
      setTimeout(function () {
        if (document.querySelector(selector)) buildCrumbs();
      }, 1000);
    }
  });

  // Expose for manual invocation if you want
  window.buildBreadcrumbs = buildCrumbs;
})();
