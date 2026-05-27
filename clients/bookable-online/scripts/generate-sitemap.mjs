// Runs at build time via: node scripts/generate-sitemap.mjs
// Writes public/sitemap.xml with all static + location pages
// Blog posts are not included here (they come from the DB at request time)
// For a fully dynamic sitemap including posts, the /api/sitemap route serves that purpose

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BASE = 'https://www.bookable.online'
const today = new Date().toISOString().split('T')[0]

const SECTORS = [
  'mortgage-brokers',
  'property-investors',
  'equity-release',
  'solicitors',
]

const LOCATIONS = [
  'surrey', 'kent', 'west-sussex', 'east-sussex', 'hampshire',
  'berkshire', 'hertfordshire', 'essex', 'buckinghamshire', 'oxfordshire',
  'brighton', 'southampton', 'reading', 'guildford', 'maidstone',
  'oxford', 'portsmouth', 'crawley', 'worthing', 'eastbourne',
  'basingstoke', 'slough', 'tunbridge-wells', 'chelmsford',
]

function entry(loc, priority = '0.7', changefreq = 'monthly') {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

// High-intent SEO landing pages
const SEO_PAGES = [
  'crm-for-mortgage-brokers-uk',
  'crm-for-equity-release-advisors',
  'crm-for-will-writers',
]

const urls = [
  entry(`${BASE}/`,     '1.0', 'weekly'),
  entry(`${BASE}/blog`, '0.8', 'weekly'),
  ...SEO_PAGES.map(p => entry(`${BASE}/${p}`, '0.9', 'monthly')),
  ...SECTORS.flatMap(s =>
    LOCATIONS.map(l => entry(`${BASE}/${s}/${l}`, '0.6', 'monthly'))
  ),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

writeFileSync(join(ROOT, 'public', 'sitemap.xml'), xml, 'utf8')
console.log(`Sitemap written: ${urls.length} URLs (${today})`)
