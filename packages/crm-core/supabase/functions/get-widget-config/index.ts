import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
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
    const url = new URL(req.url)
    const embed_key = url.searchParams.get('embed_key')

    if (!embed_key) {
      return json({ error: 'Missing embed_key parameter' }, 400)
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: tenantRow, error } = await admin
      .from('tenants')
      .select('settings')
      .eq('settings->>embed_key', embed_key)
      .maybeSingle()

    if (error || !tenantRow) {
      return json({ error: 'Invalid embed key' }, 401)
    }

    const settings     = (tenantRow.settings ?? {}) as Record<string, unknown>
    const widgetConfig = (settings.widget_config ?? {}) as Record<string, unknown>

    // Return config with sensible defaults
    return json({
      title:           widgetConfig.title           ?? 'Get in touch',
      fields: {
        name:    ((widgetConfig.fields as Record<string, boolean> | undefined)?.name)    ?? true,
        email:   true, // always on
        phone:   ((widgetConfig.fields as Record<string, boolean> | undefined)?.phone)   ?? false,
        message: ((widgetConfig.fields as Record<string, boolean> | undefined)?.message) ?? true,
      },
      submit_label:    widgetConfig.submit_label    ?? 'Send enquiry',
      success_message: widgetConfig.success_message ?? "Thanks! We'll be in touch shortly.",
    })

  } catch (err) {
    console.error('get-widget-config error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
