# Anup Dharangutti — Profile Site

This repository hosts the personal profile site for Anup Dharangutti, Test Automation Specialist with 14+ years of experience in QA, modular system design, and civic-grade engineering.

## 🌐 Site URL

The site is hosted at: **https://www.dharangutti.in** (via GitHub Pages)

## 📄 Pages

- **[Home](https://www.dharangutti.in/)** - Main profile page with overview and embedded content
- **[CV](https://www.dharangutti.in/cv.html)** - Professional curriculum vitae
- **[Contact](https://www.dharangutti.in/contact.html)** - Contact information and social links
- **[Engineering Notebook](https://www.dharangutti.in/engineering-notebook.html)** - Modular insights and weekly updates
- **[Automation Tips](https://www.dharangutti.in/automation-tips.html)** - Weekly test automation best practices
- **[White Papers](https://www.dharangutti.in/white-papers.html)** - Research papers on engineering topics
- **[Celestial Calendar](https://www.dharangutti.in/celestial-calendar.html)** - Upcoming celestial events tracker

## 🔍 SEO & Discoverability

### Sitemap (sitemap.xml)

The site includes an XML sitemap at `/sitemap.xml` that lists the canonical public pages and directly indexable PDFs with:
- **Canonical URLs**: `https://www.dharangutti.in` from the repository `CNAME`
- **Last Modified**: Included only when the date can be determined accurately from Git history

The sitemap follows the [Sitemap Protocol](https://www.sitemaps.org/protocol.html) standard and helps search engines discover and index all site content.

### Robots.txt

The `/robots.txt` file:
- Allows all search engines to crawl the site
- References the sitemap location
- Follows standard robots.txt conventions

### SEO Metadata

All HTML pages include comprehensive SEO metadata:

#### Meta Tags
- **Title**: Descriptive page titles with site/author name
- **Description**: Clear, compelling descriptions for search results
- **Keywords**: Relevant keywords for search engine indexing
- **Author**: Content attribution

#### Open Graph Tags (Social Media)
- `og:type` - Content type (website, article, or profile)
- `og:url` - Canonical URL
- `og:title` - Social media title
- `og:description` - Social media description
- `og:image` - Preview image (avatar.png)

#### Twitter Card Tags
- `twitter:card` - Card type (summary or summary_large_image)
- `twitter:url` - Canonical URL
- `twitter:title` - Twitter-specific title
- `twitter:description` - Twitter-specific description
- `twitter:image` - Twitter preview image

#### Additional Elements
- **Canonical URLs**: Prevent duplicate content issues
- **Structured Data**: JSON-LD schema on homepage for Person entity
- **Semantic HTML**: Using `<header>`, `<main>`, `<section>`, `<nav>` for better SEO

## 🔄 Maintaining SEO

### Updating the Sitemap

When adding new pages to the site:

1. Edit `sitemap.xml` and add a new `<url>` entry:
```xml
<url>
  <loc>https://www.dharangutti.in/new-page.html</loc>
  <lastmod>YYYY-MM-DD</lastmod>
</url>
```

2. Add `lastmod` only when the date can be determined from Git history or another reliable source
3. Do not add `/index.html` as a separate sitemap route from `/`
4. Omit `changefreq` and `priority` unless there is a specific, meaningful reason to include them

### Updating Page Metadata

When creating new pages, include this metadata template in the `<head>`:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page Title — Anup Dharangutti</title>
  <meta name="description" content="Clear, concise description for search results (150-160 characters)." />
  <meta name="keywords" content="keyword1, keyword2, keyword3" />
  <meta name="author" content="Anup Dharangutti" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.dharangutti.in/page.html" />
  <meta property="og:title" content="Page Title — Anup Dharangutti" />
  <meta property="og:description" content="Social media description" />
  <meta property="og:image" content="https://www.dharangutti.in/avatar.png" />
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary" />
  <meta property="twitter:url" content="https://www.dharangutti.in/page.html" />
  <meta property="twitter:title" content="Page Title — Anup Dharangutti" />
  <meta property="twitter:description" content="Social media description" />
  <meta property="twitter:image" content="https://www.dharangutti.in/avatar.png" />
  
  <link rel="canonical" href="https://www.dharangutti.in/page.html" />
</head>
```

### Automated Sitemap Generation (Future Enhancement)

Consider implementing automated sitemap generation using:

**Option 1: Build-time Generation (Node.js)**
```javascript
// generate-sitemap.js
import { writeFileSync } from 'fs';
import { globSync } from 'glob';

const pages = globSync('*.html').map(file => ({
  loc: file === 'index.html' ? 'https://www.dharangutti.in/' : `https://www.dharangutti.in/${file}`
}));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${page.loc}</loc>
  </url>`).join('\n')}
</urlset>`;

writeFileSync('sitemap.xml', sitemap);
```

**Option 2: GitHub Actions Workflow**
Create `.github/workflows/update-sitemap.yml` to automatically update sitemap on push:

```yaml
name: Update Sitemap
on:
  push:
    branches: [main]
jobs:
  update-sitemap:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate sitemap
        run: node generate-sitemap.js
      - name: Commit sitemap
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add sitemap.xml
          git commit -m "Update sitemap" || exit 0
          git push
```

## 🏗️ Site Structure

```
dharangutti-profile/
├── index.html                 # Home page
├── cv.html                    # Curriculum vitae
├── contact.html               # Contact page
├── engineering-notebook.html  # Engineering insights
├── automation-tips.html       # Automation tips
├── white-papers.html          # Research papers
├── celestial-calendar.html    # Celestial events
├── header.html                # Shared header component
├── sitemap.xml               # XML sitemap for search engines
├── robots.txt                # Crawler instructions
├── CNAME                     # Custom domain configuration
├── avatar.png                # Profile image
├── cv.pdf                    # Downloadable CV
├── assets/                   # Stylesheets and resources
├── data/                     # Data files (events, tips, etc.)
├── notebook/                 # Notebook entries
├── papers/                   # White paper PDFs
└── *.js                      # JavaScript utilities
```

## 🚀 Deployment

The site is automatically deployed via **GitHub Pages** when changes are pushed to the main branch.

- Domain: `www.dharangutti.in` (configured via CNAME)
- GitHub Pages serves static files directly
- No build process required for deployment

## 📊 Monitoring SEO Performance

### Testing Tools

1. **Google Search Console**
   - Submit sitemap: https://search.google.com/search-console
   - Monitor indexing status and search performance

2. **Bing Webmaster Tools**
   - Submit sitemap: https://www.bing.com/webmasters
   - Track crawling and indexing

3. **Validation Tools**
   - Sitemap validator: https://www.xml-sitemaps.com/validate-xml-sitemap.html
   - Robots.txt tester: https://support.google.com/webmasters/answer/6062598
   - Open Graph debugger: https://developers.facebook.com/tools/debug/
   - Twitter Card validator: https://cards-dev.twitter.com/validator

### Key Metrics to Monitor

- **Indexed Pages**: Number of pages indexed by search engines
- **Search Impressions**: How often pages appear in search results
- **Click-Through Rate (CTR)**: Percentage of impressions that result in clicks
- **Search Queries**: Keywords people use to find the site
- **Page Load Speed**: Performance metrics (use Google PageSpeed Insights)

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Styling (system fonts, responsive design)
- **JavaScript (ES6+)**: Dynamic content loading
- **JSON-LD**: Structured data for search engines
- **GitHub Pages**: Static site hosting

## 📝 License

All content © Anup Dharangutti. All rights reserved.

## 📧 Contact

- **Email**: dharangutti.a@gmail.com
- **GitHub**: [@dharangutti](https://github.com/dharangutti)
- **LinkedIn**: [Anup Dharangutti](https://www.linkedin.com/in/anup-dharangutti-852a94129/)
- **Website**: [AutomationGlance.com](https://automationglance.com)
