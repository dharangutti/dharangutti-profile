import fs from 'fs';
const papers = JSON.parse(fs.readFileSync('papers-index.json', 'utf8'));

const metadata = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "White Papers",
  "author": {
    "@type": "Person",
    "name": "Anup Dharangutti",
    "url": "https://dharangutti.in"
  },
  "hasPart": papers.map(p => ({
    "@type": "ScholarlyArticle",
    "headline": p.title,
    "datePublished": p.date,
    "url": `https://dharangutti.in/papers/${p.filename}`
  }))
};

fs.writeFileSync('papers-metadata.json', JSON.stringify(metadata, null, 2));
console.log('✅ Metadata block generated in papers-metadata.json');
