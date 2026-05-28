import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FileText, Trash2, Download, X, Upload,
  AlertCircle, FileIcon, Pencil, Send, ClipboardList
} from 'lucide-react'
import { useTenant } from '@/hooks/useTenant'
import { useDocuments } from '@/hooks/useDocuments'
import { useFormTemplates } from '@/hooks/useFormTemplates'
import { SendFormModal } from '@/components/crm/SendFormModal'
import { cn } from '@/lib/cn'
import type { Document, FormTemplate } from '@/types'

const DOCUMENT_TYPES = [
  { value: 'brochure', label: 'Brochure' },
  { value: 'online_form', label: 'Online Form' },
] as const

const ACCEPTED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
]
const ACCEPTED_EXT = '.pdf,.docx'

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Unified row type for the merged list
type ListItem =
  | { kind: 'file'; data: Document }
  | { kind: 'form'; data: FormTemplate }

// ─── Create Document Modal ───────────────────────────────────────────────────
function CreateDocumentModal({
  onUpload,
  onClose,
  onCreateForm,
}: {
  onUpload: (file: File, values: { name: string; type: string }) => Promise<{ error: string | null }>
  onClose: () => void
  onCreateForm: () => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState('brochure')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const isForm = type === 'online_form'

  function handleFile(f: File) {
    if (!ACCEPTED_MIME.includes(f.type)) {
      setError('Only PDF and DOCX files are supported.')
      return
    }
    setFile(f)
    setError(null)
    if (!name) {
      const baseName = f.name.replace(/\.[^.]+$/, '')
      setName(baseName)
    }
  }

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true) }, [])
  const onDragLeave = useCallback(() => setDragging(false), [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [name])

  async function handleSubmit() {
    if (isForm) {
      onCreateForm()
      return
    }
    if (!file || !name.trim()) return
    setUploading(true)
    setError(null)
    const result = await onUpload(file, { name: name.trim(), type })
    if (result.error) {
      setError(result.error)
      setUploading(false)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">Create Document</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Document type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Document type</label>
            <select
              value={type}
              onChange={e => { setType(e.target.value); setError(null) }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {DOCUMENT_TYPES.map(dt => (
                <option key={dt.value} value={dt.value}>{dt.label}</option>
              ))}
            </select>
          </div>

          {isForm ? (
            /* Online Form — show info and redirect */
            <div className="flex flex-col items-center gap-3 border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl px-6 py-10">
              <ClipboardList size={28} className="text-blue-400" />
              <p className="text-sm text-slate-700 text-center">
                Online forms are built using the form designer. Click below to open the form builder.
              </p>
            </div>
          ) : (
            <>
              {/* Document name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Document name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Retirement Planning Guide"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* File upload / drag & drop */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">File</label>
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-6 py-10 cursor-pointer transition-colors',
                    dragging
                      ? 'border-blue-400 bg-blue-50'
                      : file
                        ? 'border-green-300 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  )}
                >
                  {file ? (
                    <>
                      <FileIcon size={28} className="text-green-500" />
                      <p className="text-sm font-medium text-slate-800">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      <button
                        onClick={e => { e.stopPropagation(); setFile(null) }}
                        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={28} className={dragging ? 'text-blue-400' : 'text-slate-300'} />
                      <p className="text-sm text-slate-600">
                        Drag & drop a file here, or <span className="text-blue-600 font-medium">browse</span>
                      </p>
                      <p className="text-xs text-slate-400">PDF or DOCX only</p>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPTED_EXT}
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={13} className="shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {isForm ? (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <ClipboardList size={12} />
              Open form builder
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={uploading || !file || !name.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Upload size={12} />
              {uploading ? 'Uploading…' : 'Upload document'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function DocumentsPage() {
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const tenantId = tenant?.id ?? null
  const { documents, loading: docsLoading, uploadDocument, deleteDocument, getSignedUrl } = useDocuments(tenantId)
  const { templates, loading: formsLoading, deleteFormTemplate } = useFormTemplates(tenantId)

  const [showCreate, setShowCreate] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sendFormId, setSendFormId] = useState<string | null>(null)

  const loading = docsLoading || formsLoading

  // Merge file documents and form templates into a single list
  const allItems: ListItem[] = [
    ...documents.map(d => ({ kind: 'file' as const, data: d })),
    ...templates.map(t => ({ kind: 'form' as const, data: t })),
  ].sort((a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime())

  const totalCount = allItems.length

  const filtered = allItems.filter(item => {
    if (typeFilter === 'all') return true
    if (typeFilter === 'online_form') return item.kind === 'form'
    return item.kind === 'file' && item.data.type === typeFilter
  })

  async function handleUpload(file: File, values: { name: string; type: string }) {
    return uploadDocument(file, values)
  }

  async function handleDeleteFile(doc: Document) {
    setDeleting(doc.id)
    await deleteDocument(doc)
    setDeleting(null)
    setDeleteConfirm(null)
  }

  async function handleDeleteForm(id: string) {
    setDeleting(id)
    await deleteFormTemplate(id)
    setDeleting(null)
    setDeleteConfirm(null)
  }

  async function handleDownload(doc: Document) {
    const url = await getSignedUrl(doc.file_path)
    if (url) window.open(url, '_blank')
  }

  const sendForm = sendFormId ? templates.find(t => t.id === sendFormId) : null

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {totalCount} {totalCount === 1 ? 'document' : 'documents'} in {tenant?.name}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Create Document
        </button>
      </div>

      {/* Filters */}
      {totalCount > 0 && (
        <div className="flex items-center gap-3 mb-5">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All types</option>
            {DOCUMENT_TYPES.map(dt => (
              <option key={dt.value} value={dt.value}>{dt.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading documents…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {totalCount === 0
              ? 'No documents yet. Create your first one.'
              : 'No documents match your filter.'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Name</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Type</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Details</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Created</th>
                <th className="text-right text-xs font-medium text-slate-500 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => {
                const id = item.data.id
                const isForm = item.kind === 'form'
                const doc = item.kind === 'file' ? item.data : null
                const form = item.kind === 'form' ? item.data : null

                return (
                  <tr key={id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          isForm ? 'bg-blue-50 text-blue-500' : 'bg-violet-50 text-violet-500'
                        )}>
                          {isForm ? <ClipboardList size={15} /> : <FileText size={15} />}
                        </div>
                        <span className="font-medium text-slate-900 text-sm">{item.data.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                        isForm ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      )}>
                        {isForm ? 'Online Form' : doc?.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {isForm
                        ? `${form!.schema.pages.length} ${form!.schema.pages.length === 1 ? 'page' : 'pages'}, ${form!.schema.pages.reduce((n, p) => n + p.fields.length, 0)} fields`
                        : <span className="truncate block max-w-[200px]">{doc!.file_name} · {formatFileSize(doc!.file_size)}</span>
                      }
                    </td>
                    <td className="px-5 py-3.5">
                      {isForm ? (
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          form!.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        )}>
                          {form!.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {new Date(item.data.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {isForm ? (
                          <>
                            <button
                              onClick={() => navigate(`/documents/forms/${id}/edit`)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                              title="Edit form"
                            >
                              <Pencil size={14} />
                            </button>
                            {form!.status === 'published' && (
                              <button
                                onClick={() => setSendFormId(id)}
                                className="p-1.5 text-slate-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                                title="Send to contact"
                              >
                                <Send size={14} />
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => handleDownload(doc!)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                        )}
                        {deleteConfirm === id ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-red-600 mr-1">Delete?</span>
                            <button
                              onClick={() => isForm ? handleDeleteForm(id) : handleDeleteFile(doc!)}
                              disabled={deleting === id}
                              className="text-xs font-medium text-red-600 hover:text-red-700"
                            >
                              {deleting === id ? '…' : 'Yes'}
                            </button>
                            <span className="text-slate-300">/</span>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs font-medium text-slate-500 hover:text-slate-700"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateDocumentModal
          onUpload={handleUpload}
          onClose={() => setShowCreate(false)}
          onCreateForm={() => { setShowCreate(false); navigate('/documents/forms/new') }}
        />
      )}

      {/* Send form modal */}
      {sendForm && tenantId && (
        <SendFormModal
          tenantId={tenantId}
          formTemplateId={sendForm.id}
          formName={sendForm.name}
          onClose={() => setSendFormId(null)}
        />
      )}
    </div>
  )
}
