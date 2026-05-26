import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY        = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SENDGRID_API_KEY         = Deno.env.get('SENDGRID_API_KEY')!

interface SendEmailPayload {
  tenant_id:  string
  contact_id: string
  to_email:   string
  to_name:    string
  subject:    string
  body:       string
}

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!SENDGRID_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'SENDGRID_API_KEY secret not set on this project' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payload: SendEmailPayload = await req.json()
    const { tenant_id, contact_id, to_email, to_name, subject, body } = payload

    if (!tenant_id || !to_email || !subject || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Verify the caller is a member of this tenant ─────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorised' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Decode JWT to get user ID for reply-to lookup later
    const token = authHeader.replace('Bearer ', '')
    const jwt = JSON.parse(atob(token.split('.')[1]))
    const userId = jwt.sub as string
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: membership } = await userClient
      .from('tenant_users')
      .select('role')
      .eq('tenant_id', tenant_id)
      .maybeSingle()

    if (!membership) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Read per-tenant from address from settings (service role) ─────────────
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: tenantRow } = await admin
      .from('tenants')
      .select('name, settings')
      .eq('id', tenant_id)
      .single()

    const settings   = (tenantRow?.settings ?? {}) as Record<string, unknown>
    const emailConfig = (settings.email_config ?? {}) as Record<string, unknown>
    let fromEmail  = emailConfig.from_email as string | undefined
    let fromName   = emailConfig.from_name  as string | undefined

    // Fall back: send from bookablecrm.com with reply-to set to the logged-in user's email
    let replyTo: { email: string; name?: string } | undefined
    if (!fromEmail) {
      fromEmail = 'support@bookablecrm.com'
      if (!fromName) fromName = tenantRow?.name ?? 'BookableCRM'

      // Look up the authenticated user's email for reply-to
      const { data: userData } = await admin.auth.admin.getUserById(userId)
      const userEmail = userData?.user?.email
      if (userEmail) {
        replyTo = { email: userEmail, ...(fromName ? { name: fromName } : {}) }
      }
    }

    // ── Send via SendGrid ─────────────────────────────────────────────────────
    const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to_email, name: to_name }] }],
        from: { email: fromEmail, ...(fromName ? { name: fromName } : {}) },
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        content: [{ type: 'text/plain', value: body }],
      }),
    })

    if (!sgRes.ok) {
      const detail = await sgRes.text()
      console.error('SendGrid error:', detail)
      return new Response(
        JSON.stringify({ error: 'SendGrid rejected the send', detail }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Log activity ──────────────────────────────────────────────────────────
    await admin.from('activities').insert({
      tenant_id,
      contact_id,
      type: 'email',
      body: `"Nice to meet you" email sent to ${to_email}`,
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('send-email error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
