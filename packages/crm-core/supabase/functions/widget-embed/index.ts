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
  const key = url.searchParams.get('key')

  if (!key) {
    return new Response('// BookableCRM: missing ?key= parameter', {
      headers: { ...corsHeaders, 'Content-Type': 'application/javascript' },
    })
  }

  // Look up tenant config
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data: tenantRow } = await admin
    .from('tenants')
    .select('settings')
    .eq('settings->>embed_key', key)
    .maybeSingle()

  if (!tenantRow) {
    return new Response('// BookableCRM: invalid embed key', {
      headers: { ...corsHeaders, 'Content-Type': 'application/javascript' },
    })
  }

  const settings     = (tenantRow.settings ?? {}) as Record<string, unknown>
  const widgetConfig = (settings.widget_config ?? {}) as Record<string, unknown>
  const fields       = (widgetConfig.fields ?? {}) as Record<string, boolean>

  const cfg = {
    title:           widgetConfig.title           ?? 'Get in touch',
    fields: {
      name:    fields.name    !== false,
      email:   true,
      phone:   fields.phone   === true,
      message: fields.message !== false,
    },
    title_font:      widgetConfig.title_font       ?? 'Inter',
    title_font_size: widgetConfig.title_font_size  ?? '20px',
    title_color:     widgetConfig.title_color      ?? '#0f172a',
    submit_label:    widgetConfig.submit_label    ?? 'Send enquiry',
    success_message: widgetConfig.success_message ?? "Thanks! We'll be in touch shortly.",
    button_color:    widgetConfig.button_color    ?? '#2563eb',
  }

  const js = `
(function(){
  var SUBMIT_URL = ${JSON.stringify(SUPABASE_URL + '/functions/v1/submit-enquiry')};
  var KEY = ${JSON.stringify(key)};
  var CFG = ${JSON.stringify(cfg)};

  // Find the script tag to inject next to
  var scripts = document.querySelectorAll('script[src*="widget-embed"]');
  var scriptEl = scripts[scripts.length - 1];
  var root = document.createElement('div');
  root.className = 'bcrm-form';
  scriptEl.parentNode.insertBefore(root, scriptEl);

  // Load Google Font if needed
  var systemFonts = ['Arial','Georgia','Helvetica','Times New Roman','Verdana','Trebuchet MS'];
  if (systemFonts.indexOf(CFG.title_font) === -1 && !document.querySelector('link[data-bcrm-font]')) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.setAttribute('data-bcrm-font', CFG.title_font);
    link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(CFG.title_font) + ':wght@400;600;700&display=swap';
    document.head.appendChild(link);
  }

  // Inject styles once
  if (!document.getElementById('bcrm-styles')) {
    var style = document.createElement('style');
    style.id = 'bcrm-styles';
    style.textContent = [
      '.bcrm-form{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:480px}',
      '.bcrm-form h3{margin:0 0 1rem;font-weight:600}',
      '.bcrm-form label{display:block;margin-bottom:.25rem;font-size:.875rem;font-weight:500;color:#475569}',
      '.bcrm-form input,.bcrm-form textarea{display:block;width:100%;padding:.5rem .75rem;margin-bottom:1rem;border:1px solid #cbd5e1;border-radius:.5rem;font-size:.875rem;font-family:inherit;box-sizing:border-box}',
      '.bcrm-form input:focus,.bcrm-form textarea:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,.25)}',
      '.bcrm-form textarea{resize:vertical;min-height:100px}',
      '.bcrm-form button[type="submit"]{display:inline-block;padding:.625rem 1.5rem;background:' + CFG.button_color + ';color:#fff;border:none;border-radius:.5rem;font-size:.875rem;font-weight:500;cursor:pointer;transition:opacity .15s}',
      '.bcrm-form button[type="submit"]:hover{opacity:.85}',
      '.bcrm-form button[type="submit"]:disabled{opacity:.5;cursor:not-allowed}',
      '.bcrm-form .bcrm-success{padding:1rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:.5rem;color:#166534;font-size:.875rem}',
      '.bcrm-form .bcrm-error{padding:.75rem;background:#fef2f2;border:1px solid #fecaca;border-radius:.5rem;color:#991b1b;font-size:.875rem;margin-bottom:1rem;display:none}',
    ].join('\\n');
    document.head.appendChild(style);
  }

  // Render
  var f = CFG.fields;
  var h = '';
  if (CFG.title) h += '<h3 style="font-family:' + CFG.title_font + ',sans-serif;font-size:' + CFG.title_font_size + ';color:' + CFG.title_color + '">' + esc(CFG.title) + '</h3>';
  h += '<form>';
  h += '<div class="bcrm-error"></div>';
  if (f.name)    h += '<label>Name</label><input name="name" type="text" required>';
  h += '<label>Email</label><input name="email" type="email" required>';
  if (f.phone)   h += '<label>Phone</label><input name="phone" type="tel">';
  if (f.message) h += '<label>Message</label><textarea name="message" required></textarea>';
  h += '<button type="submit">' + esc(CFG.submit_label) + '</button>';
  h += '</form>';
  root.innerHTML = h;

  var form = root.querySelector('form');
  var errEl = root.querySelector('.bcrm-error');
  var btn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Sending\\u2026';
    errEl.style.display = 'none';

    var body = { embed_key: KEY, email: field('email') };
    if (f.name)    body.name    = field('name');
    if (f.phone)   body.phone   = field('phone');
    if (f.message) body.message = field('message');

    fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d } }) })
    .then(function(res) {
      if (res.ok) {
        root.innerHTML = '<div class="bcrm-success">' + esc(CFG.success_message) + '</div>';
      } else {
        showErr(res.data.error || 'Something went wrong.');
      }
    })
    .catch(function() { showErr('Network error. Please try again.') });
  });

  function field(n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value : '' }
  function showErr(msg) { errEl.textContent = msg; errEl.style.display = 'block'; btn.disabled = false; btn.textContent = CFG.submit_label }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML }
})();
`

  return new Response(js, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
})
