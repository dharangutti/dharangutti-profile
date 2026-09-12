(function () {
  'use strict';

  var list = document.querySelector('[data-paper-source]');
  if (!list) return;

  var source = list.getAttribute('data-paper-source') || '/white-papers.html';
  var requestedLimit = Number.parseInt(list.getAttribute('data-paper-limit'), 10);
  var limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 4;

  function collapseWhitespace(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function safeUrl(value) {
    if (!value) return null;

    try {
      var url = new URL(value, document.baseURI);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
      return url.href;
    } catch (error) {
      return null;
    }
  }

  function sourceText(element, selector) {
    var match = element.querySelector(selector);
    return match ? collapseWhitespace(match.textContent) : '';
  }

  function createExternalLink(sourceLink, title) {
    var href = safeUrl(sourceLink && sourceLink.getAttribute('href'));
    if (!href || !title) return null;

    var link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = title;

    var context = document.createElement('span');
    context.className = 'sr-only';
    context.textContent = ' (DOI record, opens in a new tab)';
    link.appendChild(context);
    return link;
  }

  function createDownloadLink(sourceLink, title) {
    var href = safeUrl(sourceLink && sourceLink.getAttribute('href'));
    if (!href) return null;

    var link = document.createElement('a');
    link.className = 'paper-download';
    link.href = href;
    link.textContent = 'Download PDF';
    link.setAttribute('type', sourceLink.getAttribute('type') || 'application/pdf');

    var downloadName = sourceLink.getAttribute('download');
    if (downloadName) link.setAttribute('download', downloadName);

    var context = document.createElement('span');
    context.className = 'sr-only';
    context.textContent = ': ' + title + ' ';
    link.appendChild(context);

    var arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.innerHTML = '&darr;';
    link.appendChild(arrow);
    return link;
  }

  function createPaperCard(sourcePaper) {
    var titleSource = sourcePaper.querySelector('.paper-title');
    var title = sourceText(sourcePaper, '.paper-title');
    var description = sourceText(sourcePaper, '.paper-description');
    var meta = sourceText(sourcePaper, '.paper-meta');
    var titleLink = createExternalLink(titleSource, title);
    var downloadLink = createDownloadLink(
      sourcePaper.querySelector('.paper-actions .paper-download'),
      title
    );

    if (!titleLink || !meta || !description) return null;

    var card = document.createElement('article');
    card.className = 'paper';

    var copy = document.createElement('div');
    copy.className = 'paper-copy';

    var metaElement = document.createElement('p');
    metaElement.className = 'paper-meta';
    metaElement.textContent = meta;
    copy.appendChild(metaElement);

    var heading = document.createElement('h3');
    heading.appendChild(titleLink);
    copy.appendChild(heading);

    var descriptionElement = document.createElement('p');
    descriptionElement.textContent = description;
    copy.appendChild(descriptionElement);

    card.appendChild(copy);
    if (downloadLink) card.appendChild(downloadLink);
    return card;
  }

  function showMessage(message, includeLink) {
    list.replaceChildren();
    var status = document.createElement('p');
    status.className = 'paper-load-status';
    status.textContent = message + ' ';

    if (includeLink) {
      var link = document.createElement('a');
      link.href = '/white-papers.html';
      link.textContent = 'Browse all white papers';
      status.appendChild(link);
    }

    list.appendChild(status);
    list.setAttribute('aria-busy', 'false');
  }

  fetch(source, {
    headers: { Accept: 'text/html' },
    cache: 'no-cache'
  })
    .then(function (response) {
      if (!response.ok) throw new Error('White papers request failed');
      return response.text();
    })
    .then(function (html) {
      var documentFragment = new DOMParser().parseFromString(html, 'text/html');
      var sourceList = documentFragment.querySelector('#paper-list-zenodo');
      if (!sourceList) throw new Error('White papers list not found');

      var cards = Array.from(sourceList.querySelectorAll(':scope > .paper-item'))
        .slice(0, limit)
        .map(createPaperCard)
        .filter(Boolean);
      if (!cards.length) throw new Error('No archived papers found');

      list.replaceChildren.apply(list, cards);
      list.setAttribute('aria-busy', 'false');
    })
    .catch(function () {
      showMessage('The latest papers are available on the white papers page.', true);
    });
})();
