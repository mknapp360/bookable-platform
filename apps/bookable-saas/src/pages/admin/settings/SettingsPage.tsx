import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Trash2, ChevronUp, ChevronDown,
  GripVertical, Check, X, Pencil, Briefcase,
  Calendar, CheckCircle2, AlertCircle, Link2Off,
  Copy, RefreshCw, Lock, Code2
} from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import { usePipelineStages } from '@/hooks/usePipelineStages'
import { useTenantIntegration } from '@/hooks/useTenantIntegration'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import type { PipelineStage, DocumentType } from '@/types'

// ─── Tabs ────────────────────────────────────────────────────────────────────
type Tab = 'pipeline' | 'documents' | 'branding' | 'integrations' | 'email_formats' | 'widget' | 'account'

// ─── Pipeline Stages Panel ───────────────────────────────────────────────────
function PipelinePanel({
  tenantId,
  initialConversionStageId,
}: {
  tenantId: string
  initialConversionStageId: string | null
}) {
  const { stages, loading } = usePipelineStages(tenantId)
  const [local, setLocal]   = useState<PipelineStage[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [newPhase, setNewPhase] = useState(1)
  const [addingNew, setAddingNew] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [conversionStageId, setConversionStageId] = useState<string | null>(initialConversionStageId)

  // Sync remote → local
  useEffect(() => { setLocal(stages) }, [stages])

  async function saveOrder(updated: PipelineStage[]) {
    setLocal(updated)
    // Update each stage's order in parallel
    await Promise.all(
      updated.map((s, i) =>
        supabase.from('pipeline_stages').update({ order: i + 1 }).eq('id', s.id)
      )
    )
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    const next = [...local]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    saveOrder(next)
  }

  function moveDown(idx: number) {
    if (idx === local.length - 1) return
    const next = [...local]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    saveOrder(next)
  }

  async function saveEdit(stage: PipelineStage) {
    if (!editName.trim()) return
    setSaving(true)
    await supabase
      .from('pipeline_stages')
      .update({ name: editName.trim() })
      .eq('id', stage.id)
    setLocal(prev => prev.map(s => s.id === stage.id ? { ...s, name: editName.trim() } : s))
    setEditId(null)
    setSaving(false)
  }

  async function saveColor(stage: PipelineStage, color: string) {
    setLocal(prev => prev.map(s => s.id === stage.id ? { ...s, color } : s))
    await supabase.from('pipeline_stages').update({ color }).eq('id', stage.id)
  }

  async function savePhase(stage: PipelineStage, phase: number) {
    setLocal(prev => prev.map(s => s.id === stage.id ? { ...s, phase } : s))
    await supabase.from('pipeline_stages').update({ phase }).eq('id', stage.id)
  }

  async function deleteStage(id: string) {
    await supabase.from('pipeline_stages').delete().eq('id', id)
    setLocal(prev => prev.filter(s => s.id !== id))
    setDeleteConfirm(null)
  }

  async function addStage() {
    if (!newName.trim()) return
    setSaving(true)
    const { data } = await supabase
      .from('pipeline_stages')
      .insert({
        tenant_id: tenantId,
        name: newName.trim(),
        color: newColor,
        phase: newPhase,
        order: local.length + 1,
      })
      .select()
      .single()
    if (data) setLocal(prev => [...prev, data as PipelineStage])
    setNewName('')
    setNewColor('#6366f1')
    setNewPhase(1)
    setAddingNew(false)
    setSaving(false)
  }

  async function toggleConversionStage(stageId: string) {
    const next = conversionStageId === stageId ? null : stageId
    setConversionStageId(next)
    await supabase
      .from('tenants')
      .update({ case_conversion_stage_id: next })
      .eq('id', tenantId)
  }

  if (loading) return <p className="text-sm text-slate-400 py-4">Loading…</p>

  return (
    <div>
      <p className="text-sm text-slate-500 mb-5">
        Stages appear as columns on the Pipeline board. Use the arrows to reorder within a phase.
        The <span className="font-medium text-violet-600">1</span> / <span className="font-medium text-blue-600">2</span> / <span className="font-medium text-slate-600">3</span> buttons assign a stage to a phase row.
        Click the <Briefcase size={11} className="inline mb-0.5 text-amber-500" /> icon to mark the stage where contacts convert to cases.
      </p>

      <div className="space-y-2">
        {local.map((stage, idx) => (
          <div
            key={stage.id}
            className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
          >
            {/* Grip */}
            <GripVertical size={14} className="text-slate-300 shrink-0" />

            {/* Color swatch */}
            <label className="relative cursor-pointer shrink-0" title="Change colour">
              <span
                className="block w-5 h-5 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: stage.color }}
              />
              <input
                type="color"
                defaultValue={stage.color}
                onBlur={e => saveColor(stage, e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </label>

            {/* Name */}
            <div className="flex-1 min-w-0">
              {editId === stage.id ? (
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit(stage)
                    if (e.key === 'Escape') setEditId(null)
                  }}
                  autoFocus
                  className="w-full text-sm border border-blue-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <button
                  onClick={() => { setEditId(stage.id); setEditName(stage.name) }}
                  className="flex items-center gap-1.5 group text-left"
                >
                  <span className="text-sm font-medium text-slate-800">{stage.name}</span>
                  <Pencil size={11} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>
              )}
            </div>

            {/* Phase selector */}
            {editId !== stage.id && (
              <div className="flex items-center gap-0.5 shrink-0" title="Phase">
                {[1, 2, 3].map(p => (
                  <button
                    key={p}
                    onClick={() => savePhase(stage, p)}
                    className={cn(
                      'w-6 h-6 text-xs font-semibold rounded transition-colors',
                      stage.phase === p
                        ? p === 1
                          ? 'bg-violet-100 text-violet-700'
                          : p === 2
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-200 text-slate-700'
                        : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Save/cancel edit */}
            {editId === stage.id && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => saveEdit(stage)}
                  disabled={saving}
                  className="p-1 text-green-600 hover:text-green-700"
                >
                  <Check size={14} />
                </button>
                <button onClick={() => setEditId(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Case conversion toggle */}
            {editId !== stage.id && (
              <button
                onClick={() => toggleConversionStage(stage.id)}
                title={
                  conversionStageId === stage.id
                    ? 'Contacts convert to cases here — click to clear'
                    : 'Mark as the stage where contacts become cases'
                }
                className={cn(
                  'shrink-0 transition-colors',
                  conversionStageId === stage.id
                    ? 'text-amber-500 hover:text-amber-600'
                    : 'text-slate-200 hover:text-slate-400'
                )}
              >
                <Briefcase size={15} />
              </button>
            )}

            {/* Order buttons */}
            {editId !== stage.id && (
              <div className="flex flex-col shrink-0">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="disabled:opacity-20 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === local.length - 1}
                  className="disabled:opacity-20 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            )}

            {/* Delete */}
            {editId !== stage.id && (
              deleteConfirm === stage.id ? (
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-red-600 mr-1">Delete?</span>
                  <button
                    onClick={() => deleteStage(stage.id)}
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >Yes</button>
                  <span className="text-slate-300">/</span>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-700"
                  >No</button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(stage.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              )
            )}
          </div>
        ))}

        {/* Add new stage */}
        {addingNew ? (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <GripVertical size={14} className="text-slate-300 shrink-0" />
            <label className="relative cursor-pointer shrink-0">
              <span
                className="block w-5 h-5 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: newColor }}
              />
              <input
                type="color"
                value={newColor}
                onChange={e => setNewColor(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </label>
            {/* Phase picker for new stage */}
            <div className="flex items-center gap-0.5 shrink-0">
              {[1, 2, 3].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPhase(p)}
                  className={cn(
                    'w-6 h-6 text-xs font-semibold rounded transition-colors',
                    newPhase === p
                      ? p === 1
                        ? 'bg-violet-100 text-violet-700'
                        : p === 2
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-200 text-slate-700'
                      : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addStage()
                if (e.key === 'Escape') setAddingNew(false)
              }}
              autoFocus
              placeholder="Stage name…"
              className="flex-1 text-sm border border-blue-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button
              onClick={addStage}
              disabled={saving || !newName.trim()}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
            >
              <Check size={12} /> Add
            </button>
            <button
              onClick={() => setAddingNew(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingNew(true)}
            className="flex items-center gap-2 w-full px-4 py-2.5 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors"
          >
            <Plus size={14} /> Add stage
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Document Types Panel ─────────────────────────────────────────────────────
function DocumentTypesPanel({
  tenantId,
  stages,
}: {
  tenantId: string
  stages: PipelineStage[]
}) {
  const [docs, setDocs]   = useState<DocumentType[]>([])
  const [loading, setLoading] = useState(true)
  const [addingNew, setAddingNew] = useState(false)
  const [newName, setNewName]   = useState('')
  const [newRequired, setNewRequired] = useState(false)
  const [newStageId, setNewStageId]   = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('document_types')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name')
    setDocs((data as DocumentType[]) ?? [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { load() }, [load])

  async function addDoc() {
    if (!newName.trim()) return
    setSaving(true)
    const { data } = await supabase
      .from('document_types')
      .insert({
        tenant_id: tenantId,
        name: newName.trim(),
        required: newRequired,
        stage_id: newStageId || null,
      })
      .select()
      .single()
    if (data) setDocs(prev => [...prev, data as DocumentType].sort((a, b) => a.name.localeCompare(b.name)))
    setNewName('')
    setNewRequired(false)
    setNewStageId('')
    setAddingNew(false)
    setSaving(false)
  }

  async function toggleRequired(doc: DocumentType) {
    const next = !doc.required
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, required: next } : d))
    await supabase.from('document_types').update({ required: next }).eq('id', doc.id)
  }

  async function saveEditName(doc: DocumentType) {
    if (!editName.trim()) return
    setSaving(true)
    await supabase.from('document_types').update({ name: editName.trim() }).eq('id', doc.id)
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, name: editName.trim() } : d))
    setEditId(null)
    setSaving(false)
  }

  async function updateStage(doc: DocumentType, stageId: string) {
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, stage_id: stageId || null } : d))
    await supabase
      .from('document_types')
      .update({ stage_id: stageId || null })
      .eq('id', doc.id)
  }

  async function deleteDoc(id: string) {
    await supabase.from('document_types').delete().eq('id', id)
    setDocs(prev => prev.filter(d => d.id !== id))
    setDeleteConfirm(null)
  }

  const stageById = (id: string | null) => stages.find(s => s.id === id)

  if (loading) return <p className="text-sm text-slate-400 py-4">Loading…</p>

  return (
    <div>
      <p className="text-sm text-slate-500 mb-5">
        Define the documents required for each case. Mark critical ones as required.
      </p>

      <div className="space-y-2">
        {docs.map(doc => (
          <div
            key={doc.id}
            className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
          >
            {/* Required toggle */}
            <button
              onClick={() => toggleRequired(doc)}
              title={doc.required ? 'Required — click to make optional' : 'Optional — click to make required'}
              className={cn(
                'shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border transition-colors',
                doc.required
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              )}
            >
              {doc.required ? 'Required' : 'Optional'}
            </button>

            {/* Name */}
            <div className="flex-1 min-w-0">
              {editId === doc.id ? (
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEditName(doc)
                    if (e.key === 'Escape') setEditId(null)
                  }}
                  autoFocus
                  className="w-full text-sm border border-blue-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <button
                  onClick={() => { setEditId(doc.id); setEditName(doc.name) }}
                  className="flex items-center gap-1.5 group text-left"
                >
                  <span className="text-sm font-medium text-slate-800 truncate">{doc.name}</span>
                  <Pencil size={11} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                </button>
              )}
            </div>

            {/* Save/cancel edit */}
            {editId === doc.id && (
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => saveEditName(doc)} disabled={saving} className="p-1 text-green-600 hover:text-green-700">
                  <Check size={14} />
                </button>
                <button onClick={() => setEditId(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Stage association */}
            {editId !== doc.id && (
              <select
                value={doc.stage_id ?? ''}
                onChange={e => updateStage(doc, e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
              >
                <option value="">Any stage</option>
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}

            {/* Stage color badge */}
            {editId !== doc.id && doc.stage_id && stageById(doc.stage_id) && (
              <span
                className="hidden md:block w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: stageById(doc.stage_id)!.color }}
              />
            )}

            {/* Delete */}
            {editId !== doc.id && (
              deleteConfirm === doc.id ? (
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-red-600 mr-1">Delete?</span>
                  <button onClick={() => deleteDoc(doc.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Yes</button>
                  <span className="text-slate-300">/</span>
                  <button onClick={() => setDeleteConfirm(null)} className="text-xs font-medium text-slate-500 hover:text-slate-700">No</button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(doc.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              )
            )}
          </div>
        ))}

        {/* Add new */}
        {addingNew ? (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <button
              onClick={() => setNewRequired(r => !r)}
              className={cn(
                'shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border transition-colors',
                newRequired
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              )}
            >
              {newRequired ? 'Required' : 'Optional'}
            </button>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addDoc()
                if (e.key === 'Escape') setAddingNew(false)
              }}
              autoFocus
              placeholder="Document name…"
              className="flex-1 text-sm border border-blue-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <select
              value={newStageId}
              onChange={e => setNewStageId(e.target.value)}
              className="text-xs border border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shrink-0"
            >
              <option value="">Any stage</option>
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button
              onClick={addDoc}
              disabled={saving || !newName.trim()}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
            >
              <Check size={12} /> Add
            </button>
            <button onClick={() => setAddingNew(false)} className="text-slate-400 hover:text-slate-600 shrink-0">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingNew(true)}
            className="flex items-center gap-2 w-full px-4 py-2.5 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors"
          >
            <Plus size={14} /> Add document type
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Branding Panel ───────────────────────────────────────────────────────────
function BrandingPanel({ tenantId, initialName }: { tenantId: string; initialName: string }) {
  const [companyName, setCompanyName] = useState(initialName)
  const [saved, setSaved] = useState(false)

  async function save() {
    await supabase
      .from('tenants')
      .update({ branding: { companyName } })
      .eq('id', tenantId)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-md space-y-5">
      <p className="text-sm text-slate-500">
        The company name appears in the sidebar header.
      </p>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Company display name
        </label>
        <input
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save() }}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={save}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
          saved
            ? 'bg-green-600 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        )}
      >
        {saved ? <><Check size={14} /> Saved</> : 'Save changes'}
      </button>
    </div>
  )
}

// ─── Integrations Panel ───────────────────────────────────────────────────────
function IntegrationsPanel({ tenantId }: { tenantId: string }) {
  const { integration, loading, refetch, disconnect } = useTenantIntegration(tenantId, 'google_calendar')
  const [disconnecting, setDisconnecting] = useState(false)

  // Handle redirect back from Google OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('google_connected') === '1') {
      refetch()
      // Clean URL
      const clean = new URL(window.location.href)
      clean.searchParams.delete('google_connected')
      window.history.replaceState({}, '', clean.toString())
    }
  }, [refetch])

  function handleConnect() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
    const redirectBack = window.location.href.split('?')[0] + '?tab=integrations'
    const url = `${supabaseUrl}/functions/v1/google-oauth-init?tenant_id=${tenantId}&redirect_back=${encodeURIComponent(redirectBack)}`
    window.location.href = url
  }

  async function handleDisconnect() {
    setDisconnecting(true)
    await disconnect()
    setDisconnecting(false)
  }

  if (loading) return <p className="text-sm text-slate-400 py-4">Loading…</p>

  return (
    <div>
      <p className="text-sm text-slate-500 mb-6">
        Connect third-party services to unlock additional features like calendar scheduling.
      </p>

      {/* Google Calendar card */}
      <div className="border border-slate-200 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Google Calendar icon */}
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
              <Calendar size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Google Calendar</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Schedule meetings with clients and automatically create Google Meet links.
              </p>
            </div>
          </div>

          {integration ? (
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              <Link2Off size={12} />
              {disconnecting ? 'Disconnecting…' : 'Disconnect'}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors shrink-0"
            >
              Connect
            </button>
          )}
        </div>

        {/* Status */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          {integration ? (
            <div className="flex items-center gap-2 text-xs text-green-700">
              <CheckCircle2 size={13} className="text-green-500" />
              Connected as <span className="font-medium">{integration.connected_email}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <AlertCircle size={13} />
              Not connected
            </div>
          )}
        </div>

        {/* Setup reminder */}
        {!integration && (
          <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-xs text-amber-800 space-y-1">
            <p className="font-medium">Before connecting, make sure:</p>
            <p>1. Your Google Cloud project has the <strong>Calendar API</strong> enabled.</p>
            <p>2. Your OAuth credentials include this redirect URI:</p>
            <code className="block bg-amber-100 rounded px-2 py-1 mt-1 break-all font-mono text-[11px]">
              {import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth-callback
            </code>
            <p>3. <code className="font-mono bg-amber-100 rounded px-1">GOOGLE_CLIENT_ID</code> and <code className="font-mono bg-amber-100 rounded px-1">GOOGLE_CLIENT_SECRET</code> are set as Supabase secrets.</p>
          </div>
        )}
      </div>

    </div>
  )
}

// ─── Email Formats Panel ──────────────────────────────────────────────────────
function EmailFormatsPanel({ tenantId }: { tenantId: string }) {
  const { tenant, refetchTenant } = useTenant()
  const [subject,   setSubject]   = useState('')
  const [body,      setBody]      = useState('')
  const [fromName,  setFromName]  = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [saved,     setSaved]     = useState(false)
  const [saving,    setSaving]    = useState(false)

  // Seed from context (already loaded — no extra Supabase call needed)
  useEffect(() => {
    const s = (tenant?.settings ?? {}) as Record<string, unknown>
    const tmpl = ((s.email_templates as Record<string, unknown> | undefined)
      ?.nice_to_meet_you) as { subject?: string; body?: string } | undefined
    const cfg  = (s.email_config ?? {}) as { from_name?: string; from_email?: string }
    setSubject(tmpl?.subject   ?? 'Great to connect, {{first_name}}')
    setBody(tmpl?.body         ?? 'Hi {{first_name}},\n\nIt was great to meet you.\n\nBest,')
    setFromName(cfg.from_name  ?? '')
    setFromEmail(cfg.from_email ?? '')
  }, [tenant])

  async function save() {
    setSaving(true)
    const currentSettings  = (tenant?.settings as Record<string, unknown>) ?? {}
    const currentTemplates = (currentSettings.email_templates as Record<string, unknown>) ?? {}
    const { error } = await supabase
      .from('tenants')
      .update({
        settings: {
          ...currentSettings,
          email_templates: {
            ...currentTemplates,
            nice_to_meet_you: { subject, body },
          },
          email_config: { from_name: fromName, from_email: fromEmail },
        },
      })
      .eq('id', tenantId)
    if (!error) {
      await refetchTenant()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Configure the email sent when you click "Nice to meet you" on a contact. Use{' '}
        <code className="bg-slate-100 px-1 rounded text-xs font-mono">{'{{first_name}}'}</code>
        {' '}and{' '}
        <code className="bg-slate-100 px-1 rounded text-xs font-mono">{'{{last_name}}'}</code>
        {' '}as placeholders in the subject and body.
      </p>

      {/* ── Sender ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Your name</label>
          <input
            value={fromName}
            onChange={e => { setFromName(e.target.value); setSaved(false) }}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Martin at Viva Retirement"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Your email</label>
          <input
            type="email"
            value={fromEmail}
            onChange={e => { setFromEmail(e.target.value); setSaved(false) }}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. martin@viva.co.uk"
          />
        </div>
      </div>

      {/* ── Template ── */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">Subject line</label>
        <input
          value={subject}
          onChange={e => { setSubject(e.target.value); setSaved(false) }}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. Great to connect, {{first_name}}"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">Body</label>
        <textarea
          value={body}
          onChange={e => { setBody(e.target.value); setSaved(false) }}
          rows={12}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
          placeholder={'Hi {{first_name}},\n\nIt was great to meet you.\n\nBest,'}
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
          saved
            ? 'bg-green-600 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
        )}
      >
        {saved ? <><Check size={14} /> Saved</> : saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}

// ─── Account Panel ───────────────────────────────────────────────────────────
function AccountPanel({ tenantId }: { tenantId: string }) {
  const { tenant, refetchTenant } = useTenant()
  const [notificationEmail, setNotificationEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  // Business Profile state
  const [bpDescription, setBpDescription]   = useState('')
  const [bpTone, setBpTone]                 = useState('professional')
  const [bpResponseTime, setBpResponseTime] = useState('')
  const [bpSignoff, setBpSignoff]           = useState('')
  const [bpSaving, setBpSaving]             = useState(false)
  const [bpSaved, setBpSaved]               = useState(false)

  useEffect(() => {
    const s = (tenant?.settings ?? {}) as Record<string, unknown>
    setNotificationEmail((s.notification_email as string) ?? '')
    const bp = (s.business_profile ?? {}) as Record<string, string>
    setBpDescription(bp.description ?? '')
    setBpTone(bp.tone ?? 'professional')
    setBpResponseTime(bp.response_time ?? '')
    setBpSignoff(bp.signoff_name ?? '')
  }, [tenant])

  async function save() {
    setSaving(true)
    const currentSettings = (tenant?.settings as Record<string, unknown>) ?? {}
    await supabase
      .from('tenants')
      .update({
        settings: { ...currentSettings, notification_email: notificationEmail },
      })
      .eq('id', tenantId)
    await refetchTenant()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  async function saveBusinessProfile() {
    setBpSaving(true)
    const currentSettings = (tenant?.settings as Record<string, unknown>) ?? {}
    await supabase
      .from('tenants')
      .update({
        settings: {
          ...currentSettings,
          business_profile: {
            description: bpDescription,
            tone: bpTone,
            response_time: bpResponseTime,
            signoff_name: bpSignoff,
          },
        },
      })
      .eq('id', tenantId)
    await refetchTenant()
    setBpSaved(true)
    setTimeout(() => setBpSaved(false), 2000)
    setBpSaving(false)
  }

  return (
    <div className="space-y-10">
      {/* Notification email */}
      <div className="max-w-md space-y-5">
        <p className="text-sm text-slate-500">
          System notifications (e.g. new enquiries) will be sent to this address.
        </p>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Notification email
          </label>
          <input
            type="email"
            value={notificationEmail}
            onChange={e => { setNotificationEmail(e.target.value); setSaved(false) }}
            onKeyDown={e => { if (e.key === 'Enter') save() }}
            placeholder="e.g. you@yourcompany.com"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
          )}
        >
          {saved ? <><Check size={14} /> Saved</> : saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Business Profile */}
      <div className="max-w-md space-y-5 border-t border-slate-200 pt-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Business Profile</h3>
          <p className="text-xs text-slate-500">
            This is used by BookableCRM's AI to draft replies to new enquiries. The more specific you are, the better the drafts.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Business description
          </label>
          <textarea
            value={bpDescription}
            onChange={e => { setBpDescription(e.target.value); setBpSaved(false) }}
            rows={3}
            placeholder="e.g. We're a financial planning practice based in Manchester, working with professionals and small business owners on pensions, protection, and investment."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Tone</label>
          <select
            value={bpTone}
            onChange={e => { setBpTone(e.target.value); setBpSaved(false) }}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Typical response time
          </label>
          <input
            value={bpResponseTime}
            onChange={e => { setBpResponseTime(e.target.value); setBpSaved(false) }}
            placeholder="e.g. within a few hours"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Sign-off name
          </label>
          <input
            value={bpSignoff}
            onChange={e => { setBpSignoff(e.target.value); setBpSaved(false) }}
            placeholder='e.g. Sarah or "The team at Acme Ltd"'
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={saveBusinessProfile}
          disabled={bpSaving}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            bpSaved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
          )}
        >
          {bpSaved ? <><Check size={14} /> Saved</> : bpSaving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

// ─── Widget Embed Panel ──────────────────────────────────────────────────────
function WidgetPanel({ tenantId }: { tenantId: string }) {
  const { tenant, refetchTenant } = useTenant()
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [copied, setCopied]       = useState<string | null>(null)
  const [confirmRegen, setConfirmRegen] = useState(false)

  const settings     = (tenant?.settings ?? {}) as Record<string, unknown>
  const embedKey     = (settings.embed_key as string) ?? ''
  const widgetConfig = (settings.widget_config ?? {}) as Record<string, unknown>
  const fields       = (widgetConfig.fields ?? {}) as Record<string, boolean>

  const [title, setTitle]             = useState((widgetConfig.title as string)           ?? 'Get in touch')
  const [submitLabel, setSubmitLabel] = useState((widgetConfig.submit_label as string)    ?? 'Send enquiry')
  const [successMsg, setSuccessMsg]   = useState((widgetConfig.success_message as string) ?? "Thanks! We'll be in touch shortly.")
  const [nameOn, setNameOn]           = useState(fields.name    !== false)
  const [phoneOn, setPhoneOn]         = useState(fields.phone   === true)
  const [messageOn, setMessageOn]     = useState(fields.message !== false)
  const [buttonColor, setButtonColor] = useState((widgetConfig.button_color as string) ?? '#2563eb')

  // Re-sync when tenant data changes (e.g. after key generation)
  useEffect(() => {
    const s  = (tenant?.settings ?? {}) as Record<string, unknown>
    const wc = (s.widget_config ?? {}) as Record<string, unknown>
    const f  = (wc.fields ?? {}) as Record<string, boolean>
    setTitle((wc.title as string)           ?? 'Get in touch')
    setSubmitLabel((wc.submit_label as string)    ?? 'Send enquiry')
    setSuccessMsg((wc.success_message as string) ?? "Thanks! We'll be in touch shortly.")
    setNameOn(f.name    !== false)
    setPhoneOn(f.phone  === true)
    setMessageOn(f.message !== false)
    setButtonColor((wc.button_color as string) ?? '#2563eb')
  }, [tenant])

  async function generateKey() {
    const currentSettings = (tenant?.settings as Record<string, unknown>) ?? {}
    const newKey = crypto.randomUUID()
    await supabase
      .from('tenants')
      .update({ settings: { ...currentSettings, embed_key: newKey } })
      .eq('id', tenantId)
    await refetchTenant()
    setConfirmRegen(false)
  }

  async function saveConfig() {
    setSaving(true)
    const currentSettings = (tenant?.settings as Record<string, unknown>) ?? {}
    await supabase
      .from('tenants')
      .update({
        settings: {
          ...currentSettings,
          widget_config: {
            title,
            submit_label: submitLabel,
            success_message: successMsg,
            fields: { name: nameOn, email: true, phone: phoneOn, message: messageOn },
            button_color: buttonColor,
          },
        },
      })
      .eq('id', tenantId)
    await refetchTenant()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

  return (
    <div className="space-y-8">
      {/* ── Embed Key ── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Embed Key</h3>
        <p className="text-xs text-slate-500 mb-3">
          This key identifies your account when the form is embedded on external sites.
        </p>

        {embedKey ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-700 truncate">
              {embedKey}
            </code>
            <button
              onClick={() => copyToClipboard(embedKey, 'key')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg transition-colors shrink-0"
            >
              {copied === 'key' ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
            {confirmRegen ? (
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-red-600 mr-1">This will break existing embeds.</span>
                <button onClick={generateKey} className="text-xs font-medium text-red-600 hover:text-red-700">Regenerate</button>
                <span className="text-slate-300">/</span>
                <button onClick={() => setConfirmRegen(false)} className="text-xs font-medium text-slate-500 hover:text-slate-700">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmRegen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg transition-colors shrink-0"
                title="Generate a new key (invalidates previous)"
              >
                <RefreshCw size={12} /> Regenerate
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={generateKey}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Generate embed key
          </button>
        )}
      </div>

      {/* ── Form Fields ── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Form Fields</h3>
        <p className="text-xs text-slate-500 mb-4">
          Choose which fields appear on the embedded form.
        </p>

        <div className="space-y-3 mb-5">
          {/* Name toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={nameOn} onChange={e => setNameOn(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-slate-700">Name</span>
          </label>

          {/* Email — always on */}
          <label className="flex items-center gap-3 opacity-60 cursor-not-allowed">
            <input type="checkbox" checked disabled
              className="w-4 h-4 rounded border-slate-300 text-blue-600" />
            <span className="text-sm text-slate-700">Email</span>
            <Lock size={11} className="text-slate-400" />
          </label>

          {/* Phone toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={phoneOn} onChange={e => setPhoneOn(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-slate-700">Phone</span>
          </label>

          {/* Message toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={messageOn} onChange={e => setMessageOn(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-slate-700">Message</span>
          </label>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Form title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Submit button label</label>
            <input value={submitLabel} onChange={e => setSubmitLabel(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Success message</label>
            <input value={successMsg} onChange={e => setSuccessMsg(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Button colour</label>
            <div className="flex items-center gap-3">
              <label className="relative cursor-pointer shrink-0">
                <span
                  className="block w-9 h-9 rounded-lg border-2 border-white shadow"
                  style={{ backgroundColor: buttonColor }}
                />
                <input
                  type="color"
                  value={buttonColor}
                  onChange={e => setButtonColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </label>
              <input
                type="text"
                value={buttonColor}
                onChange={e => setButtonColor(e.target.value)}
                maxLength={7}
                className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#2563eb"
              />
            </div>
          </div>
        </div>

        <button
          onClick={saveConfig}
          disabled={saving}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors mt-5',
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
          )}
        >
          {saved ? <><Check size={14} /> Saved</> : saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* ── Embed Instructions ── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Embed Instructions</h3>

        {/* Embed snippet — primary method */}
        <div className="border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Code2 size={14} className="text-slate-500" />
            <p className="text-sm font-medium text-slate-800">Add to any website</p>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Paste this single line into any page — WordPress, Squarespace, Wix, or plain HTML.
            The form will appear wherever you place it.
          </p>
          {embedKey ? (
            <div className="relative">
              <pre className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap">{`<script src="${supabaseUrl}/functions/v1/widget-embed?key=${embedKey}"></script>`}</pre>
              <button
                onClick={() => copyToClipboard(`<script src="${supabaseUrl}/functions/v1/widget-embed?key=${embedKey}"></script>`, 'snippet')}
                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded transition-colors"
              >
                {copied === 'snippet' ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Generate an embed key first to see the snippet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function SettingsPage() {
  const { tenant } = useTenant()
  const tenantId = tenant?.id ?? null
  const { stages } = usePipelineStages(tenantId)
  const [tab, setTab] = useState<Tab>('pipeline')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'account',       label: 'Account'          },
    { id: 'pipeline',      label: 'Pipeline Stages' },
    { id: 'documents',     label: 'Document Types'  },
    { id: 'branding',      label: 'Branding'        },
    { id: 'integrations',  label: 'Integrations'    },
    { id: 'email_formats', label: 'Email Formats'   },
    { id: 'widget',        label: 'Widget'          },
  ]

  // Open integrations tab if redirected back from Google OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam === 'integrations') setTab('integrations')
    if (tabParam === 'widget') setTab('widget')
  }, [])

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Settings</h1>
      <p className="text-slate-500 text-sm mb-6">{tenant?.name}</p>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {!tenantId ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : tab === 'account' ? (
          <AccountPanel tenantId={tenantId} />
        ) : tab === 'pipeline' ? (
          <PipelinePanel
            tenantId={tenantId}
            initialConversionStageId={tenant?.case_conversion_stage_id ?? null}
          />
        ) : tab === 'documents' ? (
          <DocumentTypesPanel tenantId={tenantId} stages={stages} />
        ) : tab === 'integrations' ? (
          <IntegrationsPanel tenantId={tenantId} />
        ) : tab === 'email_formats' ? (
          <EmailFormatsPanel tenantId={tenantId} />
        ) : tab === 'widget' ? (
          <WidgetPanel tenantId={tenantId} />
        ) : (
          <BrandingPanel
            tenantId={tenantId}
            initialName={tenant?.branding?.companyName ?? tenant?.name ?? ''}
          />
        )}
      </div>
    </div>
  )
}
