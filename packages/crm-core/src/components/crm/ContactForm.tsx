import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Contact, ContactStatus, ContactSource } from '@/types'

interface ContactFormProps {
  initial?: Partial<Contact>
  onSubmit: (values: Partial<Contact>) => Promise<{ error: string | null }>
  onClose: () => void
}

const statusOptions: { value: ContactStatus; label: string }[] = [
  { value: 'lead',     label: 'Lead'     },
  { value: 'active',   label: 'Active'   },
  { value: 'inactive', label: 'Inactive' },
  { value: 'closed',   label: 'Closed'   },
]

const sourceOptions: { value: ContactSource; label: string }[] = [
  { value: 'manual',   label: 'Manual entry' },
  { value: 'website',  label: 'Website'      },
  { value: 'referral', label: 'Referral'     },
  { value: 'phone',    label: 'Phone'        },
  { value: 'email',    label: 'Email'        },
  { value: 'other',    label: 'Other'        },
]

export function ContactForm({ initial, onSubmit, onClose }: ContactFormProps) {
  const [values, setValues] = useState({
    first_name: initial?.first_name ?? '',
    last_name:  initial?.last_name  ?? '',
    email:      initial?.email      ?? '',
    phone:      initial?.phone      ?? '',
    status:     initial?.status     ?? 'lead' as ContactStatus,
    source:     initial?.source     ?? 'manual' as ContactSource,
    notes:      initial?.notes      ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function set(field: string, value: string) {
    setValues(v => ({ ...v, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error } = await onSubmit(values)
    setSaving(false)
    if (error) setError(error)
    else onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {initial?.id ? 'Edit Contact' : 'Add Contact'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">First name *</label>
              <input required value={values.first_name} onChange={e => set('first_name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Last name *</label>
              <input required value={values.last_name} onChange={e => set('last_name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
            <input type="email" value={values.email} onChange={e => set('email', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Phone</label>
            <input type="tel" value={values.phone} onChange={e => set('phone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Status</label>
              <select value={values.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Source</label>
              <select value={values.source} onChange={e => set('source', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {sourceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Notes</label>
            <textarea rows={4} value={values.notes} onChange={e => set('notes', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors',
                saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              )}>
              {saving ? 'Saving...' : (initial?.id ? 'Save changes' : 'Add contact')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
