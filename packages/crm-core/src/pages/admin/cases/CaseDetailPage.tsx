import { useState, useCallback, useEffect, type ReactNode } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, User, Calendar, Tag, CheckCircle2,
  Circle, Pencil, ClipboardList, MessageSquare,
  Activity as ActivityIcon, Save, CalendarPlus
} from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import { useCases } from '@/hooks/useCases'
import { usePipelineStages } from '@/hooks/usePipelineStages'
import { useCrmConfig } from '@/context/CrmConfigContext'
import { supabase } from '@/lib/supabase'
import { EnquiryPanel } from '@/components/crm/EnquiryPanel'
import { ActivityFeed } from '@/components/crm/ActivityFeed'
import { ScheduleMeetingModal } from '@/components/crm/ScheduleMeetingModal'
import { cn } from '@/lib/cn'
import type { Activity } from '@/types'

type NoteTab = 'enquiry' | 'meeting' | 'activity'

// ─── Case Notes tab ───────────────────────────────────────────────────────────
function CaseNotesTab({
  initialNotes,
  onSave,
}: {
  initialNotes: string | null
  onSave: (notes: string) => Promise<void>
}) {
  const [value, setValue]   = useState(initialNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const dirty = value !== (initialNotes ?? '')

  async function handleSave() {
    setSaving(true)
    await onSave(value)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        Notes carried over from the contact enquiry and first meeting. Add further case notes here as the engagement progresses.
      </p>
      <textarea
        value={value}
        onChange={e => { setValue(e.target.value); setSaved(false) }}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave() }}
        rows={12}
        placeholder="Case notes…"
        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Ctrl+Enter to save</p>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-colors',
            saved
              ? 'bg-green-600 text-white'
              : dirty
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-400 cursor-default'
          )}
        >
          <Save size={12} />
          {saved ? 'Saved' : saving ? 'Saving…' : 'Save notes'}
        </button>
      </div>
    </div>
  )
}

// ─── Activity tab (uses shared ActivityFeed) ──────────────────────────────────
function ActivityTab({ caseId, tenantId, activities, onActivityAdded }: {
  caseId: string; tenantId: string | null; activities: Activity[]; onActivityAdded: () => void
}) {
  return (
    <ActivityFeed
      tenantId={tenantId}
      caseId={caseId}
      activities={activities}
      onActivityAdded={onActivityAdded}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const tenantId = tenant?.id ?? null

  const { cases, loading, updateCase } = useCases(tenantId)
  const { stages } = usePipelineStages(tenantId)
  const { caseDetailSidebar } = useCrmConfig()

  const c = cases.find(x => x.id === id)

  const [tab, setTab]                   = useState<NoteTab>('enquiry')
  const [showMeeting, setShowMeeting]   = useState(false)
  const [activities, setActivities]     = useState<Activity[]>([])
  const [activitiesLoaded, setActivitiesLoaded] = useState(false)
  const [editingStage, setEditingStage] = useState(false)

  const loadActivities = useCallback(async () => {
    if (!id) return
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('case_id', id)
      .order('created_at', { ascending: false })
    setActivities((data as Activity[]) ?? [])
  }, [id])

  useEffect(() => {
    if (!id || activitiesLoaded) return
    setActivitiesLoaded(true)
    loadActivities()
  }, [id, activitiesLoaded, loadActivities])

  async function toggleClose() {
    if (!c) return
    await updateCase(c.id, {
      closed_at: c.closed_at ? null : new Date().toISOString(),
    })
  }

  async function changeStage(stageId: string) {
    if (!c) return
    await updateCase(c.id, { stage_id: stageId || null })
    setEditingStage(false)
  }

  async function handleSaveNotes(notes: string) {
    if (!c) return
    await updateCase(c.id, { notes: notes || null })
  }

  if (loading) {
    return <div className="p-8 text-slate-400 text-sm">Loading…</div>
  }

  if (!c) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Case not found.</p>
        <button onClick={() => navigate('/cases')} className="text-blue-600 text-sm mt-2">
          ← Back to Cases
        </button>
      </div>
    )
  }

  const isOpen = !c.closed_at
  const contactMeta = (c.contact?.metadata ?? {}) as Record<string, unknown>
  const hasEnquiryData = !!(
    contactMeta.grade || contactMeta.summary ||
    (Array.isArray(contactMeta.priorities) && (contactMeta.priorities as unknown[]).length > 0) ||
    (Array.isArray(contactMeta.answers) && (contactMeta.answers as unknown[]).length > 0)
  )

  const tabs: { id: NoteTab; label: string; icon: ReactNode; dot?: boolean }[] = [
    { id: 'enquiry',  label: 'Enquiry',       icon: <ClipboardList size={13} />, dot: hasEnquiryData },
    { id: 'meeting',  label: 'Case Notes',    icon: <MessageSquare size={13} />, dot: !!c.notes },
    { id: 'activity', label: 'Activity',      icon: <ActivityIcon  size={13} />, dot: activities.length > 0 },
  ]

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/cases')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Cases
      </button>

      <div className="grid grid-cols-3 gap-6">
        {/* Main column */}
        <div className="col-span-2 space-y-6">
          {/* Case header */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{c.title}</h1>
                {c.contact && (
                  <Link
                    to={`/contacts/${c.contact.id}`}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-1"
                  >
                    <User size={13} /> {c.contact.first_name} {c.contact.last_name}
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowMeeting(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <CalendarPlus size={13} /> Schedule meeting
              </button>
              <button
                onClick={toggleClose}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                  isOpen
                    ? 'border-slate-200 text-slate-600 hover:border-slate-300'
                    : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                )}
              >
                {isOpen
                  ? <><Circle size={13} /> Mark closed</>
                  : <><CheckCircle2 size={13} /> Reopen</>}
              </button>
              </div>
            </div>

            {/* Stage row */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <Tag size={13} className="text-slate-400 shrink-0" />
              {editingStage ? (
                <select
                  defaultValue={c.stage_id ?? ''}
                  onChange={e => changeStage(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onBlur={() => setEditingStage(false)}
                >
                  <option value="">No stage</option>
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={() => setEditingStage(true)}
                  className="flex items-center gap-1.5 group"
                >
                  {c.stage ? (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${c.stage.color}20`,
                        color: c.stage.color,
                      }}
                    >
                      {c.stage.name}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">No stage</span>
                  )}
                  <Pencil size={11} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Tabbed card — Enquiry / Case Notes / Activity */}
          <div className="bg-white rounded-xl border border-slate-200">
            {/* Tab bar */}
            <div className="flex border-b border-slate-200 px-2 pt-2">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors rounded-t-md',
                    tab === t.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50/60'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {t.icon}
                  {t.label}
                  {t.dot && (
                    <span className={cn(
                      'ml-0.5 w-1.5 h-1.5 rounded-full shrink-0',
                      tab === t.id ? 'bg-blue-500' : 'bg-slate-300'
                    )} />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {tab === 'enquiry' && (
                <EnquiryPanel metadata={contactMeta} />
              )}
              {tab === 'meeting' && (
                <CaseNotesTab
                  initialNotes={c.notes}
                  onSave={handleSaveNotes}
                />
              )}
              {tab === 'activity' && (
                <ActivityTab
                  caseId={id!}
                  tenantId={tenantId}
                  activities={activities}
                  onActivityAdded={loadActivities}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Calendar size={13} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-xs text-slate-400">Opened</dt>
                  <dd className="text-slate-700 font-medium">
                    {new Date(c.opened_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </dd>
                </div>
              </div>

              {c.closed_at && (
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-400">Closed</dt>
                    <dd className="text-slate-700 font-medium">
                      {new Date(c.closed_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </dd>
                  </div>
                </div>
              )}

              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Status</dt>
                <dd>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    isOpen ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  )}>
                    {isOpen ? 'Open' : 'Closed'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {c.contact && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Contact</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {c.contact.first_name[0]}{c.contact.last_name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {c.contact.first_name} {c.contact.last_name}
                  </p>
                  {c.contact.email && (
                    <a href={`mailto:${c.contact.email}`} className="text-xs text-blue-600 hover:underline">
                      {c.contact.email}
                    </a>
                  )}
                </div>
              </div>
              <Link
                to={`/contacts/${c.contact.id}`}
                className="block w-full text-center text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg py-1.5 transition-colors"
              >
                View contact →
              </Link>
            </div>
          )}

          {/* App-specific sidebar cards (e.g. Fact Find, documents) */}
          {caseDetailSidebar?.(id!, c.contact?.id)}
        </div>
      </div>

      {/* Schedule meeting modal */}
      {showMeeting && tenantId && (
        <ScheduleMeetingModal
          tenantId={tenantId}
          caseId={id}
          contactId={c.contact?.id}
          attendeeEmail={c.contact?.email}
          attendeeName={c.contact ? `${c.contact.first_name} ${c.contact.last_name}` : undefined}
          defaultTitle={`Meeting — ${c.title}`}
          onClose={() => setShowMeeting(false)}
          onScheduled={() => { loadActivities(); setTab('activity') }}
        />
      )}
    </div>
  )
}
