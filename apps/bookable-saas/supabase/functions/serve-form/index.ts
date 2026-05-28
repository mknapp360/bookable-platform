import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return new Response('Missing token', { status: 400, headers: corsHeaders })
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Look up the submission
  const { data: submission, error } = await admin
    .from('form_submissions')
    .select('*, form_template:form_templates(name, schema), contact:contacts(first_name)')
    .eq('token', token)
    .single()

  if (error || !submission) {
    return new Response('Form not found', { status: 404, headers: corsHeaders })
  }

  if (submission.status === 'completed') {
    return new Response(renderPage('Form Already Submitted', `
      <div style="text-align:center;padding:60px 20px;">
        <div style="font-size:48px;margin-bottom:16px;">&#10003;</div>
        <h1 style="font-size:20px;color:#1e293b;margin-bottom:8px;">Thank you</h1>
        <p style="color:#64748b;font-size:14px;">This form has already been submitted.</p>
      </div>
    `), { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } })
  }

  const template = submission.form_template as { name: string; schema: { pages: Page[] } }
  const contactName = (submission.contact as { first_name: string } | null)?.first_name ?? ''
  const pages = template.schema.pages.sort((a: Page, b: Page) => a.order - b.order)

  return new Response(renderFormPage(template.name, contactName, pages, token), {
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
})

interface Field {
  id: string
  label: string
  type: string
  required: boolean
  order: number
  placeholder?: string
  options?: string[]
}

interface Page {
  id: string
  title: string
  order: number
  fields: Field[]
}

function renderPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#334155;min-height:100vh;display:flex;align-items:center;justify-content:center}
    .card{background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.1);max-width:560px;width:100%;margin:24px}
  </style>
</head>
<body><div class="card">${body}</div></body>
</html>`
}

function renderFormPage(formName: string, contactName: string, pages: Page[], token: string): string {
  const submitUrl = `${SUPABASE_URL}/functions/v1/submit-form`

  let fieldsHtml = ''
  for (let pi = 0; pi < pages.length; pi++) {
    const page = pages[pi]
    const sortedFields = [...page.fields].sort((a, b) => a.order - b.order)
    fieldsHtml += `<div class="page" data-page="${pi}" style="${pi > 0 ? 'display:none' : ''}">`
    if (page.title) fieldsHtml += `<h2 style="font-size:15px;font-weight:600;color:#1e293b;margin-bottom:16px;">${esc(page.title)}</h2>`
    for (const field of sortedFields) {
      const req = field.required ? ' required' : ''
      const star = field.required ? '<span style="color:#ef4444;margin-left:2px;">*</span>' : ''
      fieldsHtml += `<div style="margin-bottom:16px;">
        <label style="display:block;font-size:13px;font-weight:500;color:#475569;margin-bottom:4px;">${esc(field.label)}${star}</label>`

      if (field.type === 'message') {
        fieldsHtml += `<textarea name="${esc(field.id)}" rows="4" placeholder="${esc(field.placeholder || '')}" style="width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:14px;font-family:inherit;resize:vertical;"${req}></textarea>`
      } else if (field.type === 'dropdown') {
        fieldsHtml += `<select name="${esc(field.id)}" style="width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:14px;font-family:inherit;background:#fff;"${req}><option value="">Select…</option>`
        for (const opt of (field.options ?? [])) {
          fieldsHtml += `<option value="${esc(opt)}">${esc(opt)}</option>`
        }
        fieldsHtml += `</select>`
      } else if (field.type === 'date') {
        fieldsHtml += `<input type="date" name="${esc(field.id)}" style="width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:14px;font-family:inherit;"${req}>`
      } else if (field.type === 'email') {
        fieldsHtml += `<input type="email" name="${esc(field.id)}" placeholder="${esc(field.placeholder || 'name@example.com')}" style="width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:14px;font-family:inherit;"${req}>`
      } else {
        fieldsHtml += `<input type="text" name="${esc(field.id)}" placeholder="${esc(field.placeholder || '')}" style="width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:14px;font-family:inherit;"${req}>`
      }
      fieldsHtml += `</div>`
    }
    fieldsHtml += `</div>`
  }

  const greeting = contactName ? `Hi ${esc(contactName)}, please complete this form.` : 'Please complete this form.'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(formName)}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#334155;min-height:100vh;display:flex;align-items:center;justify-content:center}
    .card{background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.1);max-width:560px;width:100%;margin:24px;padding:32px}
    .btn{padding:10px 24px;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;transition:opacity .15s}
    .btn-primary{background:#2563eb;color:#fff}.btn-primary:hover{opacity:.9}
    .btn-secondary{background:#f1f5f9;color:#475569}.btn-secondary:hover{background:#e2e8f0}
    .btn:disabled{opacity:.5;cursor:not-allowed}
    .nav{display:flex;justify-content:space-between;align-items:center;margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9}
    .error{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:8px 12px;color:#dc2626;font-size:13px;margin-bottom:16px;display:none}
    .success{text-align:center;padding:40px 20px}
    .page-indicator{font-size:12px;color:#94a3b8}
  </style>
</head>
<body>
<div class="card">
  <h1 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:4px;">${esc(formName)}</h1>
  <p style="font-size:13px;color:#94a3b8;margin-bottom:24px;">${greeting}</p>
  <div id="error" class="error"></div>
  <form id="form" novalidate>
    ${fieldsHtml}
    <div class="nav">
      <div>
        ${pages.length > 1 ? '<button type="button" id="prevBtn" class="btn btn-secondary" style="display:none" onclick="navigate(-1)">Previous</button>' : '<span></span>'}
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        ${pages.length > 1 ? '<span class="page-indicator" id="pageIndicator"></span>' : ''}
        ${pages.length > 1
          ? '<button type="button" id="nextBtn" class="btn btn-primary" onclick="navigate(1)">Next</button>'
          : ''}
        <button type="submit" id="submitBtn" class="btn btn-primary" ${pages.length > 1 ? 'style="display:none"' : ''}>Submit</button>
      </div>
    </div>
  </form>
  <div id="success" class="success" style="display:none">
    <div style="font-size:48px;margin-bottom:16px;">&#10003;</div>
    <h2 style="font-size:18px;color:#1e293b;margin-bottom:8px;">Thank you!</h2>
    <p style="color:#64748b;font-size:14px;">Your response has been recorded.</p>
  </div>
</div>
<script>
  const TOTAL=${pages.length}, TOKEN='${token}', SUBMIT_URL='${submitUrl}';
  let current=0;
  function navigate(dir){
    // validate current page required fields
    if(dir>0){const pg=document.querySelector('[data-page="'+current+'"]');const inv=pg.querySelectorAll(':invalid');if(inv.length){inv[0].focus();return}}
    document.querySelector('[data-page="'+current+'"]').style.display='none';
    current+=dir;
    document.querySelector('[data-page="'+current+'"]').style.display='';
    updateNav();
  }
  function updateNav(){
    const prev=document.getElementById('prevBtn'),next=document.getElementById('nextBtn'),sub=document.getElementById('submitBtn'),ind=document.getElementById('pageIndicator');
    if(prev)prev.style.display=current>0?'':'none';
    if(next)next.style.display=current<TOTAL-1?'':'none';
    if(sub)sub.style.display=current===TOTAL-1?'':'none';
    if(ind)ind.textContent='Page '+(current+1)+' of '+TOTAL;
  }
  updateNav();
  document.getElementById('form').addEventListener('submit',async function(e){
    e.preventDefault();
    const btn=document.getElementById('submitBtn');btn.disabled=true;btn.textContent='Submitting…';
    const fd=new FormData(this),responses={};
    for(const[k,v]of fd.entries())responses[k]=v;
    try{
      const res=await fetch(SUBMIT_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:TOKEN,responses:responses})});
      const json=await res.json();
      if(!res.ok){document.getElementById('error').textContent=json.error||'Something went wrong';document.getElementById('error').style.display='';btn.disabled=false;btn.textContent='Submit';return}
      document.getElementById('form').style.display='none';
      document.getElementById('success').style.display='';
    }catch(err){document.getElementById('error').textContent='Network error — please try again';document.getElementById('error').style.display='';btn.disabled=false;btn.textContent='Submit';}
  });
</script>
</body>
</html>`
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
