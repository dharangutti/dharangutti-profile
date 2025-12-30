# Anup Dharangutti — Profile Site

This repository hosts the personal profile site for Anup Dharangutti, Test Automation Specialist with 14+ years of experience in QA, modular system design, and civic-grade engineering.

## 🌐 Site URL

The site is hosted at: **https://dharangutti.in** (via GitHub Pages)

## 📄 Pages

- **[Home](https://dharangutti.in/)** - Main profile page with overview and embedded content
- **[CV](https://dharangutti.in/cv.html)** - Professional curriculum vitae
- **[Contact](https://dharangutti.in/contact.html)** - Contact information and social links
- **[Engineering Notebook](https://dharangutti.in/engineering-notebook.html)** - Modular insights and weekly updates
- **[Automation Tips](https://dharangutti.in/automation-tips.html)** - Weekly test automation best practices
- **[White Papers](https://dharangutti.in/white-papers.html)** - Research papers on engineering topics
- **[Celestial Calendar](https://dharangutti.in/celestial-calendar.html)** - Upcoming celestial events tracker

## 🔍 SEO & Discoverability

### Sitemap (sitemap.xml)

The site includes a comprehensive XML sitemap at `/sitemap.xml` that lists all major pages with:
- **Priority**: Homepage (1.0), key pages (0.9-0.8), secondary pages (0.7)
- **Change Frequency**: Weekly for dynamic content, monthly for static pages
- **Last Modified**: Updated to current date

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
  <loc>https://dharangutti.in/new-page.html</loc>
  <lastmod>YYYY-MM-DD</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

2. Update the `lastmod` date to the current date
3. Choose appropriate `changefreq` (always, hourly, daily, weekly, monthly, yearly, never)
4. Set `priority` (0.0 to 1.0, where 1.0 is highest)

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
  <meta property="og:url" content="https://dharangutti.in/page.html" />
  <meta property="og:title" content="Page Title — Anup Dharangutti" />
  <meta property="og:description" content="Social media description" />
  <meta property="og:image" content="https://dharangutti.in/avatar.png" />
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary" />
  <meta property="twitter:url" content="https://dharangutti.in/page.html" />
  <meta property="twitter:title" content="Page Title — Anup Dharangutti" />
  <meta property="twitter:description" content="Social media description" />
  <meta property="twitter:image" content="https://dharangutti.in/avatar.png" />
  
  <link rel="canonical" href="https://dharangutti.in/page.html" />
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
  loc: `https://dharangutti.in/${file}`,
  lastmod: new Date().toISOString().split('T')[0],
  changefreq: 'weekly',
  priority: file === 'index.html' ? '1.0' : '0.8'
}));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
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

- Domain: `dharangutti.in` (configured via CNAME)
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
