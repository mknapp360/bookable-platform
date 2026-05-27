import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!;
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'openid',
  'email',
].join(' ');

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'content-type',
      },
    });
  }

  const url = new URL(req.url);
  const tenantId    = url.searchParams.get('tenant_id');
  const redirectBack = url.searchParams.get('redirect_back');

  if (!tenantId || !redirectBack) {
    return new Response('Missing tenant_id or redirect_back', { status: 400 });
  }

  const state = btoa(JSON.stringify({ tenant_id: tenantId, redirect_back: redirectBack }));

  const redirectUri = `${SUPABASE_URL}/functions/v1/google-oauth-callback`;

  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         SCOPES,
    access_type:   'offline',
    prompt:        'consent',
    state,
  });

  return new Response(null, {
    status: 302,
    headers: { Location: `https://accounts.google.com/o/oauth2/v2/auth?${params}` },
  });
});
