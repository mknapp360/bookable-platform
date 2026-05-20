import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const { error } = await supabase.from('enquiries').insert({
        tenant_id: 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
        pipeline_stage_id: '7c1abd72-f259-4ed1-9ffc-0d475dbbda34',
        name: form.name,
        email: form.email,
        message: form.message,
        source: 'contact_form',
      })

      if (error) throw error

      // Fire-and-forget: send email notification via edge function
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-enquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      }).catch((err) => console.error('send-enquiry edge function error:', err))

      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <section id="contact" className="py-20 px-6 bg-gray-50">
        <div className="max-w-xl mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-brand-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">We've got it</h2>
          <p className="text-gray-600">
            Your enquiry is in the pipeline. We'll be in touch shortly.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="py-20 px-6 bg-gray-50">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Quick enquiry
          </h2>
          <p className="mt-4 text-gray-600">
            Tell us what you need. We'll get back to you within 24 hours.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none transition-all"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none transition-all"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              What do you need?
            </label>
            <textarea
              id="message"
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none transition-all resize-none"
              placeholder="Tell us about your business and what you'd like automated..."
            />
          </div>
          {status === 'error' && (
            <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
          )}
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-green text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending...' : 'Send enquiry'}
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </section>
  )
}
