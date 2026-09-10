import fs from 'fs';
const papers = JSON.parse(fs.readFileSync('papers-index.json', 'utf8'));

const metadata = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "White Papers",
  "author": {
    "@type": "Person",
    "name": "Anup Dharangutti",
    "url": "https://www.dharangutti.in/"
  },
  "hasPart": papers.map(p => ({
    "@type": "ScholarlyArticle",
    "headline": p.title,
    "description": p.description,
    "datePublished": p.date,
    "url": `https://www.dharangutti.in/papers/${encodeURIComponent(p.filename)}`,
    ...(p.doi ? {
      "identifier": `https://doi.org/${p.doi}`,
      "sameAs": p.zenodoUrl,
      "publisher": { "@type": "Organization", "name": "Zenodo" }
    } : {})
  }))
};

fs.writeFileSync('papers-metadata.json', JSON.stringify(metadata, null, 2));
console.log('✅ Metadata block generated in papers-metadata.json');
