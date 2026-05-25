import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SENDGRID_API_KEY         = Deno.env.get('SENDGRID_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const { embed_key, name, email, phone, message } = await req.json()

    if (!embed_key) {
      return json({ error: 'Missing embed_key' }, 400)
    }

    // ── Look up tenant by embed_key (service role — bypasses RLS) ────────
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: tenantRow, error: tenantErr } = await admin
      .from('tenants')
      .select('id, settings')
      .eq('settings->>embed_key', embed_key)
      .maybeSingle()

    if (tenantErr || !tenantRow) {
      return json({ error: 'Invalid embed key' }, 401)
    }

    // ── Validate required fields based on widget_config ──────────────────
    const settings     = (tenantRow.settings ?? {}) as Record<string, unknown>
    const widgetConfig = (settings.widget_config ?? {}) as Record<string, unknown>
    const fields       = (widgetConfig.fields ?? {}) as Record<string, boolean>

    // Email is always required
    if (!email) {
      return json({ error: 'Email is required' }, 400)
    }

    if (fields.name !== false && !name) {
      return json({ error: 'Name is required' }, 400)
    }

    if (fields.message !== false && !message) {
      return json({ error: 'Message is required' }, 400)
    }

    // ── Insert enquiry ───────────────────────────────────────────────────
    const { data: insertedRow, error: insertErr } = await admin
      .from('enquiries')
      .insert({
        tenant_id: tenantRow.id,
        name:    name ?? '',
        email,
        phone:   phone ?? null,
        message: message ?? '',
        source:  'website',
        status:  'new',
      })
      .select('id')
      .single()

    if (insertErr || !insertedRow) {
      console.error('Insert error:', insertErr)
      return json({ error: 'Failed to save enquiry' }, 500)
    }

    // ── Fire AI draft generation (fire-and-forget) ──────────────────────
    fetch(`${SUPABASE_URL}/functions/v1/draft-enquiry-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ enquiry_id: insertedRow.id, tenant_id: tenantRow.id }),
    }).catch(err => console.error('draft-response fire-and-forget failed:', err))

    // ── Send notification email (best-effort — don't fail the enquiry) ───
    const notifyEmail = settings.notification_email as string | undefined

    if (notifyEmail && SENDGRID_API_KEY) {
      try {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: notifyEmail }] }],
            from: { email: 'support@bookablecrm.com', name: 'BookableCRM' },
            subject: `New enquiry from ${name || email}`,
            content: [{
              type: 'text/plain',
              value: [
                `New enquiry received via your website form.`,
                ``,
                `Name: ${name || '(not provided)'}`,
                `Email: ${email}`,
                phone ? `Phone: ${phone}` : null,
                message ? `Message: ${message}` : null,
                ``,
                `Log in to your BookableCRM dashboard to follow up.`,
              ].filter(Boolean).join('\n'),
            }],
          }),
        })
      } catch (e) {
        console.error('Notification email failed:', e)
      }
    }

    return json({ success: true })

  } catch (err) {
    console.error('submit-enquiry error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
