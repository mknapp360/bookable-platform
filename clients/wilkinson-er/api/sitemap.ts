import type { IncomingMessage, ServerResponse } from 'http'
import { createClient } from '@supabase/supabase-js'
import { sectors, locations } from '../src/data/seo-locations'

const BASE = 'https://www.bookable.online'

function url(loc: string, lastmod?: string, priority = '0.7', changefreq = 'monthly') {
  return `  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  const today = new Date().toISOString().split('T')[0]

  // Fetch published blog posts for their slugs + dates
  let posts: { slug: string; published_at: string }[] = []
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!,
    )
    const { data } = await supabase
      .from('posts')
      .select('slug, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    posts = data ?? []
  } catch {
    // Non-fatal — sitemap still generated without blog posts
  }

  const staticUrls = [
    url(`${BASE}/`, today, '1.0', 'weekly'),
    url(`${BASE}/blog`, today, '0.8', 'weekly'),
  ]

  // All sector × location landing pages
  const locationUrls = sectors.flatMap(sector =>
    locations.map(location =>
      url(`${BASE}/${sector.slug}/${location.slug}`, today, '0.6', 'monthly')
    )
  )

  // Blog posts
  const postUrls = posts.map(post => {
    const lastmod = post.published_at ? post.published_at.split('T')[0] : today
    return url(`${BASE}/blog/${post.slug}`, lastmod, '0.7', 'weekly')
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...locationUrls, ...postUrls].join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
  res.statusCode = 200
  res.end(xml)
}
