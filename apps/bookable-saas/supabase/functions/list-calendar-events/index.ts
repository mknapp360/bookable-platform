import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const GOOGLE_CLIENT_ID     = Deno.env.get('GOOGLE_CLIENT_ID')!;
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY    = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE_KEY     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

function jsonRes(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

async function refreshToken(refresh_token: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token,
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type:    'refresh_token',
    }),
  });
  return res.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  try {
    const body = await req.json();
    const { tenant_id, time_min, time_max } = body;

    if (!tenant_id) return jsonRes({ error: 'tenant_id required' }, 400);

    // Verify caller is a member of this tenant
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonRes({ error: 'Unauthorised' }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: membership } = await userClient
      .from('tenant_users')
      .select('role')
      .eq('tenant_id', tenant_id)
      .maybeSingle();

    if (!membership) return jsonRes({ error: 'Forbidden' }, 403);

    // Look up integration with service role (has tokens)
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: integration, error: intErr } = await supabase
      .from('tenant_integrations')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('provider', 'google_calendar')
      .single();

    if (intErr || !integration) {
      return jsonRes({ events: [], connected: false });
    }

    // Get or refresh access token (same pattern as create-calendar-event)
    let accessToken = integration.access_token;

    const expiresAt = new Date(integration.token_expires_at).getTime();
    if (!accessToken || expiresAt <= Date.now() + 60_000) {
      if (!integration.refresh_token) {
        return jsonRes({ events: [], connected: true, error: 'Token expired and no refresh token. Please reconnect Google Calendar.' });
      }
      const refreshed = await refreshToken(integration.refresh_token);
      if (!refreshed.access_token) {
        return jsonRes({ events: [], connected: true, error: 'Failed to refresh Google token. Please reconnect.' });
      }
      accessToken = refreshed.access_token;
      await supabase.from('tenant_integrations').update({
        access_token:     refreshed.access_token,
        token_expires_at: new Date(Date.now() + (refreshed.expires_in ?? 3600) * 1000).toISOString(),
        updated_at:       new Date().toISOString(),
      }).eq('tenant_id', tenant_id).eq('provider', 'google_calendar');
    }

    // Fetch events from Google Calendar API
    const calendarId = integration.calendar_id ?? 'primary';
    const now = new Date();

    const rangeMin = time_min ?? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toISOString();
    const rangeMax = time_max ?? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 60).toISOString();

    const params = new URLSearchParams({
      timeMin:      rangeMin,
      timeMax:      rangeMax,
      singleEvents: 'true',
      orderBy:      'startTime',
      maxResults:   '500',
    });

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!calRes.ok) {
      const detail = await calRes.text();
      console.error('Google Calendar API error:', calRes.status, detail);
      return jsonRes({ events: [], connected: true, error: `Google Calendar API error (${calRes.status}): ${detail}` });
    }

    const calData = await calRes.json();

    // Normalize events
    const events = (calData.items ?? [])
      .filter((e: any) => e.start && (e.start.dateTime || e.start.date))
      .map((e: any) => ({
        id:          e.id,
        title:       e.summary ?? '(No title)',
        description: e.description ?? null,
        start:       e.start.dateTime ?? e.start.date,
        end:         e.end?.dateTime ?? e.end?.date ?? null,
        all_day:     !e.start.dateTime,
        location:    e.location ?? null,
        meet_link:   e.hangoutLink ?? null,
        html_link:   e.htmlLink ?? null,
        status:      e.status ?? 'confirmed',
        attendees:   (e.attendees ?? []).map((a: any) => ({
          email:  a.email,
          name:   a.displayName ?? null,
          status: a.responseStatus ?? null,
          self:   a.self ?? false,
        })),
        source: 'google',
      }));

    return jsonRes({ events, connected: true, calendar_id: calendarId, email: integration.connected_email });

  } catch (err) {
    console.error('list-calendar-events error:', err);
    return jsonRes({ error: 'Internal server error' }, 500);
  }
});
