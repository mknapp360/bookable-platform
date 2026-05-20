import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderPlus, User, Folder, Sparkles, Mail } from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import { useCases } from '@/hooks/useCases'
import { useContacts } from '@/hooks/useContacts'
import { useEnquiries } from '@/hooks/useEnquiries'
import { usePipelineStages } from '@/hooks/usePipelineStages'
import { CaseForm } from '@/components/crm/CaseForm'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import type { Case, Contact, Enquiry, PipelineStage } from '@/types'

const CASE_TRIGGER_STAGE = 'setting up client'
const CONTACT_TRIGGER_STAGE = 'contacted'

type BoardItem =
  | { kind: 'contact'; data: Contact }
  | { kind: 'case';    data: Case }
  | { kind: 'enquiry'; data: Enquiry }

// ─── Contact card ─────────────────────────────────────────────────────────────
function ContactCard({ contact, onDragStart, onDragEnd, isDragging }: {
  contact: Contact; onDragStart: () => void; onDragEnd: () => void; isDragging: boolean
}) {
  const navigate = useNavigate()
  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd}
      onClick={() => navigate(`/contacts/${contact.id}`)}
      className={cn(
        'bg-white border border-violet-200 rounded-lg p-3 cursor-pointer select-none',
        'hover:border-violet-300 hover:shadow-sm transition-all',
        isDragging && 'opacity-40 scale-95',
      )}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <User size={10} className="text-violet-400 shrink-0" />
        <span className="text-[9px] font-bold text-violet-500 uppercase tracking-wide">Lead</span>
      </div>
      <p className="text-sm font-medium text-slate-900 leading-snug">
        {contact.first_name} {contact.last_name}
      </p>
      {contact.email && <p className="text-[11px] text-slate-400 mt-1 truncate">{contact.email}</p>}
      <p className="text-[10px] text-slate-400 mt-1.5">
        {new Date(contact.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
      </p>
    </div>
  )
}

// ─── Case card ────────────────────────────────────────────────────────────────
function CaseCard({ c, onDragStart, onDragEnd, isDragging }: {
  c: Case; onDragStart: () => void; onDragEnd: () => void; isDragging: boolean
}) {
  const navigate = useNavigate()
  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd}
      onClick={() => navigate(`/cases/${c.id}`)}
      className={cn(
        'bg-white border border-slate-200 rounded-lg p-3 cursor-pointer select-none',
        'hover:border-slate-300 hover:shadow-sm transition-all',
        isDragging && 'opacity-40 scale-95',
      )}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Folder size={10} className="text-slate-400 shrink-0" />
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Case</span>
      </div>
      <p className="text-sm font-medium text-slate-900 leading-snug">{c.title}</p>
      {c.contact && (
        <p className="text-[11px] text-slate-500 mt-1 truncate">
          {c.contact.first_name} {c.contact.last_name}
        </p>
      )}
      <p className="text-[10px] text-slate-400 mt-1.5">
        {new Date(c.opened_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
      </p>
    </div>
  )
}

// ─── Enquiry card ────────────────────────────────────────────────────────────
function EnquiryCard({ enquiry, onDragStart, onDragEnd, isDragging }: {
  enquiry: Enquiry; onDragStart: () => void; onDragEnd: () => void; isDragging: boolean
}) {
  const navigate = useNavigate()
  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd}
      onClick={() => navigate(`/enquiries/${enquiry.id}`)}
      className={cn(
        'bg-white border border-emerald-200 rounded-lg p-3 cursor-pointer select-none',
        'hover:border-emerald-300 hover:shadow-sm transition-all',
        isDragging && 'opacity-40 scale-95',
      )}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Mail size={10} className="text-emerald-400 shrink-0" />
        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wide">Enquiry</span>
      </div>
      <p className="text-sm font-medium text-slate-900 leading-snug">{enquiry.name}</p>
      {enquiry.email && <p className="text-[11px] text-slate-400 mt-1 truncate">{enquiry.email}</p>}
      {enquiry.message && (
        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{enquiry.message}</p>
      )}
      <p className="text-[10px] text-slate-400 mt-1.5">
        {new Date(enquiry.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
      </p>
    </div>
  )
}

// ─── Stage column ─────────────────────────────────────────────────────────────
function StageColumn({ stage, items, draggedId, dragOverId, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop }: {
  stage: PipelineStage | { id: null; name: string; color: string }
  items: BoardItem[]
  draggedId: string | null
  dragOverId: string | null
  onDragStart: (id: string, kind: 'contact' | 'case' | 'enquiry') => void
  onDragEnd: () => void
  onDragOver: (colId: string) => void
  onDragLeave: () => void
  onDrop: (stageId: string | null) => void
}) {
  const colId = stage.id ?? '__none__'
  const isOver = dragOverId === colId && draggedId !== null

  return (
    <div className="flex flex-col w-56 shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
        <span className="text-xs font-semibold text-slate-600 truncate">{stage.name}</span>
        <span className="text-xs text-slate-400 ml-auto shrink-0">{items.length}</span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); onDragOver(colId) }}
        onDragLeave={onDragLeave}
        onDrop={e => { e.preventDefault(); onDrop(stage.id) }}
        className={cn(
          'flex-1 min-h-[100px] rounded-xl p-2 space-y-2 transition-colors',
          isOver
            ? 'bg-blue-50 border-2 border-blue-300 border-dashed'
            : 'bg-black/[0.03] border-2 border-transparent'
        )}
      >
        {items.length === 0 && !isOver && (
          <p className="text-[11px] text-slate-400 text-center pt-5 select-none">Drop here</p>
        )}
        {items.map(item =>
          item.kind === 'contact'
            ? <ContactCard key={`c-${item.data.id}`} contact={item.data}
                onDragStart={() => onDragStart(item.data.id, 'contact')}
                onDragEnd={onDragEnd} isDragging={draggedId === item.data.id} />
            : item.kind === 'enquiry'
            ? <EnquiryCard key={`e-${item.data.id}`} enquiry={item.data}
                onDragStart={() => onDragStart(item.data.id, 'enquiry')}
                onDragEnd={onDragEnd} isDragging={draggedId === item.data.id} />
            : <CaseCard key={`k-${item.data.id}`} c={item.data}
                onDragStart={() => onDragStart(item.data.id, 'case')}
                onDragEnd={onDragEnd} isDragging={draggedId === item.data.id} />
        )}
      </div>
    </div>
  )
}

// ─── Phase row ────────────────────────────────────────────────────────────────
function PhaseRow({ phaseNum, phaseLabel, stages, itemsForStage, draggedId, dragOverId, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop }: {
  phaseNum: number
  phaseLabel: string
  stages: PipelineStage[]
  itemsForStage: (stageId: string | null) => BoardItem[]
  draggedId: string | null
  dragOverId: string | null
  onDragStart: (id: string, kind: 'contact' | 'case' | 'enquiry') => void
  onDragEnd: () => void
  onDragOver: (colId: string) => void
  onDragLeave: () => void
  onDrop: (stageId: string | null) => void
}) {
  const phaseColors: Record<number, string> = {
    1: 'bg-violet-50 border-violet-200 text-violet-700',
    2: 'bg-blue-50   border-blue-200   text-blue-700',
    3: 'bg-slate-50  border-slate-200  text-slate-600',
  }
  const labelCls = phaseColors[phaseNum] ?? phaseColors[3]

  const totalItems = stages.reduce((n, s) => n + itemsForStage(s.id).length, 0)

  return (
    <div className="mb-6">
      {/* Phase label */}
      <div className="flex items-center gap-3 mb-3">
        <span className={cn('text-xs font-semibold px-3 py-1 rounded-full border', labelCls)}>
          {phaseLabel}
        </span>
        <span className="text-xs text-slate-400">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      {/* Stage columns */}
      <div className="flex gap-3">
        {stages.map(stage => (
          <StageColumn
            key={stage.id}
            stage={stage}
            items={itemsForStage(stage.id)}
            draggedId={draggedId}
            dragOverId={dragOverId}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function PipelinePage() {
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const tenantId = tenant?.id ?? null

  const { cases, updateCase, addCase, refetch: refetchCases } = useCases(tenantId)
  const { contacts, updatePipelineStage, updateContact, addContact, refetch: refetchContacts } = useContacts(tenantId)
  const { enquiries, updatePipelineStage: updateEnquiryStage, updateEnquiry, refetch: refetchEnquiries } = useEnquiries(tenantId)
  const { stages } = usePipelineStages(tenantId)

  const [draggedId, setDraggedId]     = useState<string | null>(null)
  const [draggedKind, setDraggedKind] = useState<'contact' | 'case' | 'enquiry' | null>(null)
  const [dragOverId, setDragOverId]   = useState<string | null>(null)
  const [showForm, setShowForm]       = useState(false)
  const [showClosed, setShowClosed]   = useState(false)
  const [autoCaseNotice, setAutoCaseNotice] = useState<{ name: string; caseId: string } | null>(null)
  const dragLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Contacts in pipeline that don't already have an open case
  const contactsInPipeline = contacts.filter(c => c.pipeline_stage_id !== null)
  const contactIdsWithCase = new Set(cases.filter(c => !c.closed_at).map(c => c.contact_id))
  const leadCards = contactsInPipeline.filter(c => !contactIdsWithCase.has(c.id))
  const visibleCases = cases.filter(c => showClosed || !c.closed_at)
  const enquiriesInPipeline = enquiries.filter(e => e.pipeline_stage_id !== null)

  // Auto-convert any enquiries already sitting at "contacted" stage
  const convertingRef = useRef(false)
  useEffect(() => {
    if (convertingRef.current || !tenantId || stages.length === 0 || enquiriesInPipeline.length === 0) return

    const contactedStageIds = new Set(
      stages.filter(s => s.name.toLowerCase().trim() === CONTACT_TRIGGER_STAGE).map(s => s.id)
    )
    const stale = enquiriesInPipeline.filter(e => e.pipeline_stage_id && contactedStageIds.has(e.pipeline_stage_id))
    if (stale.length === 0) return

    convertingRef.current = true
    ;(async () => {
      for (const enquiry of stale) {
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
          pipeline_stage_id: enquiry.pipeline_stage_id,
          metadata: enquiry.message ? { enquiry_message: enquiry.message } : {},
        } as Partial<Contact>)

        if (error) continue // don't mark as converted if contact creation failed

        await updateEnquiry(enquiry.id, { status: 'converted', pipeline_stage_id: null })

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
            body: `Contact created from enquiry (auto-converted at "${CONTACT_TRIGGER_STAGE}" stage)`,
          })
        }
      }

      await refetchEnquiries()
      await refetchContacts()
      convertingRef.current = false
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, stages, enquiries])

  function itemsForStage(stageId: string | null): BoardItem[] {
    const enquiryItems: BoardItem[] = enquiriesInPipeline
      .filter(e => e.pipeline_stage_id === stageId)
      .map(e => ({ kind: 'enquiry', data: e }))
    const contactItems: BoardItem[] = leadCards
      .filter(c => c.pipeline_stage_id === stageId)
      .map(c => ({ kind: 'contact', data: c }))
    const caseItems: BoardItem[] = visibleCases
      .filter(c => c.stage_id === stageId)
      .map(c => ({ kind: 'case', data: c }))
    return [...enquiryItems, ...contactItems, ...caseItems]
  }

  async function handleDrop(targetStageId: string | null) {
    if (!draggedId || !draggedKind || !tenantId) return

    if (draggedKind === 'enquiry') {
      const enquiry = enquiries.find(e => e.id === draggedId)
      if (enquiry && enquiry.pipeline_stage_id !== targetStageId) {
        const targetStage = stages.find(s => s.id === targetStageId)

        // Convert enquiry to contact when moved to "contacted" stage
        if (targetStage && targetStage.name.toLowerCase().trim() === CONTACT_TRIGGER_STAGE) {
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
            pipeline_stage_id: targetStageId,
            metadata: enquiry.message ? { enquiry_message: enquiry.message } : {},
          } as Partial<Contact>)

          if (error) {
            setDraggedId(null); setDraggedKind(null); setDragOverId(null)
            return
          }

          // Mark enquiry as converted and remove from pipeline
          await updateEnquiry(draggedId, { status: 'converted', pipeline_stage_id: null })
          await refetchEnquiries()
          await refetchContacts()

          // Log activity on the new contact
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
              body: `Contact created from enquiry (moved to "${targetStage.name}")`,
            })
          }
        } else {
          await updateEnquiryStage(draggedId, targetStageId)
          await refetchEnquiries()
        }
      }
      setDraggedId(null); setDraggedKind(null); setDragOverId(null)
      return
    }

    if (draggedKind === 'case') {
      const c = cases.find(x => x.id === draggedId)
      if (c && c.stage_id !== targetStageId) await updateCase(draggedId, { stage_id: targetStageId })
    } else {
      const contact = contacts.find(x => x.id === draggedId)
      if (!contact || contact.pipeline_stage_id === targetStageId) {
        setDraggedId(null); setDraggedKind(null); setDragOverId(null); return
      }

      await updatePipelineStage(draggedId, targetStageId)

      const targetStage = stages.find(s => s.id === targetStageId)
      if (targetStage) {
        await supabase.from('activities').insert({
          tenant_id: tenantId, contact_id: draggedId, type: 'status_change',
          body: `Pipeline stage changed to "${targetStage.name}"`,
        })
      }

      if (targetStage && targetStage.name.toLowerCase().trim() === CASE_TRIGGER_STAGE) {
        const { data: existing } = await supabase
          .from('cases').select('id').eq('tenant_id', tenantId)
          .eq('contact_id', draggedId).is('closed_at', null).limit(1)

        if (!existing || existing.length === 0) {
          // Carry over enquiry summary, priorities, and meeting notes
          const meta = (contact.metadata ?? {}) as Record<string, unknown>
          const noteParts: string[] = []
          if (meta.summary) noteParts.push(`## Enquiry Summary\n${meta.summary}`)
          const prios = meta.priorities as unknown[] | undefined
          if (Array.isArray(prios) && prios.length > 0) {
            noteParts.push(`## Priorities\n${prios.map(p => `- ${typeof p === 'string' ? p : JSON.stringify(p)}`).join('\n')}`)
          }
          if (contact.notes?.trim()) noteParts.push(`## Meeting Notes\n${contact.notes.trim()}`)
          const caseNotes = noteParts.join('\n\n') || null

          const { data: newCase } = await supabase
            .from('cases')
            .insert({
              tenant_id: tenantId, contact_id: draggedId,
              title: `${contact.first_name} ${contact.last_name} — Onboarding`,
              stage_id: targetStageId, notes: caseNotes, metadata: {},
            })
            .select().single()

          if (newCase) {
            await updateContact(draggedId, { status: 'active' })
            await supabase.from('activities').insert({
              tenant_id: tenantId, contact_id: draggedId, type: 'case_created',
              body: `Case automatically created: "${contact.first_name} ${contact.last_name} — Onboarding"`,
            })
            setAutoCaseNotice({ name: `${contact.first_name} ${contact.last_name} — Onboarding`, caseId: (newCase as Case).id })
            await refetchCases()
          }
        }
      }
      await refetchContacts()
    }

    setDraggedId(null); setDraggedKind(null); setDragOverId(null)
  }

  function handleDragOver(colId: string) {
    if (dragLeaveTimer.current) clearTimeout(dragLeaveTimer.current)
    setDragOverId(colId)
  }
  function handleDragLeave() {
    dragLeaveTimer.current = setTimeout(() => setDragOverId(null), 80)
  }

  // Group stages by phase number
  const phaseNums = [...new Set(stages.map(s => s.phase))].sort((a, b) => a - b)
  const phaseLabels: Record<number, string> = { 1: 'Phase 1 — Leads', 2: 'Phase 2 — Onboarding', 3: 'Phase 3 — Clients' }

  const totalItems = enquiriesInPipeline.length + leadCards.length + visibleCases.length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} · {tenant?.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
            <input type="checkbox" checked={showClosed} onChange={e => setShowClosed(e.target.checked)} className="rounded" />
            Show closed cases
          </label>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <FolderPlus size={16} /> New Case
          </button>
        </div>
      </div>

      {/* Auto-case notice */}
      {autoCaseNotice && (
        <div className="mx-8 mt-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3 shrink-0">
          <Sparkles size={15} className="text-green-600 shrink-0" />
          <p className="text-sm text-green-800 flex-1">Case created: <strong>"{autoCaseNotice.name}"</strong></p>
          <button onClick={() => navigate(`/cases/${autoCaseNotice.caseId}`)} className="text-xs font-medium text-green-700 underline shrink-0">Open case →</button>
          <button onClick={() => setAutoCaseNotice(null)} className="text-green-400 hover:text-green-600 text-xs shrink-0">✕</button>
        </div>
      )}

      {/* Board — vertically scrollable, each phase row horizontally scrollable */}
      {stages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 text-sm">No pipeline stages configured. Add them in Settings.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-8 py-6 space-y-2">
            {phaseNums.map(phaseNum => {
              const phaseStages = stages.filter(s => s.phase === phaseNum)
              const label = phaseLabels[phaseNum] ?? `Phase ${phaseNum}`
              return (
                <PhaseRow
                  key={phaseNum}
                  phaseNum={phaseNum}
                  phaseLabel={label}
                  stages={phaseStages}
                  itemsForStage={itemsForStage}
                  draggedId={draggedId}
                  dragOverId={dragOverId}
                  onDragStart={(id, kind) => { setDraggedId(id); setDraggedKind(kind); setDragOverId(null) }}
                  onDragEnd={() => { setDraggedId(null); setDraggedKind(null); setDragOverId(null) }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                />
              )
            })}
          </div>
        </div>
      )}

      {showForm && (
        <CaseForm contacts={contacts} stages={stages} onSubmit={addCase} onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}
