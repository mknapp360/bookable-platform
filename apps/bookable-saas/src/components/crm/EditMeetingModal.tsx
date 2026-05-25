import { useState } from 'react'
import { X, Calendar, Clock, AlertCircle, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import type { Activity } from '@/types'

interface EditMeetingModalProps {
  tenantId:  string
  activity:  Activity
  onClose:   () => void
  onUpdated: () => void
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

function guessDuration(startIso: string, endIso: string): number {
  const diff = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000
  const known = DURATIONS.map(d => d.minutes)
  return known.includes(diff) ? diff : 60
}

export function EditMeetingModal({ tenantId, activity, onClose, onUpdated }: EditMeetingModalProps) {
  const meta = activity.metadata ?? {}

  // Pre-fill from stored metadata; fall back to sensible defaults
  const initialStart = meta.start_datetime
    ? toLocalDatetimeString(new Date(meta.start_datetime))
    : toLocalDatetimeString((() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return d })())

  const initialDuration = (meta.start_datetime && meta.end_datetime)
    ? guessDuration(meta.start_datetime, meta.end_datetime)
    : 60

  const [title, setTitle]       = useState(meta.title ?? '')
  const [startDt, setStartDt]   = useState(initialStart)
  const [duration, setDuration] = useState(initialDuration)
  const [location, setLocation] = useState(meta.location ?? '')
  const [addMeet, setAddMeet]   = useState(!!meta.meet_link)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const endDt = addMinutes(startDt, duration)

  async function handleUpdate() {
    if (!title.trim()) { setError('Please add a meeting title.'); return }
    setSaving(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Not authenticated.'); setSaving(false); return }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

    const res = await fetch(`${supabaseUrl}/functions/v1/update-calendar-event`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        tenant_id:           tenantId,
        event_id:            meta.event_id,
        activity_id:         activity.id,
        title:               title.trim(),
        start_datetime:      new Date(startDt).toISOString(),
        end_datetime:        new Date(endDt).toISOString(),
        location:            location.trim() || null,
        add_meet:            addMeet,
        existing_meet_link:  meta.meet_link ?? null,
      }),
    })

    const json = await res.json()
    if (!res.ok || json.error) {
      setError(json.error ?? 'Failed to update meeting.')
      setSaving(false)
      return
    }

    setSaving(false)
    onUpdated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Pencil size={15} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">Edit meeting</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>

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

          {/* Date + time */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              <Clock size={11} className="inline mr-1" />Date &amp; start time
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
            <span className="text-xs font-medium text-slate-700">Google Meet link</span>
            {!addMeet && meta.meet_link && (
              <span className="text-xs text-slate-400">(will be removed from the invite)</span>
            )}
          </label>

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
              onClick={handleUpdate}
              disabled={saving}
              className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Calendar size={14} />
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
