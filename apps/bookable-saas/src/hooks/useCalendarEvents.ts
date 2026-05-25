import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenantIntegration } from '@/hooks/useTenantIntegration'
import type { Activity } from '@/types'

// ─── Unified calendar event type ─────────────────────────────────────────────

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  start: Date
  end: Date
  allDay: boolean
  location: string | null
  meetLink: string | null
  htmlLink: string | null
  cancelled: boolean
  contactId: string | null
  source: 'local' | 'google'
  /** Google-only: attendees list */
  attendees?: { email: string; name: string | null; status: string | null }[]
}

// ─── Parse local meeting activities into CalendarEvents ──────────────────────

function parseLocalActivities(activities: Activity[]): CalendarEvent[] {
  return activities
    .filter(a => a.type === 'meeting' && a.metadata?.start_datetime)
    .map(a => {
      const m = a.metadata!
      const start = new Date(m.start_datetime as string)
      const end = m.end_datetime
        ? new Date(m.end_datetime as string)
        : new Date(start.getTime() + 60 * 60 * 1000)
      return {
        id: a.id,
        title: (m.title as string) ?? 'Meeting',
        description: a.body,
        start,
        end,
        allDay: false,
        location: (m.location as string) ?? null,
        meetLink: (m.meet_link as string) ?? null,
        htmlLink: (m.html_link as string) ?? null,
        cancelled: !!(m.cancelled),
        contactId: a.contact_id,
        source: 'local' as const,
      }
    })
}

// ─── Parse Google Calendar API response items ────────────────────────────────

interface GoogleEventRaw {
  id: string
  title: string
  description: string | null
  start: string
  end: string | null
  all_day: boolean
  location: string | null
  meet_link: string | null
  html_link: string | null
  status: string
  attendees: { email: string; name: string | null; status: string | null; self: boolean }[]
}

function parseGoogleEvents(items: GoogleEventRaw[], localGoogleIds: Set<string>): CalendarEvent[] {
  return items
    .filter(e => !localGoogleIds.has(e.id)) // dedupe — prefer local if we created it
    .map(e => ({
      id: `google-${e.id}`,
      title: e.title,
      description: e.description,
      start: new Date(e.start),
      end: e.end ? new Date(e.end) : new Date(new Date(e.start).getTime() + 60 * 60 * 1000),
      allDay: e.all_day,
      location: e.location,
      meetLink: e.meet_link,
      htmlLink: e.html_link,
      cancelled: e.status === 'cancelled',
      contactId: null,
      source: 'google' as const,
      attendees: e.attendees?.filter(a => !a.self),
    }))
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCalendarEvents(tenantId: string | null) {
  const [events, setEvents]             = useState<CalendarEvent[]>([])
  const [loading, setLoading]           = useState(true)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [googleEmail, setGoogleEmail]   = useState<string | null>(null)
  const [googleError, setGoogleError]   = useState<string | null>(null)

  // Check integration status directly (works even if edge function isn't deployed)
  const { integration, loading: integrationLoading } = useTenantIntegration(tenantId, 'google_calendar')

  const fetch = useCallback(async () => {
    if (!tenantId) { setEvents([]); setLoading(false); return }
    setLoading(true)

    // 1. Fetch local meeting activities
    const { data: activityData } = await supabase
      .from('activities')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('type', 'meeting')
      .order('created_at', { ascending: false })
      .limit(500)

    const localActivities = (activityData ?? []) as Activity[]
    const localEvents = parseLocalActivities(localActivities)

    // Collect Google event IDs from local activities (to dedupe)
    const localGoogleIds = new Set<string>()
    localActivities.forEach(a => {
      const eventId = a.metadata?.event_id as string | undefined
      if (eventId) localGoogleIds.add(eventId)
    })

    // 2. Try fetching from Google Calendar
    let googleEvents: CalendarEvent[] = []
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
        const res = await window.fetch(`${supabaseUrl}/functions/v1/list-calendar-events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ tenant_id: tenantId }),
        })

        if (res.ok) {
          const json = await res.json()
          setGoogleConnected(json.connected ?? false)
          setGoogleEmail(json.email ?? null)

          if (json.error) {
            setGoogleError(json.error)
          } else {
            setGoogleError(null)
          }

          if (json.events && Array.isArray(json.events)) {
            googleEvents = parseGoogleEvents(json.events as GoogleEventRaw[], localGoogleIds)
          }
        }
      }
    } catch {
      // Edge function not deployed or network error — fall back to local only
      // Don't override googleConnected — the integration hook knows the real status
    }

    // 3. Merge and sort
    const merged = [...localEvents, ...googleEvents].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    )
    setEvents(merged)
    setLoading(false)
  }, [tenantId])

  useEffect(() => { fetch() }, [fetch])

  // Integration hook is the source of truth for connected status
  const isConnected = googleConnected || !!integration
  const email = googleEmail || integration?.connected_email || null

  return {
    events,
    loading: loading || integrationLoading,
    refetch: fetch,
    googleConnected: isConnected,
    googleEmail: email,
    googleError,
  }
}
