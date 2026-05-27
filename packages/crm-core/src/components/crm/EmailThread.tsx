import { useState, useEffect, useCallback } from 'react'
import { Send, Loader2, Mail, ArrowUpRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import type { Email } from '@/types'

interface Props {
  contactId: string
  contactEmail: string | null
  contactName: string
  tenantId: string
  onEmailSent?: () => void
}

export function EmailThread({ contactId, contactEmail, contactName, tenantId, onEmailSent }: Props) {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)

  // Reply composer state
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    const { data } = await (supabase as any)
      .from('emails')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: true })
    setEmails((data as Email[]) ?? [])
    setLoading(false)
  }, [contactId])

  useEffect(() => { load() }, [load])

  // Pre-fill reply subject from latest inbound email
  useEffect(() => {
    const lastInbound = [...emails].reverse().find(e => e.direction === 'inbound')
    if (lastInbound?.subject && !subject) {
      const s = lastInbound.subject
      setSubject(s.startsWith('Re:') ? s : `Re: ${s}`)
    }
  }, [emails]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSend() {
    if (!body.trim() || !contactEmail) return
    setSending(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

      // Find the latest inbound message_id for threading
      const lastInbound = [...emails].reverse().find(e => e.direction === 'inbound')

      const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          contact_id: contactId,
          to_email: contactEmail,
          to_name: contactName,
          subject: subject || 'Re: Your enquiry',
          body,
          in_reply_to: lastInbound?.message_id ?? null,
        }),
      })

      if (res.ok) {
        setBody('')
        await load()
        onEmailSent?.()
      }
    } catch (err) {
      console.error('Failed to send email:', err)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400 py-4">Loading emails…</p>
  }

  return (
    <div className="space-y-4">
      {/* Thread */}
      {emails.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No emails yet for this contact.</p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {emails.map(email => (
            <div
              key={email.id}
              className={cn(
                'max-w-[85%] rounded-xl px-4 py-3 text-sm',
                email.direction === 'inbound'
                  ? 'bg-slate-100 text-slate-800 mr-auto'
                  : 'bg-blue-50 text-blue-900 ml-auto'
              )}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-xs font-medium text-slate-500">
                  {email.direction === 'inbound' ? (
                    <span className="flex items-center gap-1"><Mail size={10} /> {email.from_name || email.from_email}</span>
                  ) : (
                    <span className="flex items-center gap-1"><ArrowUpRight size={10} /> You</span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(email.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}{' '}
                  {new Date(email.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {email.subject && (
                <p className="text-xs font-semibold text-slate-600 mb-1">{email.subject}</p>
              )}
              <p className="whitespace-pre-wrap leading-relaxed text-sm">{email.body_text || '(no body)'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply composer */}
      {contactEmail ? (
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Re: ..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={4}
              placeholder="Write your reply…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSend}
              disabled={sending || !body.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors"
            >
              {sending ? <><Loader2 size={13} className="animate-spin" /> Sending…</> : <><Send size={13} /> Send</>}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic border-t border-slate-200 pt-4">
          This contact has no email address. Add one to send emails.
        </p>
      )}
    </div>
  )
}
