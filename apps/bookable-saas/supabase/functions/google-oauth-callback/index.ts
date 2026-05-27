import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const GOOGLE_CLIENT_ID     = Deno.env.get('GOOGLE_CLIENT_ID')!;
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'content-type',
      },
    });
  }

  const url  = new URL(req.url);
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');

  // Decode state to recover tenant_id and redirect_back
  let tenantId: string;
  let redirectBack: string;
  try {
    const state = JSON.parse(atob(stateParam ?? ''));
    tenantId    = state.tenant_id;
    redirectBack = state.redirect_back;
  } catch {
    return new Response('Invalid state parameter', { status: 400 });
  }

  if (!code) {
    // User denied consent or something went wrong
    return new Response(null, {
      status: 302,
      headers: { Location: `${redirectBack}${redirectBack.includes('?') ? '&' : '?'}google_error=1` },
    });
  }

  const redirectUri = `${SUPABASE_URL}/functions/v1/google-oauth-callback`;

  try {
    // Exchange auth code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      console.error('Token exchange failed:', tokens);
      return new Response(null, {
        status: 302,
        headers: { Location: `${redirectBack}${redirectBack.includes('?') ? '&' : '?'}google_error=1` },
      });
    }

    // Fetch the user's email from Google userinfo
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userinfo = await userinfoRes.json();
    const connectedEmail = userinfo.email ?? null;

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString();

    // Upsert integration record
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    await supabase
      .from('tenant_integrations')
      .upsert(
        {
          tenant_id:        tenantId,
          provider:         'google_calendar',
          access_token:     tokens.access_token,
          refresh_token:    tokens.refresh_token,
          token_expires_at: expiresAt,
          connected_email:  connectedEmail,
          calendar_id:      'primary',
          updated_at:       new Date().toISOString(),
        },
        { onConflict: 'tenant_id,provider' }
      );

    // Redirect back to the app
    return new Response(null, {
      status: 302,
      headers: { Location: `${redirectBack}${redirectBack.includes('?') ? '&' : '?'}google_connected=1` },
    });

  } catch (err) {
    console.error('google-oauth-callback error:', err);
    return new Response(null, {
      status: 302,
      headers: { Location: `${redirectBack}${redirectBack.includes('?') ? '&' : '?'}google_error=1` },
    });
  }
});
