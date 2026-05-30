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

async function pdFetch(endpoint: string, params: Record<string, string>) {
  const qs = new URLSearchParams({ key: PROPERTYDATA_API_KEY, ...params })
  try {
    const res = await fetch(`https://api.propertydata.co.uk/${endpoint}?${qs}`)
    return await res.json()
  } catch {
    return null
  }
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
      return json({ error: 'Property has no postcode' }, 400)
    }

    const pc = { postcode }
    const bedrooms = property.bedrooms ? String(property.bedrooms) : '3'
    const propType = property.property_type ?? 'Semi-detached house'

    // Call PropertyData endpoints in parallel
    const [
      soldPrices, rents, yields, growth, demand,
      demographics, crime, schools, floodRisk,
      stampDuty, valuationRent, rentsHmo
    ] = await Promise.all([
      pdFetch('sold-prices', { ...pc, max_age: '12', radius: '0.25' }),
      pdFetch('rents', pc),
      pdFetch('yields', pc),
      pdFetch('growth', pc),
      pdFetch('demand', pc),
      pdFetch('demographics', pc),
      pdFetch('crime', pc),
      pdFetch('schools', pc),
      pdFetch('flood-risk', pc),
      property.price ? pdFetch('stamp-duty-calculator', { price: String(property.price), type: 'additional' }) : null,
      pdFetch('valuation-rent', { ...pc, property_type: propType, bedrooms }),
      pdFetch('rents-hmo', pc),
    ])

    // Extract key metrics
    const d = (obj: Record<string, unknown> | null) => obj?.data ?? obj ?? {}

    const soldData = d(soldPrices) as Record<string, unknown>
    const rentsData = d(rents) as Record<string, unknown>
    const yieldsData = d(yields) as Record<string, unknown>
    const growthData = d(growth) as Record<string, unknown>
    const demandData = d(demand) as Record<string, unknown>
    const rentValData = d(valuationRent) as Record<string, unknown>
    const hmoData = d(rentsHmo) as Record<string, unknown>
    const stampData = d(stampDuty) as Record<string, unknown>

    const avgRent = rentValData.result ?? rentsData.average_rent ?? rentsData.average ?? null
    const avgSqft = soldData.average_price_per_sqft ?? null
    const hmoSignal = demandData.hmo_demand ?? null
    const growthRate = growthData.growth_1y ?? null
    const estimatedValue = soldData.average ?? null

    const grossYield = (avgRent && property.price)
      ? Number(((Number(avgRent) * 12) / property.price * 100).toFixed(2))
      : (yieldsData.gross_yield ?? null)

    const analysis = {
      avg_monthly_rent: avgRent != null ? Number(avgRent) : null,
      avg_price_per_sqft: avgSqft != null ? Number(avgSqft) : null,
      hmo_demand: hmoSignal,
      growth_1y: growthRate,
      gross_yield: grossYield != null ? Number(grossYield) : null,
      estimated_value: estimatedValue != null ? Number(estimatedValue) : null,
      stamp_duty: stampData.tax ?? stampData.stamp_duty ?? null,
      rent_valuation: avgRent != null ? Number(avgRent) : null,
      hmo_room_rent: hmoData.average ?? hmoData.room_rent ?? null,
      area_yield: yieldsData.gross_yield ?? null,
    }

    const comps = soldData.raw_data ?? soldData.transactions ?? []

    // Area data for PDF brochure
    const areaData = {
      demographics: d(demographics),
      crime: d(crime),
      schools: d(schools),
      flood_risk: d(floodRisk),
    }

    // Insert analysis row
    const { data: inserted, error: insertErr } = await admin
      .from('deal_analysis')
      .insert({
        property_id,
        tenant_id,
        deal_type: 'btl',
        inputs: { purchase_price: property.price },
        outputs: analysis,
        propertydata_comps: comps,
        area_data: areaData,
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
      area_data: areaData,
      raw: { soldPrices, rents, yields, growth, demand, demographics, crime, schools, floodRisk, stampDuty, valuationRent, rentsHmo },
    })

  } catch (err) {
    console.error('analyze-property error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
