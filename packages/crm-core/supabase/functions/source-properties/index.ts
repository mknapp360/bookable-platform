import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const PROPERTYDATA_API_KEY     = Deno.env.get('PROPERTYDATA_API_KEY')!

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

interface SourceRequest {
  tenant_id: string
  postcode: string
  list: string
  radius?: number
  results?: number
  standardised_type?: string
  exclude_sstc?: boolean
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!PROPERTYDATA_API_KEY) {
      return json({ error: 'PROPERTYDATA_API_KEY not configured' }, 500)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorised' }, 401)

    const token = authHeader.replace('Bearer ', '')
    const jwt = JSON.parse(atob(token.split('.')[1]))
    const userId = jwt.sub
    if (!userId) return json({ error: 'Invalid token' }, 401)

    const body: SourceRequest = await req.json()
    const { tenant_id, postcode, list, radius, results, standardised_type, exclude_sstc } = body

    if (!tenant_id || !postcode || !list) {
      return json({ error: 'Missing required fields: tenant_id, postcode, list' }, 400)
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: membership } = await admin
      .from('tenant_users')
      .select('role')
      .eq('tenant_id', tenant_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!membership) return json({ error: 'Forbidden' }, 403)

    // Build PropertyData API URL
    const params = new URLSearchParams({
      key: PROPERTYDATA_API_KEY,
      list,
      postcode,
      radius: String(radius ?? 20),
      results: String(results ?? 50),
    })
    if (standardised_type) params.set('standardised_type', standardised_type)
    if (exclude_sstc) params.set('exclude_sstc', '1')

    const pdRes = await fetch(
      `https://api.propertydata.co.uk/sourced-properties?${params}`
    )

    if (!pdRes.ok) {
      const detail = await pdRes.text()
      console.error('PropertyData error:', detail)
      return json({ error: 'PropertyData API failed', detail }, 502)
    }

    const pdData = await pdRes.json() as Record<string, unknown>
    if (pdData.status !== 'success') {
      return json({ error: pdData.message ?? 'PropertyData returned an error', detail: pdData }, 502)
    }

    const items = (pdData.properties ?? pdData.data ?? []) as Record<string, unknown>[]

    // Upsert into properties table
    let upserted = 0
    for (const item of items) {
      const propertyId = String(item.property_id ?? item.id ?? '')
      const address = String(item.address ?? '')
      if (!address) continue

      const images: string[] = []
      if (item.image_url && typeof item.image_url === 'string') {
        images.push(item.image_url)
      }

      const record = {
        tenant_id,
        source: 'propertydata',
        external_id: propertyId || null,
        address,
        postcode: extractPostcode(address) ?? postcode,
        price: typeof item.price === 'number' ? item.price : null,
        bedrooms: typeof item.bedrooms === 'number' ? item.bedrooms : null,
        property_type: (item.type_standardised ?? item.type ?? null) as string | null,
        description: '',
        images,
        listing_url: (item.url ?? item.listing_url ?? buildSearchUrl(address)) as string | null,
        days_listed: item.months_on_market
          ? Math.round(Number(item.months_on_market) * 30)
          : null,
        price_reduced: item.reduced_by != null && Number(item.reduced_by) > 0,
        back_on_market: false,
        strategy: list,
        distance: typeof item.distance === 'number' ? item.distance : null,
      }

      const { error: upsertErr } = await admin
        .from('properties')
        .upsert(record, { onConflict: 'tenant_id,source,external_id' })

      if (!upsertErr) upserted++
    }

    return json({ success: true, total: items.length, upserted })

  } catch (err) {
    console.error('source-properties error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})

function buildSearchUrl(address: string): string {
  return `https://www.rightmove.co.uk/house-prices/${encodeURIComponent(address)}.html`
}

function extractPostcode(address: string): string | null {
  const match = address.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i)
  return match ? match[0].toUpperCase() : null
}
