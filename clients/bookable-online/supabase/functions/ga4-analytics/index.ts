// Supabase Edge Function: ga4-analytics
//
// Required Supabase secrets (set via `supabase secrets set`):
//   GA4_PROPERTY_ID  — e.g. "properties/123456789"
//   GA4_CLIENT_EMAIL — service account email
//   GA4_PRIVATE_KEY  — service account private key (PEM, with literal \n)
//
// The service account needs "Viewer" access to the GA4 property.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Google service-account JWT → access token ──────────────────────────────

async function getAccessToken(): Promise<string> {
  const clientEmail = Deno.env.get('GA4_CLIENT_EMAIL')!
  const rawKey = Deno.env.get('GA4_PRIVATE_KEY')!.replace(/\\n/g, '\n')

  const now = Math.floor(Date.now() / 1000)
  const b64url = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

  const header  = b64url({ alg: 'RS256', typ: 'JWT' })
  const payload = b64url({
    iss:  clientEmail,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud:  'https://oauth2.googleapis.com/token',
    exp:  now + 3600,
    iat:  now,
  })

  const sigInput = `${header}.${payload}`

  // Import the PEM private key
  const pem = rawKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')
  const keyBytes = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const sigBytes = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(sigInput),
  )

  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  const jwt = `${sigInput}.${sig}`

  // Exchange JWT for OAuth2 access token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const json = await res.json()
  if (!json.access_token) {
    throw new Error(`OAuth token error: ${JSON.stringify(json)}`)
  }
  return json.access_token
}

// ── GA4 Data API helper ────────────────────────────────────────────────────

async function ga4(
  propertyId: string,
  token: string,
  body: object,
): Promise<any> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )
  const json = await res.json()
  if (json.error) throw new Error(`GA4 error: ${JSON.stringify(json.error)}`)
  return json
}

function pct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function metric(cur: string | undefined, prev: string | undefined, multiplier = 1) {
  const value    = parseFloat(cur  ?? '0') * multiplier
  const previous = parseFloat(prev ?? '0') * multiplier
  return { value, previous, change: pct(value, previous) }
}

// ── Handler ────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    // Verify Supabase session
    const auth = req.headers.get('Authorization')
    if (!auth) throw new Error('Missing Authorization header')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: auth } } },
    )
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) throw new Error('Unauthorized')

    const propertyId = Deno.env.get('GA4_PROPERTY_ID')!
    const token = await getAccessToken()

    // ── 1. Summary report (current + previous 7-day periods) ──────────────
    const summaryReport = await ga4(propertyId, token, {
      dateRanges: [
        { startDate: '7daysAgo',  endDate: 'yesterday', name: 'current'  },
        { startDate: '14daysAgo', endDate: '8daysAgo',  name: 'previous' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'totalUsers' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    })

    // GA4 returns one row per dateRange when there are no dimensions
    const rows = summaryReport.rows ?? []
    const cur  = rows.find((r: any) => r.dimensionValues?.[0]?.value === 'current')?.metricValues  ?? []
    const prev = rows.find((r: any) => r.dimensionValues?.[0]?.value === 'previous')?.metricValues ?? []

    const sessions        = metric(cur[0]?.value, prev[0]?.value)
    const pageViews       = metric(cur[1]?.value, prev[1]?.value)
    const uniqueVisitors  = metric(cur[2]?.value, prev[2]?.value)
    const avgDuration     = metric(cur[3]?.value, prev[3]?.value)
    const bounceRate      = metric(cur[4]?.value, prev[4]?.value, 100) // decimal → %

    // ── 2. Daily time-series ───────────────────────────────────────────────
    const tsReport = await ga4(propertyId, token, {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    })

    const timeSeries = (tsReport.rows ?? []).map((row: any) => {
      const d = row.dimensionValues[0].value as string // YYYYMMDD
      return {
        date:      `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`,
        sessions:  parseInt(row.metricValues[0].value, 10),
        pageViews: parseInt(row.metricValues[1].value, 10),
      }
    })

    // ── 3. Top pages ───────────────────────────────────────────────────────
    const pagesReport = await ga4(propertyId, token, {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
      dimensions: [{ name: 'pagePath' }],
      metrics:    [{ name: 'screenPageViews' }],
      orderBys:   [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 5,
    })

    const topPages = (pagesReport.rows ?? []).map((row: any) => ({
      path:  row.dimensionValues[0].value as string,
      views: parseInt(row.metricValues[0].value, 10),
    }))

    return new Response(
      JSON.stringify({ sessions, pageViews, uniqueVisitors, avgDuration, bounceRate, timeSeries, topPages }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }
})
