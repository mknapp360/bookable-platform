import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Mail, Pencil,
  Tag, ClipboardList, MessageSquare, Save, Trash2,
  Sparkles, Send, Loader2, CheckCircle2, Settings, PenLine,
} from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import { useEnquiries } from '@/hooks/useEnquiries'
import { useContacts } from '@/hooks/useContacts'
import { usePipelineStages } from '@/hooks/usePipelineStages'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import type { Contact, EnquiryStatus } from '@/types'

const CONTACT_TRIGGER_STAGE = 'contacted'

// ─── Meeting Notes tab ────────────────────────────────────────────────────────
function MeetingNotesTab({
  enquiryId,
  initialNotes: _initialNotes,
}: {
  enquiryId: string
  initialNotes: string | null
}) {
  const [value, setValue]   = useState(_initialNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const dirty = value !== (_initialNotes ?? '')

  async function handleSave() {
    setSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('enquiries').update({ notes: value || null }).eq('id', enquiryId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        Record notes from your initial call or meeting with this enquiry.
      </p>
      <textarea
        value={value}
        onChange={e => { setValue(e.target.value); setSaved(false) }}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave() }}
        rows={10}
        placeholder="e.g. Spoke with the enquirer on 28 Apr — they are looking to start within 3 months..."
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
          {saved ? 'Saved' : saving ? 'Saving...' : 'Save notes'}
        </button>
      </div>
    </div>
  )
}

// ─── Reply Section (AI / Manual toggle) ─────────────────────────────────────
function AiDraftSection({
  enquiryId,
  enquiryEmail,
  enquiryName,
  tenantId,
  initialDraft,
  initialStatus,
  hasBusinessProfile,
}: {
  enquiryId: string
  enquiryEmail: string
  enquiryName: string
  tenantId: string
  initialDraft: string | null | undefined
  initialStatus: 'none' | 'generating' | 'ready' | 'sent' | undefined
  hasBusinessProfile: boolean
}) {
  const [draft, setDraft]           = useState(initialDraft ?? '')
  const [status, setStatus]         = useState(initialStatus ?? 'none')
  const [sending, setSending]       = useState(false)
  const [mode, setMode]             = useState<'ai' | 'manual'>('ai')
  const [manualBody, setManualBody] = useState('')

  // Sync from props if they change (e.g. refetch)
  useEffect(() => {
    setDraft(initialDraft ?? '')
    setStatus(initialStatus ?? 'none')
  }, [initialDraft, initialStatus])

  // Realtime subscription for draft status changes
  useEffect(() => {
    const channel = supabase
      .channel(`enquiry-draft-${enquiryId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'enquiries',
          filter: `id=eq.${enquiryId}`,
        },
        (payload) => {
          const row = payload.new as { ai_draft?: string; ai_draft_status?: string }
          if (row.ai_draft_status) setStatus(row.ai_draft_status as typeof status)
          if (row.ai_draft !== undefined) setDraft(row.ai_draft ?? '')
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [enquiryId])

  async function handleSend(body: string) {
    if (!body.trim()) return
    setSending(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

      const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          contact_id: null,
          to_email: enquiryEmail,
          to_name: enquiryName,
          subject: `Re: Your enquiry`,
          body,
        }),
      })

      if (res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('enquiries')
          .update({ ai_draft_status: 'sent' })
          .eq('id', enquiryId)
        setStatus('sent')
      }
    } catch (err) {
      console.error('Failed to send:', err)
    } finally {
      setSending(false)
    }
  }

  // Sent state — same for both modes
  if (status === 'sent') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={14} className="text-green-500 shrink-0" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Reply sent</h3>
        </div>
        <p className="text-sm text-slate-500 whitespace-pre-wrap leading-relaxed">{draft || manualBody}</p>
      </div>
    )
  }

  // ── Mode toggle ──
  const toggleBar = (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
        <button
          onClick={() => setMode('ai')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
            mode === 'ai' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <Sparkles size={12} /> AI Draft
        </button>
        <button
          onClick={() => setMode('manual')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
            mode === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <PenLine size={12} /> Manual Reply
        </button>
      </div>
    </div>
  )

  // ── Manual mode ──
  if (mode === 'manual') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        {toggleBar}
        <textarea
          value={manualBody}
          onChange={e => setManualBody(e.target.value)}
          rows={6}
          placeholder="Write your reply…"
          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleSend(manualBody)}
            disabled={sending || !manualBody.trim()}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors',
              'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
            )}
          >
            {sending ? (
              <><Loader2 size={13} className="animate-spin" /> Sending…</>
            ) : (
              <><Send size={13} /> Send</>
            )}
          </button>
        </div>
      </div>
    )
  }

  // ── AI mode ──

  // No profile — nudge to settings
  if (status === 'none' && !hasBusinessProfile) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        {toggleBar}
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Settings size={14} className="shrink-0" />
            <span>
              Add a business profile in{' '}
              <Link to="/settings?tab=account" className="text-blue-600 hover:underline font-medium">
                Settings
              </Link>{' '}
              to enable AI-drafted replies.
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Profile exists but no draft yet (pre-existing enquiry)
  if (status === 'none') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        {toggleBar}
        <p className="text-sm text-slate-400 italic">No AI draft available for this enquiry.</p>
      </div>
    )
  }

  // Generating
  if (status === 'generating') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        {toggleBar}
        <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Loader2 size={14} className="animate-spin shrink-0" />
            <span>Drafting reply…</span>
          </div>
        </div>
      </div>
    )
  }

  // Ready — editable AI draft
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      {toggleBar}
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        rows={6}
        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
      />
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => handleSend(draft)}
          disabled={sending || !draft.trim()}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors',
            'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
          )}
        >
          {sending ? (
            <><Loader2 size={13} className="animate-spin" /> Sending…</>
          ) : (
            <><Send size={13} /> Send</>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function EnquiryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const tenantId = tenant?.id ?? null

  const { enquiries, loading, updateEnquiry, updatePipelineStage, deleteEnquiry } = useEnquiries(tenantId)
  const { addContact } = useContacts(tenantId)
  const { stages } = usePipelineStages(tenantId)

  const enquiry = enquiries.find(e => e.id === id)

  type NoteTab = 'enquiry' | 'meeting'

  const [tab, setTab]                       = useState<NoteTab>('enquiry')
  const [editingStage, setEditingStage]     = useState(false)
  const [editingStatus, setEditingStatus]   = useState(false)
  const [stageSaving, setStageSaving]       = useState(false)
  const [deleteConfirm, setDeleteConfirm]   = useState(false)

  async function handleStageChange(stageId: string) {
    if (!enquiry || !tenantId || !id) return
    setStageSaving(true)
    setEditingStage(false)

    const selectedStage = stages.find(s => s.id === stageId)

    // Convert enquiry to a contact when moved to "contacted" stage
    if (selectedStage && selectedStage.name.toLowerCase().trim() === CONTACT_TRIGGER_STAGE) {
      const nameParts = enquiry.name.trim().split(/\s+/)
      const firstName = nameParts[0] ?? enquiry.name
      const lastName = nameParts.slice(1).join(' ') || ''

      const { error } = await addContact({
        first_name: firstName,
        last_name: lastName,
        email: enquiry.email || null,
        source: (['website','referral','manual','phone','email','other'].includes(enquiry.source) ? enquiry.source as Contact['source'] : 'other'),
        status: 'lead',
        notes: enquiry.notes || null,
        pipeline_stage_id: stageId,
        metadata: enquiry.message ? { enquiry_message: enquiry.message } : {},
      } as Partial<Contact>)

      if (error) { setStageSaving(false); return }

      // Mark enquiry as converted and remove from pipeline
      await updateEnquiry(id, { status: 'converted', pipeline_stage_id: null })

      // Find the newly created contact and log activity
      const { data: newContact } = await supabase
        .from('contacts')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('email', enquiry.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (newContact) {
        await supabase.from('activities').insert({
          tenant_id: tenantId,
          contact_id: newContact.id,
          type: 'contact_created',
          body: `Contact created from enquiry (moved to "${selectedStage.name}")`,
        })
        // Navigate to the new contact page
        setStageSaving(false)
        navigate(`/contacts/${newContact.id}`)
        return
      }

      setStageSaving(false)
      return
    }

    // Default: just move the enquiry stage
    await updatePipelineStage(id, stageId || null)
    setStageSaving(false)
  }

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading...</div>

  if (!enquiry) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Enquiry not found.</p>
        <button onClick={() => navigate('/pipeline')} className="text-blue-600 text-sm mt-2">&larr; Back</button>
      </div>
    )
  }

  const settings = (tenant?.settings ?? {}) as Record<string, unknown>
  const businessProfile = settings.business_profile as { description?: string } | undefined
  const hasBusinessProfile = !!(businessProfile && businessProfile.description)

  const currentStage  = enquiry.pipeline_stage
  const firstStage    = stages.length > 0 ? stages[0] : null
  const isFirstStage  = firstStage && enquiry.pipeline_stage_id === firstStage.id
  const statusOptions: EnquiryStatus[] = ['new', 'contacted', 'converted', 'dismissed']

  // Split enquiry name into first/last for avatar
  const nameParts = enquiry.name.trim().split(/\s+/)
  const initials  = nameParts.length >= 2
    ? `${nameParts[0][0]}${nameParts[1][0]}`
    : enquiry.name.slice(0, 2)

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/pipeline')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Pipeline
      </button>



      <div className="grid grid-cols-3 gap-6">
        {/* Main column */}
        <div className="col-span-2 space-y-5">

          {/* Enquiry header card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-base font-bold shrink-0 uppercase">
                  {initials}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{enquiry.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    {editingStatus ? (
                      <select
                        defaultValue={enquiry.status}
                        onChange={async e => {
                          await updateEnquiry(id!, { status: e.target.value as EnquiryStatus })
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
                          enquiry.status === 'new'       && 'bg-blue-100 text-blue-700',
                          enquiry.status === 'contacted'  && 'bg-amber-100 text-amber-700',
                          enquiry.status === 'converted'  && 'bg-green-100 text-green-700',
                          enquiry.status === 'dismissed'  && 'bg-red-100 text-red-600',
                        )}
                      >
                        {enquiry.status}
                        <Pencil size={9} className="opacity-40 group-hover:opacity-80 transition-opacity" />
                      </button>
                    )}
                    <span className="text-xs text-slate-400 capitalize">{enquiry.source}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="flex flex-wrap gap-4">
              {enquiry.email && (
                <a href={`mailto:${enquiry.email}`}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                  <Mail size={13} /> {enquiry.email}
                </a>
              )}
            </div>

            {/* Pipeline stage row */}
            <div className="flex items-center gap-2 mt-5 pt-5 border-t border-slate-100">
              <Tag size={13} className="text-slate-400 shrink-0" />
              <span className="text-xs text-slate-500 mr-1">Pipeline:</span>
              {editingStage ? (
                <select
                  defaultValue={enquiry.pipeline_stage_id ?? ''}
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
                    ? <span className="text-xs text-slate-400 ml-1">Saving...</span>
                    : <Pencil size={11} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                  }
                </button>
              )}
            </div>

            {/* Delete — only for enquiries in the first pipeline stage */}
            {isFirstStage && (
              <div className="flex justify-end mt-5 pt-5 border-t border-slate-100">
                {deleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600">Delete this enquiry?</span>
                    <button
                      onClick={async () => {
                        await deleteEnquiry(id!)
                        navigate('/pipeline')
                      }}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >Yes</button>
                    <span className="text-slate-300">/</span>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="text-xs font-medium text-slate-500 hover:text-slate-700"
                    >No</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                )}
              </div>
            )}
          </div>

          {/* AI Draft */}
          <AiDraftSection
            enquiryId={id!}
            enquiryEmail={enquiry.email}
            enquiryName={enquiry.name}
            tenantId={tenantId!}
            initialDraft={enquiry.ai_draft}
            initialStatus={enquiry.ai_draft_status}
            hasBusinessProfile={hasBusinessProfile}
          />

          {/* Tabbed notes card */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex border-b border-slate-200 px-2 pt-2">
              {([
                { id: 'enquiry' as NoteTab, label: 'Enquiry Message', icon: <ClipboardList size={13} />, dot: !!enquiry.message },
                { id: 'meeting' as NoteTab, label: 'Meeting Notes', icon: <MessageSquare size={13} />, dot: !!enquiry.notes },
              ]).map(t => (
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
            <div className="p-6">
              {tab === 'enquiry' && (
                enquiry.message
                  ? <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{enquiry.message}</p>
                  : <p className="text-sm text-slate-400 italic">No message provided.</p>
              )}
              {tab === 'meeting' && (
                <MeetingNotesTab enquiryId={id!} initialNotes={enquiry.notes} />
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
                <dt className="text-xs text-slate-400">Received</dt>
                <dd className="font-medium text-slate-700">
                  {new Date(enquiry.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Source</dt>
                <dd className="font-medium text-slate-700 capitalize">{enquiry.source}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Status</dt>
                <dd className="font-medium text-slate-700 capitalize">{enquiry.status}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
