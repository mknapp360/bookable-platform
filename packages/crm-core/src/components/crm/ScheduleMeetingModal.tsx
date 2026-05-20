import { useState } from 'react'
import { X, Calendar, Clock, ExternalLink, Video, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { cn } from '@/lib/cn'

interface ScheduleMeetingModalProps {
  tenantId: string
  contactId?: string
  caseId?: string
  attendeeEmail?: string | null
  attendeeName?: string
  defaultTitle?: string
  onClose: () => void
  onScheduled?: (htmlLink: string, meetLink: string | null) => void
}

const DURATIONS = [
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '90 min', minutes: 90 },
]

function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function addMinutes(datetimeLocal: string, minutes: number): string {
  const d = new Date(datetimeLocal)
  d.setMinutes(d.getMinutes() + minutes)
  return toLocalDatetimeString(d)
}

export function ScheduleMeetingModal({
  tenantId,
  contactId,
  caseId,
  attendeeEmail,
  attendeeName,
  defaultTitle = 'Initial consultation',
  onClose,
  onScheduled,
}: ScheduleMeetingModalProps) {
  // Default to tomorrow at 10:00
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const [title, setTitle]         = useState(defaultTitle)
  const [startDt, setStartDt]     = useState(toLocalDatetimeString(tomorrow))
  const [duration, setDuration]   = useState(60)
  const [location, setLocation]   = useState('')
  const [addMeet, setAddMeet]     = useState(false)
  const [description, setDesc]    = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [result, setResult]       = useState<{ htmlLink: string; meetLink: string | null } | null>(null)

  const endDt = addMinutes(startDt, duration)

  async function handleSchedule() {
    if (!title.trim()) { setError('Please add a meeting title.'); return }
    setSaving(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Not authenticated.'); setSaving(false); return }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

    const res = await fetch(`${supabaseUrl}/functions/v1/create-calendar-event`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        tenant_id:      tenantId,
        title:          title.trim(),
        description:    description.trim() || undefined,
        location:       location.trim() || undefined,
        add_meet:       addMeet,
        start_datetime: new Date(startDt).toISOString(),
        end_datetime:   new Date(endDt).toISOString(),
        attendee_email: attendeeEmail ?? undefined,
        attendee_name:  attendeeName  ?? undefined,
      }),
    })

    const json = await res.json()
    if (!res.ok || json.error) {
      setError(json.error ?? 'Failed to create calendar event.')
      setSaving(false)
      return
    }

    // Log a meeting activity with calendar metadata for future cancellation
    const activityPayload: Database['public']['Tables']['activities']['Insert'] = {
      tenant_id: tenantId,
      type:      'meeting',
      body:      `Meeting scheduled: "${title}" on ${new Date(startDt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}${location.trim() ? ` at ${location.trim()}` : ''}${json.meet_link ? ` — Meet: ${json.meet_link}` : ''}`,
      metadata: {
        event_id:       json.event_id,
        html_link:      json.html_link,
        meet_link:      json.meet_link ?? null,
        cancelled:      false,
        title:          title.trim(),
        start_datetime: new Date(startDt).toISOString(),
        end_datetime:   new Date(endDt).toISOString(),
        location:       location.trim() || null,
      },
      ...(contactId && { contact_id: contactId }),
      ...(caseId && { case_id: caseId }),
    }
    await supabase.from('activities').insert(activityPayload)

    setResult({ htmlLink: json.html_link, meetLink: json.meet_link ?? null })
    setSaving(false)
    onScheduled?.(json.html_link, json.meet_link ?? null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">Schedule a meeting</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {result ? (
          /* ── Success state ── */
          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center text-center gap-3 py-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Meeting scheduled!</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Invite sent to {attendeeEmail ?? 'attendee'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={result.htmlLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <ExternalLink size={14} /> Open in Google Calendar
              </a>
              {result.meetLink && (
                <a
                  href={result.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-sm font-medium rounded-xl transition-colors"
                >
                  <Video size={14} /> Join Google Meet
                </a>
              )}
              <button
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-700 py-1"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* ── Form state ── */
          <div className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Meeting title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Attendee */}
            {attendeeEmail && (
              <div className="flex items-center gap-2 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {(attendeeName ?? attendeeEmail)[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  {attendeeName && <p className="text-xs font-medium text-slate-800 truncate">{attendeeName}</p>}
                  <p className="text-xs text-slate-500 truncate">{attendeeEmail}</p>
                </div>
              </div>
            )}

            {/* Date + time */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                <Clock size={11} className="inline mr-1" />Date & start time
              </label>
              <input
                type="datetime-local"
                value={startDt}
                onChange={e => setStartDt(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Duration</label>
              <div className="flex gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d.minutes}
                    onClick={() => setDuration(d.minutes)}
                    className={cn(
                      'flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                      duration === d.minutes
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Location (optional)</label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. 12 High Street, London or Zoom link…"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Google Meet toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setAddMeet(v => !v)}
                className={cn(
                  'relative w-9 h-5 rounded-full transition-colors shrink-0',
                  addMeet ? 'bg-blue-600' : 'bg-slate-200'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  addMeet ? 'translate-x-4' : 'translate-x-0.5'
                )} />
              </div>
              <span className="text-xs font-medium text-slate-700">Add Google Meet link</span>
            </label>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes / agenda (optional)</label>
              <textarea
                value={description}
                onChange={e => setDesc(e.target.value)}
                rows={3}
                placeholder="What will you discuss?"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={saving}
                className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Calendar size={14} />
                {saving ? 'Scheduling…' : 'Schedule'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
