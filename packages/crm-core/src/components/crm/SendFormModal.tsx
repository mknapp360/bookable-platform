import { useState } from 'react'
import { Send, X, Copy, Check, AlertCircle } from 'lucide-react'
import { useContacts } from '@/hooks/useContacts'
import { useFormSubmissions } from '@/hooks/useFormSubmissions'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'

export function SendFormModal({
  tenantId,
  formTemplateId,
  formName,
  preselectedContactId,
  onClose,
  onSent,
}: {
  tenantId: string
  formTemplateId: string
  formName: string
  preselectedContactId?: string
  onClose: () => void
  onSent?: () => void
}) {
  const { contacts } = useContacts(tenantId)
  const { sendToContact } = useFormSubmissions(tenantId, formTemplateId)

  const [selectedContactId, setSelectedContactId] = useState(preselectedContactId ?? '')
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentLink, setSentLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const filtered = contacts.filter(c => {
    if (!search) return true
    return [c.first_name, c.last_name, c.email]
      .join(' ').toLowerCase().includes(search.toLowerCase())
  })

  async function handleSend() {
    if (!selectedContactId) return
    setSending(true)
    setError(null)

    const selectedContact = contacts.find(c => c.id === selectedContactId)
    if (!selectedContact?.email) {
      setError('This contact has no email address')
      setSending(false)
      return
    }

    const { submission, error: subError } = await sendToContact(formTemplateId, selectedContactId)
    if (subError) {
      setError(subError)
      setSending(false)
      return
    }

    if (submission) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const link = `${supabaseUrl}/storage/v1/object/public/public-forms/form.html?token=${submission.token}&api=${encodeURIComponent(supabaseUrl)}`

      // Send email BEFORE updating UI state — otherwise parent re-render can unmount this modal
      try {
        const { data: { session } } = await supabase.auth.getSession()
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token ?? ''}`,
          },
          body: JSON.stringify({
            tenant_id: tenantId,
            contact_id: selectedContactId,
            to_email: selectedContact.email,
            to_name: `${selectedContact.first_name} ${selectedContact.last_name}`,
            subject: formName,
            body: `Hi ${selectedContact.first_name},\n\nPlease complete the following form:\n\n${link}\n\nKind regards`,
          }),
        })
      } catch {
        console.error('Failed to send form email')
      }

      setSentLink(link)
    }

    setSending(false)
    onSent?.()
  }

  function handleCopy() {
    if (sentLink) {
      navigator.clipboard.writeText(sentLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const selectedContact = contacts.find(c => c.id === selectedContactId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Send size={16} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">Send Form</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <p className="text-xs text-slate-500">
            Send <span className="font-medium text-slate-700">{formName}</span> to a contact. They'll receive an email with a link to fill out the form.
          </p>

          {sentLink ? (
            /* Success state — show link */
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <Check size={14} className="text-green-500 shrink-0" />
                Form emailed to {selectedContact?.first_name} {selectedContact?.last_name}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Form link</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 truncate">
                    {sentLink}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg transition-colors shrink-0"
                  >
                    {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Select contact */
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Select contact</label>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search contacts…"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                {filtered.length === 0 ? (
                  <p className="px-3 py-4 text-xs text-slate-400 text-center">No contacts found</p>
                ) : (
                  filtered.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedContactId(contact.id)}
                      className={cn(
                        'w-full flex items-center gap-3 text-left px-3 py-2.5 transition-colors text-sm',
                        selectedContactId === contact.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {contact.first_name[0]}{contact.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{contact.first_name} {contact.last_name}</p>
                        {contact.email && <p className="text-xs text-slate-400 truncate">{contact.email}</p>}
                      </div>
                      {selectedContactId === contact.id && <Check size={14} className="text-blue-600 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>
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
            {sentLink ? 'Close' : 'Cancel'}
          </button>
          {!sentLink && (
            <button
              onClick={handleSend}
              disabled={sending || !selectedContactId}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Send size={12} />
              {sending ? 'Sending…' : 'Send form'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
