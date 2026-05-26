import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const APIFY_API_TOKEN          = Deno.env.get('APIFY_API_TOKEN')!

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

interface ScrapeRequest {
  tenant_id: string
  location: string
  max_price?: number
  property_type?: string
  bedrooms?: number
  source: 'rightmove' | 'zoopla'
}

const ACTOR_IDS: Record<string, string> = {
  rightmove: 'dhrumil~rightmove-scraper',
  zoopla:    'dhrumil~zoopla-scraper',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!APIFY_API_TOKEN) {
      return json({ error: 'APIFY_API_TOKEN not configured' }, 500)
    }

    // Verify caller is a tenant admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorised' }, 401)

    const token = authHeader.replace('Bearer ', '')
    const payloadB64 = token.split('.')[1]
    const jwt = JSON.parse(atob(payloadB64))
    const userId = jwt.sub
    if (!userId) return json({ error: 'Invalid token' }, 401)

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: membership } = await admin
      .from('tenant_users')
      .select('role')
      .eq('tenant_id', (await req.clone().json()).tenant_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!membership) return json({ error: 'Forbidden' }, 403)

    const body: ScrapeRequest = await req.json()
    const { tenant_id, location, max_price, property_type, bedrooms, source } = body

    if (!tenant_id || !location || !source) {
      return json({ error: 'Missing required fields: tenant_id, location, source' }, 400)
    }

    const actorId = ACTOR_IDS[source]
    if (!actorId) return json({ error: `Unknown source: ${source}` }, 400)

    // Build Apify actor input
    const actorInput: Record<string, unknown> = {
      location,
      maxItems: 50,
    }
    if (source === 'rightmove') {
      actorInput.searchType = 'sale'
      if (max_price) actorInput.maxPrice = max_price
      if (property_type) actorInput.propertyType = property_type
      if (bedrooms) actorInput.minBedrooms = bedrooms
    } else {
      actorInput.listing_status = 'sale'
      if (max_price) actorInput.max_price = max_price
      if (property_type) actorInput.property_type = property_type
      if (bedrooms) actorInput.minimum_beds = bedrooms
    }

    // Run the actor synchronously (wait for results)
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actorInput),
      }
    )

    if (!runRes.ok) {
      const detail = await runRes.text()
      console.error('Apify error:', detail)
      return json({ error: 'Apify scrape failed', detail }, 502)
    }

    const items = await runRes.json() as Record<string, unknown>[]

    // Normalise and upsert into properties
    let upserted = 0
    for (const item of items) {
      const property = normalise(item, source, tenant_id)
      if (!property) continue

      const { error: upsertErr } = await admin
        .from('properties')
        .upsert(property, { onConflict: 'tenant_id,source,external_id' })

      if (!upsertErr) upserted++
    }

    return json({ success: true, total: items.length, upserted })

  } catch (err) {
    console.error('scrape-properties error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})

function normalise(
  item: Record<string, unknown>,
  source: string,
  tenant_id: string,
): Record<string, unknown> | null {
  // Both scrapers have slightly different schemas
  const address = (item.address ?? item.title ?? item.displayAddress ?? '') as string
  if (!address) return null

  const externalId = String(item.id ?? item.listingId ?? item.propertyId ?? '')
  const postcode = extractPostcode(address)

  const images: string[] = []
  if (Array.isArray(item.images)) {
    for (const img of item.images) {
      if (typeof img === 'string') images.push(img)
      else if (img && typeof img === 'object' && 'url' in (img as Record<string, unknown>))
        images.push((img as Record<string, string>).url)
      else if (img && typeof img === 'object' && 'srcUrl' in (img as Record<string, unknown>))
        images.push((img as Record<string, string>).srcUrl)
    }
  }

  return {
    tenant_id,
    source,
    external_id: externalId || null,
    address,
    postcode,
    price: parsePrice(item.price ?? item.displayPrice),
    bedrooms: Number(item.bedrooms ?? item.beds) || null,
    property_type: (item.propertyType ?? item.property_type ?? null) as string | null,
    description: (item.description ?? item.summary ?? '') as string,
    images,
    listing_url: (item.url ?? item.link ?? item.propertyUrl ?? null) as string | null,
    days_listed: Number(item.daysOnMarket ?? item.daysListed) || null,
    price_reduced: Boolean(item.priceReduced ?? item.isPriceReduced ?? false),
    back_on_market: Boolean(item.backOnMarket ?? item.isBackOnMarket ?? false),
  }
}

function parsePrice(raw: unknown): number | null {
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') {
    const n = Number(raw.replace(/[^0-9]/g, ''))
    return n > 0 ? n : null
  }
  return null
}

function extractPostcode(address: string): string | null {
  const match = address.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i)
  return match ? match[0].toUpperCase() : null
}
