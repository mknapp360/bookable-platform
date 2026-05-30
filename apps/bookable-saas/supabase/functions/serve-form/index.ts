import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
}

// Returns form data as JSON — the actual HTML form is hosted in Storage
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Missing token' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const { data: submission, error } = await admin
    .from('form_submissions')
    .select('*, form_template:form_templates(name, schema), contact:contacts(first_name)')
    .eq('token', token)
    .single()

  if (error || !submission) {
    return new Response(
      JSON.stringify({ error: 'Form not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const template = submission.form_template as { name: string; schema: unknown }
  const contactName = (submission.contact as { first_name: string } | null)?.first_name ?? ''

  return new Response(
    JSON.stringify({
      form_name: template.name,
      contact_name: contactName,
      schema: template.schema,
      status: submission.status,
      submit_url: `${SUPABASE_URL}/functions/v1/submit-form`,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
