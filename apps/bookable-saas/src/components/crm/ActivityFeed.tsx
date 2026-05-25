import { useState } from 'react'
import { Send, ExternalLink, Video, X, AlertCircle, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { cn } from '@/lib/cn'
import { EditMeetingModal } from '@/components/crm/EditMeetingModal'
import type { Activity, ActivityType } from '@/types'

const activityIcons: Record<ActivityType, string> = {
  note:              '📝',
  call:              '📞',
  email:             '✉️',
  meeting:           '🤝',
  status_change:     '🔄',
  document_uploaded: '📎',
  case_created:      '📁',
  contact_created:   '👤',
}

interface ActivityFeedProps {
  tenantId:        string | null
  contactId?:      string
  caseId?:         string
  activities:      Activity[]
  onActivityAdded: () => void
}

export function ActivityFeed({
  tenantId,
  contactId,
  caseId,
  activities,
  onActivityAdded,
}: ActivityFeedProps) {
  const [noteBody, setNoteBody]           = useState('')
  const [savingNote, setSavingNote]       = useState(false)
  const [cancellingId, setCancellingId]   = useState<string | null>(null)
  const [cancelError, setCancelError]     = useState<string | null>(null)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  async function submitNote() {
    if (!noteBody.trim() || !tenantId) return
    setSavingNote(true)
    const payload: Database['public']['Tables']['activities']['Insert'] = {
      tenant_id: tenantId,
      type: 'note',
      body: noteBody.trim(),
      ...(contactId && { contact_id: contactId }),
      ...(caseId && { case_id: caseId }),
    }
    await supabase.from('activities').insert(payload)
    setNoteBody('')
    setSavingNote(false)
    onActivityAdded()
  }

  async function cancelMeeting(activity: Activity) {
    if (!tenantId || !activity.metadata?.event_id) return
    setCancellingId(activity.id)
    setCancelError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setCancelError('Not authenticated'); setCancellingId(null); return }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
    const res = await fetch(`${supabaseUrl}/functions/v1/cancel-calendar-event`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        tenant_id:   tenantId,
        event_id:    activity.metadata.event_id,
        activity_id: activity.id,
      }),
    })

    const json = await res.json()
    if (!res.ok || json.error) {
      setCancelError(json.error ?? 'Failed to cancel meeting')
      setCancellingId(null)
      return
    }

    setCancellingId(null)
    onActivityAdded()
  }

  return (
    <div>
      {/* Add note */}
      <div className="flex gap-3 mb-5">
        <textarea
          value={noteBody}
          onChange={e => setNoteBody(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitNote() }}
          rows={2}
          placeholder="Add a note… (Ctrl+Enter to save)"
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={submitNote}
          disabled={savingNote || !noteBody.trim()}
          className="self-end p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition-colors"
        >
          <Send size={14} />
        </button>
      </div>

      {/* Cancel error */}
      {cancelError && (
        <div className="flex items-center gap-2 mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          <AlertCircle size={13} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-700 flex-1">{cancelError}</p>
          <button onClick={() => setCancelError(null)} className="text-red-400 hover:text-red-600">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Feed */}
      {activities.length === 0 ? (
        <p className="text-xs text-slate-400">No activity yet.</p>
      ) : (
        <div className="space-y-3">
          {activities.map(a => {
            const isMeeting    = a.type === 'meeting'
            const isCancelled  = a.metadata?.cancelled === true
            const hasEventId   = !!a.metadata?.event_id
            const isCancelling = cancellingId === a.id

            return (
              <div key={a.id} className={cn('flex gap-3', isCancelled && 'opacity-50')}>
                <span className="text-base leading-none mt-0.5 shrink-0">
                  {activityIcons[a.type] ?? '•'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm text-slate-700', isCancelled && 'line-through')}>
                    {a.body}
                  </p>
                  {isCancelled && (
                    <p className="text-xs text-red-500 mt-0.5 font-medium">Cancelled</p>
                  )}

                  {/* Meeting action links */}
                  {isMeeting && !isCancelled && (
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {a.metadata?.html_link && (
                        <a
                          href={a.metadata.html_link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <ExternalLink size={11} /> View in Calendar
                        </a>
                      )}
                      {a.metadata?.meet_link && (
                        <a
                          href={a.metadata.meet_link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-green-600 hover:underline"
                        >
                          <Video size={11} /> Join Meet
                        </a>
                      )}
                      {hasEventId && (
                        <button
                          onClick={() => setEditingActivity(a)}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <Pencil size={11} /> Edit
                        </button>
                      )}
                      {hasEventId && (
                        <button
                          onClick={() => cancelMeeting(a)}
                          disabled={isCancelling}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                        >
                          <X size={11} />
                          {isCancelling ? 'Cancelling…' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(a.created_at).toLocaleString('en-GB', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit meeting modal */}
      {editingActivity && tenantId && (
        <EditMeetingModal
          tenantId={tenantId}
          activity={editingActivity}
          onClose={() => setEditingActivity(null)}
          onUpdated={() => { setEditingActivity(null); onActivityAdded() }}
        />
      )}
    </div>
  )
}
