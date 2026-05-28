import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
}

interface SubmitPayload {
  token: string
  responses: Record<string, string>
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: SubmitPayload = await req.json()
    const { token, responses } = payload

    if (!token || !responses) {
      return new Response(
        JSON.stringify({ error: 'Missing token or responses' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Look up submission
    const { data: submission, error: fetchErr } = await admin
      .from('form_submissions')
      .select('id, status, form_template_id, tenant_id, contact_id')
      .eq('token', token)
      .single()

    if (fetchErr || !submission) {
      return new Response(
        JSON.stringify({ error: 'Form not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (submission.status === 'completed') {
      return new Response(
        JSON.stringify({ error: 'This form has already been submitted' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate required fields against schema
    const { data: template } = await admin
      .from('form_templates')
      .select('schema')
      .eq('id', submission.form_template_id)
      .single()

    if (template?.schema) {
      const schema = template.schema as { pages: { fields: { id: string; required: boolean; label: string }[] }[] }
      const missing: string[] = []
      for (const page of schema.pages) {
        for (const field of page.fields) {
          if (field.required && (!responses[field.id] || !responses[field.id].trim())) {
            missing.push(field.label || field.id)
          }
        }
      }
      if (missing.length > 0) {
        return new Response(
          JSON.stringify({ error: `Required fields missing: ${missing.join(', ')}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Save responses
    const { error: updateErr } = await admin
      .from('form_submissions')
      .update({
        responses,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', submission.id)

    if (updateErr) {
      return new Response(
        JSON.stringify({ error: 'Failed to save responses' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log activity
    if (submission.contact_id) {
      await admin.from('activities').insert({
        tenant_id: submission.tenant_id,
        contact_id: submission.contact_id,
        type: 'note',
        body: `Form submission completed`,
      })
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('submit-form error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
