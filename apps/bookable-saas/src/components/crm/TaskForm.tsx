import { useState } from 'react'
import { X } from 'lucide-react'
import type { Contact, Case, PipelineStage, Task, TaskStatus, TaskPriority } from '@/types'

interface Props {
  contacts: Contact[]
  cases: Case[]
  stages: PipelineStage[]
  onSubmit: (values: Partial<Task>) => Promise<{ error: string | null }>
  onClose: () => void
  initial?: Partial<Task>
}

export function TaskForm({ contacts, cases, stages, onSubmit, onClose, initial }: Props) {
  const [title, setTitle]               = useState(initial?.title ?? '')
  const [description, setDescription]   = useState(initial?.description ?? '')
  const [status, setStatus]             = useState<TaskStatus>(initial?.status ?? 'open')
  const [priority, setPriority]         = useState<TaskPriority>(initial?.priority ?? 'medium')
  const [dueDate, setDueDate]           = useState(initial?.due_date ?? '')
  const [contactId, setContactId]       = useState(initial?.contact_id ?? '')
  const [caseId, setCaseId]             = useState(initial?.case_id ?? '')
  const [stageId, setStageId]           = useState(initial?.pipeline_stage_id ?? '')
  const [saving, setSaving]             = useState(false)
  const [err, setErr]                   = useState<string | null>(null)

  // Filter cases to selected contact
  const filteredCases = contactId
    ? cases.filter(c => c.contact_id === contactId)
    : cases

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const { error } = await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      due_date: dueDate || null,
      contact_id: contactId || null,
      case_id: caseId || null,
      pipeline_stage_id: stageId || null,
    })
    setSaving(false)
    if (error) { setErr(error); return }
    onClose()
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelCls = 'block text-xs font-medium text-slate-700 mb-1'
  const isEdit = !!initial?.id

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />

      <div className="w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Title <span className="text-red-500">*</span></label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Send follow-up email"
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Task details…"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className={inputCls}>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className={inputCls}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Contact</label>
            <select
              value={contactId}
              onChange={e => { setContactId(e.target.value); setCaseId('') }}
              className={inputCls}
            >
              <option value="">None</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}{c.email ? ` — ${c.email}` : ''}
                </option>
              ))}
            </select>
          </div>

          {filteredCases.length > 0 && (
            <div>
              <label className={labelCls}>Case</label>
              <select value={caseId} onChange={e => setCaseId(e.target.value)} className={inputCls}>
                <option value="">None</option>
                {filteredCases.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          {stages.length > 0 && (
            <div>
              <label className={labelCls}>Pipeline stage</label>
              <select value={stageId} onChange={e => setStageId(e.target.value)} className={inputCls}>
                <option value="">No stage</option>
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {err && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{err}</p>
          )}
        </form>

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
            disabled={saving || !title.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
