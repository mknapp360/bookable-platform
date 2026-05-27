import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, Phone, Mail, Upload, Download, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import { useContacts } from '@/hooks/useContacts'
import { usePipelineStages } from '@/hooks/usePipelineStages'
import { ContactForm } from '@/components/crm/ContactForm'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import type { ContactStatus, ContactSource } from '@/types'

const CSV_TEMPLATE_HEADER = 'first_name,last_name,email,phone,source,status,notes'
const CSV_TEMPLATE_ROWS = [
  CSV_TEMPLATE_HEADER,
  'John,Doe,john@example.com,+44 1234 567890,referral,lead,"Initial enquiry about services"',
  'Jane,Smith,jane@example.com,,website,active,',
  'Bob,Johnson,,+44 9876 543210,phone,lead,"Called to ask about pricing"',
].join('\n')

const VALID_SOURCES: ContactSource[] = ['website', 'referral', 'manual', 'phone', 'email', 'other']
const VALID_STATUSES: ContactStatus[] = ['lead', 'active', 'inactive', 'closed']

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE_ROWS], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'contacts-template.csv'; a.click()
  URL.revokeObjectURL(url)
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase())
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (values[i] ?? '').trim() })
    return row
  })
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++ }
      else if (ch === '"') { inQuotes = false }
      else { current += ch }
    } else {
      if (ch === '"') { inQuotes = true }
      else if (ch === ',') { result.push(current); current = '' }
      else { current += ch }
    }
  }
  result.push(current)
  return result
}

const statusColour: Record<ContactStatus, string> = {
  lead:     'bg-violet-100 text-violet-700',
  active:   'bg-green-100  text-green-700',
  inactive: 'bg-slate-100  text-slate-600',
  closed:   'bg-red-100    text-red-600',
}

export function ContactsPage() {
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const { contacts, loading, addContact, refetch } = useContacts(tenant?.id ?? null)
  const { stages } = usePipelineStages(tenant?.id ?? null)

  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all')
  const [stageFilter, setStageFilter]   = useState<string>('all')
  const [showForm, setShowForm]         = useState(false)
  const [importing, setImporting]       = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; skipped: number; errors: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleCsvUpload(file: File) {
    if (!tenant?.id) return
    setImporting(true)
    setImportResult(null)
    const text = await file.text()
    const rows = parseCsv(text)
    let success = 0; let skipped = 0; const errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      const lineNum = i + 2 // +2 for header row + 0-index

      if (!r.first_name && !r.last_name) { skipped++; continue }
      if (!r.first_name) { errors.push(`Row ${lineNum}: missing first_name`); continue }
      if (!r.last_name) { errors.push(`Row ${lineNum}: missing last_name`); continue }

      const source = r.source?.toLowerCase() as ContactSource
      const status = r.status?.toLowerCase() as ContactStatus

      const { error } = await supabase.from('contacts').insert({
        tenant_id: tenant.id,
        first_name: r.first_name,
        last_name: r.last_name,
        email: r.email || null,
        phone: r.phone || null,
        source: VALID_SOURCES.includes(source) ? source : 'manual',
        status: VALID_STATUSES.includes(status) ? status : 'lead',
        notes: r.notes || null,
      } as never)

      if (error) { errors.push(`Row ${lineNum}: ${error.message}`) }
      else { success++ }
    }

    setImportResult({ success, skipped, errors })
    if (success > 0) await refetch()
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const filtered = contacts.filter(c => {
    const matchSearch = search === '' || [c.first_name, c.last_name, c.email, c.phone]
      .join(' ').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchStage  = stageFilter === 'all'
      ? true
      : stageFilter === 'none'
        ? !c.pipeline_stage_id
        : c.pipeline_stage_id === stageFilter
    return matchSearch && matchStatus && matchStage
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} in {tenant?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-lg transition-colors"
          >
            <Download size={14} />
            CSV Template
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Upload size={14} />
            {importing ? 'Importing…' : 'Import CSV'}
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleCsvUpload(f) }} />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <UserPlus size={16} />
            Add Contact
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1.5">
          {(['all', 'lead', 'active', 'inactive', 'closed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                statusFilter === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Stage filter — only show if tenant has stages */}
        {stages.length > 0 && (
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All stages</option>
            <option value="none">No stage</option>
            {stages.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Import result banner */}
      {importResult && (
        <div className={cn('flex items-start justify-between gap-3 rounded-lg border px-4 py-3 mb-5 text-sm', importResult.errors.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-green-50 border-green-200 text-green-800')}>
          <div>
            <div className="flex items-center gap-2 font-medium">
              {importResult.errors.length > 0 ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
              {importResult.success} contact{importResult.success !== 1 ? 's' : ''} imported{importResult.skipped > 0 ? `, ${importResult.skipped} empty rows skipped` : ''}
            </div>
            {importResult.errors.length > 0 && (
              <ul className="mt-1 text-xs space-y-0.5 ml-5">{importResult.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            )}
          </div>
          <button onClick={() => setImportResult(null)} className="shrink-0 mt-0.5 text-current opacity-50 hover:opacity-80"><X size={14} /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading contacts…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {contacts.length === 0 ? 'No contacts yet. Add your first one.' : 'No contacts match your search.'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Name</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Contact</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Stage</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Source</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(contact => (
                <tr
                  key={contact.id}
                  onClick={() => navigate(`/contacts/${contact.id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {contact.first_name[0]}{contact.last_name[0]}
                      </div>
                      <span className="font-medium text-slate-900 text-sm">
                        {contact.first_name} {contact.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="space-y-0.5">
                      {contact.email && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail size={11} /> {contact.email}
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone size={11} /> {contact.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {contact.pipeline_stage ? (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${contact.pipeline_stage.color}20`,
                          color: contact.pipeline_stage.color,
                        }}
                      >
                        {contact.pipeline_stage.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', statusColour[contact.status])}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 capitalize">{contact.source}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">
                    {new Date(contact.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <ContactForm
          onSubmit={addContact}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
