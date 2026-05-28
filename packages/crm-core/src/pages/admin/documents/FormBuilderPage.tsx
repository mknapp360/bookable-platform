import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown,
  Check, Save, FileText, Type, Calendar, MessageSquare,
  Mail, ChevronRight, ChevronLeft, ListFilter, X
} from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import { useFormTemplates } from '@/hooks/useFormTemplates'
import { cn } from '@/lib/cn'
import type { FormSchema, FormPage, FormField, FormFieldType } from '@/types'

const FIELD_TYPES: { value: FormFieldType; label: string; icon: typeof Type }[] = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'message', label: 'Message', icon: MessageSquare },
  { value: 'dropdown', label: 'Dropdown', icon: ListFilter },
]

function newId(): string {
  return crypto.randomUUID()
}

function newField(order: number): FormField {
  return { id: newId(), label: '', type: 'text', required: false, order }
}

function newPage(order: number): FormPage {
  return { id: newId(), title: `Page ${order + 1}`, order, fields: [newField(0)] }
}

// ─── Field Row ───────────────────────────────────────────────────────────────
function FieldRow({
  field,
  isFirst,
  isLast,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  field: FormField
  isFirst: boolean
  isLast: boolean
  onUpdate: (updates: Partial<FormField>) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}) {
  const fieldType = FIELD_TYPES.find(ft => ft.value === field.type)
  const Icon = fieldType?.icon ?? Type

  const isDropdown = field.type === 'dropdown'
  const options = field.options ?? []

  function handleTypeChange(newType: FormFieldType) {
    const updates: Partial<FormField> = { type: newType }
    if (newType === 'dropdown' && (!field.options || field.options.length === 0)) {
      updates.options = ['Option 1']
    }
    onUpdate(updates)
  }

  function addOption() {
    onUpdate({ options: [...options, `Option ${options.length + 1}`] })
  }

  function updateOption(idx: number, value: string) {
    const next = [...options]
    next[idx] = value
    onUpdate({ options: next })
  }

  function removeOption(idx: number) {
    onUpdate({ options: options.filter((_, i) => i !== idx) })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 space-y-2">
      <div className="flex items-center gap-3">
        <Icon size={14} className="text-slate-400 shrink-0" />
        <input
          value={field.label}
          onChange={e => onUpdate({ label: e.target.value })}
          placeholder="Field label…"
          className="flex-1 text-sm border-0 outline-none bg-transparent text-slate-800 placeholder:text-slate-300"
        />
        <select
          value={field.type}
          onChange={e => handleTypeChange(e.target.value as FormFieldType)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shrink-0"
        >
          {FIELD_TYPES.map(ft => (
            <option key={ft.value} value={ft.value}>{ft.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
          <input
            type="checkbox"
            checked={field.required}
            onChange={e => onUpdate({ required: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs text-slate-500">Required</span>
        </label>
        <div className="flex flex-col shrink-0">
          <button onClick={onMoveUp} disabled={isFirst} className="disabled:opacity-20 text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronUp size={13} />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="disabled:opacity-20 text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronDown size={13} />
          </button>
        </div>
        <button onClick={onDelete} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
          <Trash2 size={13} />
        </button>
      </div>

      {/* Dropdown options editor */}
      {isDropdown && (
        <div className="pl-7 space-y-1.5">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-4 text-right shrink-0">{idx + 1}.</span>
              <input
                value={opt}
                onChange={e => updateOption(idx, e.target.value)}
                className="flex-1 text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Option label…"
              />
              <button
                onClick={() => removeOption(idx)}
                disabled={options.length <= 1}
                className="text-slate-300 hover:text-red-500 disabled:opacity-20 transition-colors shrink-0"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <button
            onClick={addOption}
            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <Plus size={10} /> Add option
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Page Card ───────────────────────────────────────────────────────────────
function PageCard({
  page,
  pageIndex,
  isFirst,
  isLast,
  onUpdatePage,
  onDeletePage,
  onMovePageUp,
  onMovePageDown,
  onUpdateField,
  onAddField,
  onDeleteField,
  onMoveFieldUp,
  onMoveFieldDown,
}: {
  page: FormPage
  pageIndex: number
  isFirst: boolean
  isLast: boolean
  onUpdatePage: (updates: Partial<FormPage>) => void
  onDeletePage: () => void
  onMovePageUp: () => void
  onMovePageDown: () => void
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void
  onAddField: () => void
  onDeleteField: (fieldId: string) => void
  onMoveFieldUp: (fieldId: string) => void
  onMoveFieldDown: (fieldId: string) => void
}) {
  const sortedFields = [...page.fields].sort((a, b) => a.order - b.order)

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
          {pageIndex + 1}
        </span>
        <input
          value={page.title}
          onChange={e => onUpdatePage({ title: e.target.value })}
          placeholder="Page title…"
          className="flex-1 text-sm font-semibold border-0 outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
        />
        <div className="flex flex-col shrink-0">
          <button onClick={onMovePageUp} disabled={isFirst} className="disabled:opacity-20 text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronUp size={14} />
          </button>
          <button onClick={onMovePageDown} disabled={isLast} className="disabled:opacity-20 text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronDown size={14} />
          </button>
        </div>
        <button onClick={onDeletePage} className="text-slate-300 hover:text-red-500 transition-colors shrink-0" title="Delete page">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Fields */}
      <div className="space-y-2 mb-3">
        {sortedFields.map((field, idx) => (
          <FieldRow
            key={field.id}
            field={field}
            isFirst={idx === 0}
            isLast={idx === sortedFields.length - 1}
            onUpdate={updates => onUpdateField(field.id, updates)}
            onMoveUp={() => onMoveFieldUp(field.id)}
            onMoveDown={() => onMoveFieldDown(field.id)}
            onDelete={() => onDeleteField(field.id)}
          />
        ))}
      </div>

      {/* Add field */}
      <button
        onClick={onAddField}
        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <Plus size={12} /> Add field
      </button>
    </div>
  )
}

// ─── Live Preview ────────────────────────────────────────────────────────────
function FormPreview({ name, schema }: { name: string; schema: FormSchema }) {
  const sortedPages = [...schema.pages].sort((a, b) => a.order - b.order)
  const [previewPage, setPreviewPage] = useState(0)

  // Clamp preview page if pages are removed
  const clampedPage = Math.min(previewPage, Math.max(sortedPages.length - 1, 0))
  if (clampedPage !== previewPage) setPreviewPage(clampedPage)

  const currentPage = sortedPages[clampedPage]
  const totalPages = sortedPages.length

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-8">
      {/* Preview header */}
      <div className="px-5 py-3 border-b border-slate-100">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Live Preview</p>
      </div>

      {/* Form content */}
      <div className="p-5">
        {/* Form title */}
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          {name || 'Untitled Form'}
        </h3>
        {totalPages > 1 && (
          <p className="text-xs text-slate-400 mb-4">Page {clampedPage + 1} of {totalPages}</p>
        )}

        {!currentPage ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">Add a page to get started</p>
        ) : (
          <>
            {/* Page title */}
            {currentPage.title && (
              <p className="text-sm font-medium text-slate-700 mb-4">{currentPage.title}</p>
            )}

            {/* Fields */}
            <div className="space-y-4">
              {[...currentPage.fields].sort((a, b) => a.order - b.order).map(field => (
                <div key={field.id}>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {field.label || 'Untitled field'}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {field.type === 'message' ? (
                    <textarea
                      disabled
                      rows={3}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase() || 'text'}…`}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400 resize-none"
                    />
                  ) : field.type === 'date' ? (
                    <input
                      type="date"
                      disabled
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400"
                    />
                  ) : field.type === 'email' ? (
                    <input
                      type="email"
                      disabled
                      placeholder={field.placeholder || 'name@example.com'}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400"
                    />
                  ) : field.type === 'dropdown' ? (
                    <select
                      disabled
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400"
                    >
                      <option value="">Select…</option>
                      {(field.options ?? []).map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase() || 'text'}…`}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400"
                    />
                  )}
                </div>
              ))}
              {currentPage.fields.length === 0 && (
                <p className="text-xs text-slate-400 italic py-4 text-center">No fields on this page yet</p>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              {totalPages > 1 ? (
                <>
                  <button
                    onClick={() => setPreviewPage(p => Math.max(0, p - 1))}
                    disabled={clampedPage === 0}
                    className="flex items-center gap-1 text-xs font-medium text-slate-500 disabled:opacity-30 hover:text-slate-700 transition-colors"
                  >
                    <ChevronLeft size={12} /> Previous
                  </button>
                  {clampedPage < totalPages - 1 ? (
                    <button
                      onClick={() => setPreviewPage(p => Math.min(totalPages - 1, p + 1))}
                      className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg"
                    >
                      Next <ChevronRight size={12} />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg opacity-80"
                    >
                      Submit
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div />
                  <button
                    disabled
                    className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg opacity-80"
                  >
                    Submit
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function FormBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const tenantId = tenant?.id ?? null
  const { templates, createFormTemplate, updateFormTemplate } = useFormTemplates(tenantId)

  const isEditing = !!id
  const existing = templates.find(t => t.id === id)

  const [name, setName] = useState('')
  const [schema, setSchema] = useState<FormSchema>({ pages: [newPage(0)] })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Load existing form when editing
  useEffect(() => {
    if (isEditing && existing && !initialized) {
      setName(existing.name)
      setSchema(existing.schema)
      setInitialized(true)
    }
  }, [isEditing, existing, initialized])

  // ── Schema helpers ──────────────────────────────────────────────────────
  const updatePages = useCallback((updater: (pages: FormPage[]) => FormPage[]) => {
    setSchema(prev => ({ pages: updater(prev.pages) }))
    setSaved(false)
  }, [])

  function addPage() {
    updatePages(pages => [...pages, newPage(pages.length)])
  }

  function deletePage(pageId: string) {
    updatePages(pages => pages.filter(p => p.id !== pageId).map((p, i) => ({ ...p, order: i })))
  }

  function updatePage(pageId: string, updates: Partial<FormPage>) {
    updatePages(pages => pages.map(p => p.id === pageId ? { ...p, ...updates } : p))
  }

  function movePageUp(pageId: string) {
    updatePages(pages => {
      const idx = pages.findIndex(p => p.id === pageId)
      if (idx <= 0) return pages
      const next = [...pages];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next.map((p, i) => ({ ...p, order: i }))
    })
  }

  function movePageDown(pageId: string) {
    updatePages(pages => {
      const idx = pages.findIndex(p => p.id === pageId)
      if (idx < 0 || idx >= pages.length - 1) return pages
      const next = [...pages];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next.map((p, i) => ({ ...p, order: i }))
    })
  }

  function addField(pageId: string) {
    updatePages(pages => pages.map(p =>
      p.id === pageId ? { ...p, fields: [...p.fields, newField(p.fields.length)] } : p
    ))
  }

  function updateField(pageId: string, fieldId: string, updates: Partial<FormField>) {
    updatePages(pages => pages.map(p =>
      p.id === pageId
        ? { ...p, fields: p.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f) }
        : p
    ))
  }

  function deleteField(pageId: string, fieldId: string) {
    updatePages(pages => pages.map(p =>
      p.id === pageId
        ? { ...p, fields: p.fields.filter(f => f.id !== fieldId).map((f, i) => ({ ...f, order: i })) }
        : p
    ))
  }

  function moveFieldUp(pageId: string, fieldId: string) {
    updatePages(pages => pages.map(p => {
      if (p.id !== pageId) return p
      const sorted = [...p.fields].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex(f => f.id === fieldId)
      if (idx <= 0) return p;
      [sorted[idx - 1], sorted[idx]] = [sorted[idx], sorted[idx - 1]]
      return { ...p, fields: sorted.map((f, i) => ({ ...f, order: i })) }
    }))
  }

  function moveFieldDown(pageId: string, fieldId: string) {
    updatePages(pages => pages.map(p => {
      if (p.id !== pageId) return p
      const sorted = [...p.fields].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex(f => f.id === fieldId)
      if (idx < 0 || idx >= sorted.length - 1) return p;
      [sorted[idx], sorted[idx + 1]] = [sorted[idx + 1], sorted[idx]]
      return { ...p, fields: sorted.map((f, i) => ({ ...f, order: i })) }
    }))
  }

  // ── Save ────────────────────────────────────────────────────────────────
  async function handleSave(status?: 'draft' | 'published') {
    if (!name.trim()) return
    setSaving(true)

    if (isEditing && id) {
      const updates: { name: string; schema: FormSchema; status?: 'draft' | 'published' } = { name: name.trim(), schema }
      if (status) updates.status = status
      await updateFormTemplate(id, updates)
    } else {
      const template = await createFormTemplate(name.trim(), schema)
      if (template) {
        if (status) await updateFormTemplate(template.id, { status })
        navigate(`/documents/forms/${template.id}/edit`, { replace: true })
      }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sortedPages = [...schema.pages].sort((a, b) => a.order - b.order)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Documents
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving || !name.trim()}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50'
            )}
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving || !name.trim()}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              saved
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
            )}
          >
            {saved ? <><Check size={14} /> Saved</> : <><FileText size={14} /> Publish</>}
          </button>
        </div>
      </div>

      {/* Two-column layout: builder + preview */}
      <div className="grid grid-cols-5 gap-6">
        {/* Left: Builder (3/5) */}
        <div className="col-span-3">
          {/* Form name */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Form name</label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setSaved(false) }}
              placeholder="e.g. Client Onboarding Questionnaire"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pages */}
          <div className="space-y-5">
            {sortedPages.map((page, idx) => (
              <PageCard
                key={page.id}
                page={page}
                pageIndex={idx}
                isFirst={idx === 0}
                isLast={idx === sortedPages.length - 1}
                onUpdatePage={updates => updatePage(page.id, updates)}
                onDeletePage={() => deletePage(page.id)}
                onMovePageUp={() => movePageUp(page.id)}
                onMovePageDown={() => movePageDown(page.id)}
                onUpdateField={(fieldId, updates) => updateField(page.id, fieldId, updates)}
                onAddField={() => addField(page.id)}
                onDeleteField={fieldId => deleteField(page.id, fieldId)}
                onMoveFieldUp={fieldId => moveFieldUp(page.id, fieldId)}
                onMoveFieldDown={fieldId => moveFieldDown(page.id, fieldId)}
              />
            ))}
          </div>

          {/* Add page */}
          <button
            onClick={addPage}
            className="flex items-center gap-2 w-full px-4 py-3 mt-5 border border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors"
          >
            <Plus size={14} /> Add page
          </button>
        </div>

        {/* Right: Live Preview (2/5) */}
        <div className="col-span-2">
          <FormPreview name={name} schema={schema} />
        </div>
      </div>
    </div>
  )
}
