import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANTHROPIC_API_KEY         = Deno.env.get('ANTHROPIC_API_KEY')

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

  let enquiry_id: string | undefined

  try {
    const body = await req.json()
    enquiry_id = body.enquiry_id
    const tenant_id = body.tenant_id

    if (!enquiry_id || !tenant_id) {
      return json({ error: 'Missing enquiry_id or tenant_id' }, 400)
    }

    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY secret is not set')
      return json({ error: 'ANTHROPIC_API_KEY not configured' }, 500)
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // ── Fetch enquiry and tenant in parallel ────────────────────────────
    const [enquiryRes, tenantRes] = await Promise.all([
      admin.from('enquiries').select('*').eq('id', enquiry_id).single(),
      admin.from('tenants').select('settings').eq('id', tenant_id).single(),
    ])

    if (enquiryRes.error || !enquiryRes.data) {
      console.error('Enquiry fetch error:', enquiryRes.error)
      return json({ error: 'Enquiry not found' }, 404)
    }

    const enquiry = enquiryRes.data
    const settings = (tenantRes.data?.settings ?? {}) as Record<string, unknown>
    const businessProfile = settings.business_profile as {
      description?: string
      tone?: string
      response_time?: string
      signoff_name?: string
    } | undefined

    if (!businessProfile || !businessProfile.description) {
      return json({ skipped: true, reason: 'no_business_profile' })
    }

    // ── Mark as generating ──────────────────────────────────────────────
    await admin
      .from('enquiries')
      .update({ ai_draft_status: 'generating' })
      .eq('id', enquiry_id)

    // ── Build prompts ───────────────────────────────────────────────────
    const systemPrompt = `You are drafting a reply on behalf of a business to a new enquiry they have received through their website contact form.

Write a short, natural email response — 3 to 5 sentences. Do not use a subject line. Do not use placeholder text. Do not use bullet points. Just write the body of the email.

The email should:
- Acknowledge the enquiry warmly but briefly
- Confirm they will follow up properly (within the stated response time if provided)
- Sign off with the provided name

Match the tone specified. Do not mention AI, CRM software, or automated systems.`

    const userPrompt = `Business description: ${businessProfile.description}
Tone: ${businessProfile.tone ?? 'professional'}
Response time: ${businessProfile.response_time ?? ''}
Sign-off name: ${businessProfile.signoff_name ?? ''}

Enquiry from: ${enquiry.name}
Their message: ${enquiry.message}

Draft the reply.`

    // ── Call Anthropic Messages API ──────────────────────────────────────
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text()
      console.error('Anthropic API error:', anthropicRes.status, errBody)

      // Fall back to a simple draft instead of failing silently
      const fallbackDraft = `Hi ${enquiry.name},\n\nThank you for your enquiry. We've received your message and will be in touch ${businessProfile.response_time || 'shortly'}.\n\nBest regards,\n${businessProfile.signoff_name || 'The team'}`

      await admin
        .from('enquiries')
        .update({ ai_draft: fallbackDraft, ai_draft_status: 'ready' })
        .eq('id', enquiry_id)

      return json({ success: true, fallback: true })
    }

    const message = await anthropicRes.json()
    const draft = message.content
      .filter((block: { type: string }) => block.type === 'text')
      .map((block: { type: string; text: string }) => block.text)
      .join('')

    // ── Save draft ──────────────────────────────────────────────────────
    await admin
      .from('enquiries')
      .update({ ai_draft: draft, ai_draft_status: 'ready' })
      .eq('id', enquiry_id)

    return json({ success: true })

  } catch (err) {
    console.error('draft-enquiry-response error:', err)

    if (enquiry_id) {
      try {
        const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        await admin
          .from('enquiries')
          .update({ ai_draft_status: 'none' })
          .eq('id', enquiry_id)
      } catch { /* ignore cleanup errors */ }
    }

    return json({ error: 'Internal server error' }, 500)
  }
})
