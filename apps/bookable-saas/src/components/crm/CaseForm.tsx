import { useState } from 'react'
import { X } from 'lucide-react'
import type { Contact, PipelineStage } from '@/types'

interface Props {
  contacts: Contact[]
  stages: PipelineStage[]
  onSubmit: (values: {
    title: string
    contact_id: string
    stage_id: string | null
    notes: string | null
  }) => Promise<{ error: string | null }>
  onClose: () => void
  initialContactId?: string
}

export function CaseForm({ contacts, stages, onSubmit, onClose, initialContactId }: Props) {
  const [title, setTitle]         = useState('')
  const [contactId, setContactId] = useState(initialContactId ?? '')
  const [stageId, setStageId]     = useState(stages[0]?.id ?? '')
  const [notes, setNotes]         = useState('')
  const [saving, setSaving]       = useState(false)
  const [err, setErr]             = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !contactId) return
    setSaving(true)
    const { error } = await onSubmit({
      title: title.trim(),
      contact_id: contactId,
      stage_id: stageId || null,
      notes: notes.trim() || null,
    })
    setSaving(false)
    if (error) { setErr(error); return }
    onClose()
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelCls = 'block text-xs font-medium text-slate-700 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">New Case</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Case title <span className="text-red-500">*</span></label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Equity Release Application"
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Contact <span className="text-red-500">*</span></label>
            <select
              value={contactId}
              onChange={e => setContactId(e.target.value)}
              className={inputCls}
              required
            >
              <option value="">Select a contact…</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}{c.email ? ` — ${c.email}` : ''}
                </option>
              ))}
            </select>
          </div>

          {stages.length > 0 && (
            <div>
              <label className={labelCls}>Pipeline stage</label>
              <select
                value={stageId}
                onChange={e => setStageId(e.target.value)}
                className={inputCls}
              >
                <option value="">No stage</option>
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="Initial notes about this case…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {err && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{err}</p>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={saving || !title.trim() || !contactId}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? 'Creating…' : 'Create Case'}
          </button>
        </div>
      </div>
    </div>
  )
}
