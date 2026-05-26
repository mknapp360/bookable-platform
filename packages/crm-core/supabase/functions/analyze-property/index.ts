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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!PROPERTYDATA_API_KEY) {
      return json({ error: 'PROPERTYDATA_API_KEY not configured' }, 500)
    }

    // Verify caller is a tenant admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorised' }, 401)

    const token = authHeader.replace('Bearer ', '')
    const jwt = JSON.parse(atob(token.split('.')[1]))
    const userId = jwt.sub
    if (!userId) return json({ error: 'Invalid token' }, 401)

    const { property_id, tenant_id } = await req.json()
    if (!property_id || !tenant_id) {
      return json({ error: 'Missing property_id or tenant_id' }, 400)
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: membership } = await admin
      .from('tenant_users')
      .select('role')
      .eq('tenant_id', tenant_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!membership) return json({ error: 'Forbidden' }, 403)

    // Fetch property details
    const { data: property, error: propErr } = await admin
      .from('properties')
      .select('*')
      .eq('id', property_id)
      .single()

    if (propErr || !property) {
      return json({ error: 'Property not found' }, 404)
    }

    const postcode = property.postcode
    if (!postcode) {
      return json({ error: 'Property has no postcode — cannot analyse' }, 400)
    }

    // Call PropertyData API endpoints in parallel
    const baseUrl = 'https://api.propertydata.co.uk'
    const params = `key=${PROPERTYDATA_API_KEY}&postcode=${encodeURIComponent(postcode)}`

    const [soldRes, rentsRes, growthRes, demandRes] = await Promise.allSettled([
      fetch(`${baseUrl}/sold-prices?${params}&max_age=12&radius=0.25`).then(r => r.json()),
      fetch(`${baseUrl}/rents?${params}`).then(r => r.json()),
      fetch(`${baseUrl}/growth?${params}`).then(r => r.json()),
      fetch(`${baseUrl}/demand?${params}`).then(r => r.json()),
    ])

    const sold   = soldRes.status   === 'fulfilled' ? soldRes.value   : null
    const rents  = rentsRes.status  === 'fulfilled' ? rentsRes.value  : null
    const growth = growthRes.status === 'fulfilled' ? growthRes.value : null
    const demand = demandRes.status === 'fulfilled' ? demandRes.value : null

    // Extract key metrics
    const avgRent = rents?.data?.average_rent ?? rents?.average_rent ?? null
    const avgSqft = sold?.data?.average_price_per_sqft ?? sold?.average_price_per_sqft ?? null
    const hmoSignal = demand?.data?.hmo_demand ?? demand?.hmo_demand ?? null
    const growthRate = growth?.data?.growth_1y ?? growth?.growth_1y ?? null

    const grossYield = (avgRent && property.price)
      ? ((avgRent * 12) / property.price * 100).toFixed(2)
      : null

    const analysis = {
      avg_monthly_rent: avgRent,
      avg_price_per_sqft: avgSqft,
      hmo_demand: hmoSignal,
      growth_1y: growthRate,
      gross_yield: grossYield ? Number(grossYield) : null,
      estimated_value: sold?.data?.average ?? sold?.average ?? null,
    }

    // Comparable sales data
    const comps = sold?.data?.raw_data ?? sold?.raw_data ?? []

    // Upsert a baseline deal_analysis row
    const { data: inserted, error: insertErr } = await admin
      .from('deal_analysis')
      .insert({
        property_id,
        tenant_id,
        deal_type: 'btl',
        inputs: { purchase_price: property.price },
        outputs: analysis,
        propertydata_comps: comps,
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error('Insert error:', insertErr)
      return json({ error: 'Failed to save analysis' }, 500)
    }

    return json({
      success: true,
      analysis_id: inserted.id,
      analysis,
      comps,
      raw: { sold, rents, growth, demand },
    })

  } catch (err) {
    console.error('analyze-property error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
