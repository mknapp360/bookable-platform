import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Mail, Phone, Pencil,
  Tag, FolderOpen, CheckCircle2, Sparkles,
  ClipboardList, MessageSquare, Activity as ActivityIcon, Save, CalendarPlus,
  Send, X, Copy, Check as CheckIcon, AlertTriangle
} from 'lucide-react'
import { EnquiryPanel } from '@/components/crm/EnquiryPanel'
import { ActivityFeed } from '@/components/crm/ActivityFeed'
import { EmailThread } from '@/components/crm/EmailThread'
import { ScheduleMeetingModal } from '@/components/crm/ScheduleMeetingModal'
import { useTenant } from '@/hooks/useTenant'
import { useContacts } from '@/hooks/useContacts'
import { usePipelineStages } from '@/hooks/usePipelineStages'
import { useTags, useContactTags } from '@/hooks/useTags'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import type { Activity, Case, Contact } from '@/types'

// Case conversion stage is now read from tenant.case_conversion_stage_id

type NoteTab = 'enquiry' | 'meeting' | 'activity' | 'emails'

// ─── Enquiry tab (uses shared EnquiryPanel) ───────────────────────────────────
function EnquiryTab({ metadata }: { metadata: Record<string, unknown> }) {
  return <EnquiryPanel metadata={metadata} />
}

// ─── Meeting Notes tab ────────────────────────────────────────────────────────
function MeetingNotesTab({
  contactId: _contactId,
  initialNotes,
  onSave,
}: {
  contactId: string
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
        Record notes from your initial call or meeting. These carry over to the case file when the contact is qualified.
      </p>
      <textarea
        value={value}
        onChange={e => { setValue(e.target.value); setSaved(false) }}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave() }}
        rows={10}
        placeholder="e.g. Spoke with Katie on 28 Apr — she is looking to start investing within 3 months. Currently has £40k to invest. Risk appetite: moderate. Referred by her accountant…"
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
function ActivityTab({ contactId, tenantId, activities, onActivityAdded }: {
  contactId: string; tenantId: string | null; activities: Activity[]; onActivityAdded: () => void
}) {
  return (
    <ActivityFeed
      tenantId={tenantId}
      contactId={contactId}
      activities={activities}
      onActivityAdded={onActivityAdded}
    />
  )
}

// ─── Nice-to-meet-you email modal ─────────────────────────────────────────────
function interpolate(text: string, contact: Contact): string {
  return text
    .replace(/\{\{first_name\}\}/g, contact.first_name)
    .replace(/\{\{last_name\}\}/g, contact.last_name)
    .replace(/\{\{full_name\}\}/g, `${contact.first_name} ${contact.last_name}`)
}

function NiceToMeetYouModal({
  tenantId,
  contact,
  onClose,
  onSent,
}: {
  tenantId: string
  contact: Contact
  onClose: () => void
  onSent: () => void
}) {
  const { tenant } = useTenant()
  const [copied,  setCopied]  = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sent,    setSent]    = useState(false)

  // Read template straight from context — no direct Supabase query needed
  const s = (tenant?.settings ?? {}) as Record<string, unknown>
  const tmpl = ((s.email_templates as Record<string, unknown> | undefined)
    ?.nice_to_meet_you) as { subject?: string; body?: string } | undefined
  const noTemplate = !tmpl?.subject && !tmpl?.body
  const subject = tmpl?.subject ? interpolate(tmpl.subject, contact) : ''
  const body    = tmpl?.body    ? interpolate(tmpl.body,    contact) : ''

  async function handleSend() {
    setSending(true)
    setSendError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({
          tenant_id:  tenantId,
          contact_id: contact.id,
          to_email:   contact.email,
          to_name:    `${contact.first_name} ${contact.last_name}`,
          subject,
          body,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setSendError(json.error ?? 'Something went wrong')
        setSending(false)
        return
      }
      setSent(true)
      onSent()
      setTimeout(onClose, 1500)
    } catch {
      setSendError('Network error — please try again')
      setSending(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Send size={16} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">Nice to meet you</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {noTemplate ? (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4">
              <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">No template saved yet</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Go to <strong>Settings → Email Formats</strong> to write your "nice to meet you" email template.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* To */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">To</p>
                <p className="text-sm text-slate-800">
                  {contact.first_name} {contact.last_name}
                  {contact.email && <span className="text-slate-400"> &lt;{contact.email}&gt;</span>}
                </p>
              </div>

              {/* Subject */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Subject</p>
                <p className="text-sm text-slate-800 font-medium">{subject}</p>
              </div>

              {/* Body */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Body</p>
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
                  {body}
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!noTemplate && (
          <div className="px-6 py-4 border-t border-slate-100 space-y-3">
            {sendError && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertTriangle size={13} className="shrink-0" />
                {sendError}
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                {copied ? <CheckIcon size={12} className="text-green-600" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy body'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || sent || !contact.email}
                  title={!contact.email ? 'No email address for this contact' : undefined}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-colors',
                    sent
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white'
                  )}
                >
                  <Send size={12} />
                  {sent ? 'Sent!' : sending ? 'Sending…' : 'Send email'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const tenantId = tenant?.id ?? null

  const { contacts, loading, updateContact, updatePipelineStage } = useContacts(tenantId)
  const { stages } = usePipelineStages(tenantId)
  const { tags: allTags } = useTags(tenantId)
  const { tagIds, linkTag, unlinkTag } = useContactTags(id ?? null)
  const [showTagPicker, setShowTagPicker] = useState(false)

  const contact = contacts.find(c => c.id === id)

  const [tab, setTab]                   = useState<NoteTab>('enquiry')
  const [showMeeting, setShowMeeting]   = useState(false)
  const [showNiceToMeetYou, setShowNiceToMeetYou] = useState(false)
  const [activities, setActivities]     = useState<Activity[]>([])
  const [activitiesLoaded, setActivitiesLoaded] = useState(false)
  const [editingStage, setEditingStage] = useState(false)
  const [editingStatus, setEditingStatus] = useState(false)
  const [autoCaseNotice, setAutoCaseNotice] = useState<Case | null>(null)
  const [stageSaving, setStageSaving]   = useState(false)

  const loadActivities = useCallback(async () => {
    if (!id) return
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('contact_id', id)
      .order('created_at', { ascending: false })
    setActivities((data as Activity[]) ?? [])
  }, [id])

  useEffect(() => {
    if (!id || activitiesLoaded) return
    setActivitiesLoaded(true)
    loadActivities()
  }, [id, activitiesLoaded, loadActivities])

  async function handleSaveMeetingNotes(notes: string) {
    if (!id) return
    await updateContact(id, { notes: notes || null })
  }

  // Build a carry-over string from enquiry + meeting notes for the case
  function buildCaseNotes(meetingNotes: string | null): string {
    const meta = (contact?.metadata ?? {}) as Record<string, unknown>
    const parts: string[] = []

    const summary = meta.summary as string | undefined
    if (summary) {
      parts.push(`## Enquiry Summary\n${summary}`)
    }

    const priorities = meta.priorities as unknown[] | undefined
    if (Array.isArray(priorities) && priorities.length > 0) {
      const list = priorities.map(p => `- ${typeof p === 'string' ? p : JSON.stringify(p)}`).join('\n')
      parts.push(`## Priorities\n${list}`)
    }

    if (meetingNotes?.trim()) {
      parts.push(`## Meeting Notes\n${meetingNotes.trim()}`)
    }

    return parts.join('\n\n')
  }

  async function handleStageChange(stageId: string) {
    if (!contact || !tenantId || !id) return
    setStageSaving(true)
    setEditingStage(false)

    await updatePipelineStage(id, stageId || null)

    const selectedStage = stages.find(s => s.id === stageId)

    if (selectedStage) {
      await supabase.from('activities').insert({
        tenant_id: tenantId,
        contact_id: id,
        type: 'status_change',
        body: `Pipeline stage changed to "${selectedStage.name}"`,
      })
    }

    const conversionStageId = tenant?.case_conversion_stage_id ?? null
    if (conversionStageId && stageId === conversionStageId) {
      const { data: existingCases } = await supabase
        .from('cases')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('contact_id', id)
        .is('closed_at', null)
        .limit(1)

      if (!existingCases || existingCases.length === 0) {
        const caseNotes = buildCaseNotes(contact.notes)

        const { data: newCase } = await supabase
          .from('cases')
          .insert({
            tenant_id: tenantId,
            contact_id: id,
            title: `${contact.first_name} ${contact.last_name} — Onboarding`,
            stage_id: stageId,
            notes: caseNotes || null,
            metadata: {},
          })
          .select()
          .single()

        if (newCase) {
          setAutoCaseNotice(newCase as Case)
          await updateContact(id, { status: 'active' })
          await supabase.from('activities').insert({
            tenant_id: tenantId,
            contact_id: id,
            type: 'case_created',
            body: `Case automatically created: "${contact.first_name} ${contact.last_name} — Onboarding"`,
          })
        }
      }
    }

    await loadActivities()
    setStageSaving(false)
  }

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading…</div>

  if (!contact) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Contact not found.</p>
        <button onClick={() => navigate('/contacts')} className="text-blue-600 text-sm mt-2">← Back</button>
      </div>
    )
  }

  const currentStage   = contact.pipeline_stage
  const statusOptions  = ['lead', 'active', 'inactive', 'closed'] as const
  const meta           = (contact.metadata ?? {}) as Record<string, unknown>
  const hasEnquiryData = !!(meta.summary || meta.grade ||
    (Array.isArray(meta.priorities) && (meta.priorities as unknown[]).length > 0) ||
    (Array.isArray(meta.answers) && (meta.answers as unknown[]).length > 0))

  const tabs: { id: NoteTab; label: string; icon: ReactNode; badge?: number }[] = [
    {
      id: 'enquiry',
      label: 'Enquiry',
      icon: <ClipboardList size={13} />,
      badge: hasEnquiryData ? 1 : undefined,
    },
    {
      id: 'meeting',
      label: 'Meeting Notes',
      icon: <MessageSquare size={13} />,
      badge: contact.notes ? 1 : undefined,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <ActivityIcon size={13} />,
      badge: activities.length || undefined,
    },
    {
      id: 'emails',
      label: 'Emails',
      icon: <Mail size={13} />,
      badge: undefined,
    },
  ]

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/contacts')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Contacts
      </button>

      {/* Auto-case banner */}
      {autoCaseNotice && (
        <div className="mb-5 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <Sparkles size={16} className="text-green-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Case automatically created</p>
            <p className="text-xs text-green-700 mt-0.5">
              "{contact.first_name} {contact.last_name} — Onboarding" is now open.
              Enquiry notes and meeting notes have been copied across.{' '}
              <button
                onClick={() => navigate(`/cases/${autoCaseNotice.id}`)}
                className="underline font-medium"
              >
                Open case →
              </button>
            </p>
          </div>
          <button onClick={() => setAutoCaseNotice(null)} className="text-green-400 hover:text-green-600 text-xs">✕</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Main column */}
        <div className="col-span-2 space-y-5">

          {/* Contact header card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-base font-bold shrink-0">
                  {contact.first_name[0]}{contact.last_name[0]}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {contact.first_name} {contact.last_name}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    {editingStatus ? (
                      <select
                        defaultValue={contact.status}
                        onChange={async e => {
                          await updateContact(id!, { status: e.target.value as typeof contact.status })
                          setEditingStatus(false)
                        }}
                        onBlur={() => setEditingStatus(false)}
                        autoFocus
                        className="text-xs border border-slate-200 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingStatus(true)}
                        className={cn(
                          'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize group',
                          contact.status === 'lead'     && 'bg-violet-100 text-violet-700',
                          contact.status === 'active'   && 'bg-green-100  text-green-700',
                          contact.status === 'inactive' && 'bg-slate-100  text-slate-600',
                          contact.status === 'closed'   && 'bg-red-100    text-red-600',
                        )}
                      >
                        {contact.status}
                        <Pencil size={9} className="opacity-40 group-hover:opacity-80 transition-opacity" />
                      </button>
                    )}
                    <span className="text-xs text-slate-400 capitalize">{contact.source}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowNiceToMeetYou(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Send size={13} /> Nice to meet you
                </button>
                <button
                  onClick={() => setShowMeeting(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <CalendarPlus size={13} /> Schedule meeting
                </button>
              </div>
            </div>

            {/* Contact info */}
            <div className="flex flex-wrap gap-4">
              {contact.email && (
                <a href={`mailto:${contact.email}`}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                  <Mail size={13} /> {contact.email}
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`}
                  className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
                  <Phone size={13} /> {contact.phone}
                </a>
              )}
            </div>

            {/* Pipeline stage row */}
            <div className="flex items-center gap-2 mt-5 pt-5 border-t border-slate-100">
              <Tag size={13} className="text-slate-400 shrink-0" />
              <span className="text-xs text-slate-500 mr-1">Pipeline:</span>
              {editingStage ? (
                <select
                  defaultValue={contact.pipeline_stage_id ?? ''}
                  onChange={e => handleStageChange(e.target.value)}
                  onBlur={() => setEditingStage(false)}
                  autoFocus
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No stage</option>
                  {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              ) : (
                <button
                  onClick={() => setEditingStage(true)}
                  disabled={stageSaving}
                  className="flex items-center gap-1.5 group"
                >
                  {currentStage ? (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${currentStage.color}20`, color: currentStage.color }}
                    >
                      {currentStage.name}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">No stage</span>
                  )}
                  {stageSaving
                    ? <span className="text-xs text-slate-400 ml-1">Saving…</span>
                    : <Pencil size={11} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                  }
                </button>
              )}
              {tenant?.case_conversion_stage_id && contact?.pipeline_stage_id === tenant.case_conversion_stage_id && (
                <span className="flex items-center gap-1 text-xs text-green-600 ml-2">
                  <CheckCircle2 size={11} /> Case created
                </span>
              )}
            </div>
          </div>

          {/* Open cases */}
          <OpenCasesCard contactId={id!} tenantId={tenantId} />

          {/* Tabbed notes / activity card */}
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
                  {t.badge !== undefined && (
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
                <EnquiryTab metadata={meta} />
              )}
              {tab === 'meeting' && (
                <MeetingNotesTab
                  contactId={id!}
                  initialNotes={contact.notes}
                  onSave={handleSaveMeetingNotes}
                />
              )}
              {tab === 'activity' && (
                <ActivityTab
                  contactId={id!}
                  tenantId={tenantId}
                  activities={activities}
                  onActivityAdded={loadActivities}
                />
              )}
              {tab === 'emails' && (
                <EmailThread
                  contactId={id!}
                  contactEmail={contact.email}
                  contactName={`${contact.first_name} ${contact.last_name}`}
                  tenantId={tenantId!}
                  onEmailSent={loadActivities}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Added</dt>
                <dd className="font-medium text-slate-700">
                  {new Date(contact.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </dd>
              </div>
              {!!meta.company && (
                <div>
                  <dt className="text-xs text-slate-400">Company</dt>
                  <dd className="font-medium text-slate-700">{String(meta.company)}</dd>
                </div>
              )}
              {!!meta.grade && (
                <div>
                  <dt className="text-xs text-slate-400">Quiz result</dt>
                  <dd className="font-medium text-slate-700">
                    Grade {String(meta.grade)}
                    {meta.score !== undefined && <span className="text-slate-400 font-normal"> · score {String(meta.score)}</span>}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Tags</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {allTags.filter(t => tagIds.includes(t.id)).map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                  <button
                    onClick={() => unlinkTag(tag.id)}
                    className="hover:opacity-70 transition-opacity"
                    title={`Remove ${tag.name}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              {tagIds.length === 0 && !showTagPicker && (
                <span className="text-xs text-slate-400">No tags</span>
              )}
            </div>
            {showTagPicker ? (
              <div className="space-y-1.5">
                {allTags.filter(t => !tagIds.includes(t.id)).length === 0 ? (
                  <p className="text-xs text-slate-400">
                    {allTags.length === 0 ? 'No tags created yet. Add them in Settings → Clients.' : 'All tags assigned.'}
                  </p>
                ) : (
                  allTags.filter(t => !tagIds.includes(t.id)).map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => linkTag(tag.id)}
                      className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                      <span className="text-xs text-slate-700">{tag.name}</span>
                    </button>
                  ))
                )}
                <button
                  onClick={() => setShowTagPicker(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 mt-1"
                >
                  Done
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTagPicker(true)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Tag size={11} /> Manage tags
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Schedule meeting modal */}
      {showMeeting && tenantId && (
        <ScheduleMeetingModal
          tenantId={tenantId}
          contactId={id}
          attendeeEmail={contact.email}
          attendeeName={`${contact.first_name} ${contact.last_name}`}
          defaultTitle={`Meeting with ${contact.first_name} ${contact.last_name}`}
          onClose={() => setShowMeeting(false)}
          onScheduled={() => { loadActivities(); setTab('activity') }}
        />
      )}

      {/* Nice to meet you email modal */}
      {showNiceToMeetYou && tenantId && (
        <NiceToMeetYouModal
          tenantId={tenantId}
          contact={contact}
          onClose={() => setShowNiceToMeetYou(false)}
          onSent={() => { loadActivities(); setTab('activity') }}
        />
      )}
    </div>
  )
}

// ─── Open Cases sub-component ────────────────────────────────────────────────
function OpenCasesCard({ contactId, tenantId }: { contactId: string; tenantId: string | null }) {
  const navigate = useNavigate()
  const [cases, setCases] = useState<Case[]>([])

  useEffect(() => {
    if (!tenantId || !contactId) return
    supabase
      .from('cases')
      .select('*, stage:pipeline_stages(id, name, color, order, description, tenant_id, created_at)')
      .eq('tenant_id', tenantId)
      .eq('contact_id', contactId)
      .is('closed_at', null)
      .order('opened_at', { ascending: false })
      .then(({ data }) => setCases((data as Case[]) ?? []))
  }, [tenantId, contactId])

  if (cases.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen size={14} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-700">Open Cases</h2>
      </div>
      <div className="space-y-2">
        {cases.map(c => (
          <button
            key={c.id}
            onClick={() => navigate(`/cases/${c.id}`)}
            className="w-full flex items-center gap-3 text-left hover:bg-slate-50 rounded-lg px-3 py-2.5 transition-colors"
          >
            <span
              className="w-1 h-8 rounded-full shrink-0"
              style={{ backgroundColor: c.stage?.color ?? '#e2e8f0' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{c.title}</p>
              {c.stage && (
                <p className="text-xs mt-0.5" style={{ color: c.stage.color }}>{c.stage.name}</p>
              )}
            </div>
            <span className="text-xs text-slate-400 shrink-0">
              {new Date(c.opened_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
