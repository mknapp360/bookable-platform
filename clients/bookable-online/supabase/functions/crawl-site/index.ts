// Supabase Edge Function: crawl-site
//
// Crawls a site: fetches the given URL, discovers internal links,
// follows up to 10 pages, and returns combined text + JSON-LD schema.
// No secrets required — this is a public utility function.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_PAGES = 10
const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; BookableAudit/1.0; +https://www.bookable.online)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-GB,en;q=0.9',
}

function extractJsonLd(html: string): string[] {
  const blocks: string[] = []
  const regex = /<script\s+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const content = match[1].trim()
    if (content.length > 0) blocks.push(content)
  }
  return blocks
}

function extractInternalLinks(html: string, baseUrl: URL): string[] {
  const links: string[] = []
  const regex = /<a\s[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    try {
      const resolved = new URL(match[1], baseUrl)
      // Same origin only, skip assets/files
      if (resolved.origin === baseUrl.origin && !resolved.pathname.match(/\.(png|jpg|jpeg|gif|svg|css|js|pdf|zip|ico|webmanifest|xml|txt)$/i)) {
        links.push(resolved.origin + resolved.pathname)
      }
    } catch {
      // Skip malformed URLs
    }
  }
  // Deduplicate
  return [...new Set(links)]
}

function stripHtml(html: string): string {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')

  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|section|article|header|main)>/gi, '\n')
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<[^>]+>/g, ' ')

  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/&\w+;/g, '')

  text = text
    .split('\n')
    .map((line: string) => line.replace(/\s+/g, ' ').trim())
    .filter((line: string) => line.length > 0)
    .join('\n')

  return text.trim()
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: FETCH_HEADERS, redirect: 'follow' })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing url field' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
      )
    }

    const baseUrl = new URL(url)
    const visited = new Set<string>()
    const allSchema: string[] = []
    const pageContents: string[] = []

    // Fetch the entry page
    const entryHtml = await fetchPage(url)
    if (!entryHtml) {
      return new Response(
        JSON.stringify({ error: `Could not fetch ${url}`, content: '', schema: [] }),
        { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } },
      )
    }

    visited.add(baseUrl.origin + baseUrl.pathname)
    allSchema.push(...extractJsonLd(entryHtml))
    pageContents.push(`--- PAGE: ${url} ---\n${stripHtml(entryHtml)}`)

    // Discover internal links from the entry page
    const discovered = extractInternalLinks(entryHtml, baseUrl)
      .filter((link) => !visited.has(link))

    // Crawl discovered pages (up to MAX_PAGES total)
    const toCrawl = discovered.slice(0, MAX_PAGES - 1)

    // Fetch in parallel batches of 5
    for (let i = 0; i < toCrawl.length; i += 5) {
      const batch = toCrawl.slice(i, i + 5)
      const results = await Promise.all(
        batch.map(async (pageUrl) => {
          visited.add(pageUrl)
          const html = await fetchPage(pageUrl)
          return { pageUrl, html }
        })
      )

      for (const { pageUrl, html } of results) {
        if (!html) continue
        allSchema.push(...extractJsonLd(html))
        pageContents.push(`--- PAGE: ${pageUrl} ---\n${stripHtml(html)}`)
      }
    }

    const content = pageContents.join('\n\n')

    return new Response(
      JSON.stringify({
        content,
        schema: [...new Set(allSchema)],
        pages_crawled: visited.size,
        length: content.length,
      }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(
      JSON.stringify({ error: message, content: '', schema: [] }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }
})
