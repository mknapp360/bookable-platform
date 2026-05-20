import { useState } from 'react'
import { CheckCircle, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const { error } = await supabase.from('enquiries').insert({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        source: 'equity-release-landing',
        tenant_id: 'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
        pipeline_stage_id: '2c34bdb6-a712-461b-a1d5-a36327c5a445',
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
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <section id="contact-form" className="py-20 sm:py-28 bg-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h3 className="font-serif text-2xl font-bold text-brand-navy mb-3">
            Thank You!
          </h3>
          <p className="text-gray-600">
            Your enquiry has been received. Kate will be in touch within 24 hours to arrange your free consultation.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="contact-form" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left copy */}
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
              Get in Touch
            </h2>
            <div className="w-16 h-1 bg-brand-gold mb-6" />
            <p className="text-gray-600 mb-8 leading-relaxed">
              Whether you're just exploring your options or ready to take the next
              step, I'm here to help. Fill in the form and I'll get back to you
              within 24 hours for a free, no-obligation chat.
            </p>

            <div className="space-y-4 text-sm text-gray-600">
              <p>
                <span className="font-semibold text-brand-navy">Phone:</span>{' '}
                0808 165 7795
              </p>
              <p>
                <span className="font-semibold text-brand-navy">Email:</span>{' '}
                kate@wilkinsonequityrelease.co.uk
              </p>
              <p>
                <span className="font-semibold text-brand-navy">Area:</span>{' '}
                South East England
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-colors"
                placeholder="Your full name"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-colors"
                  placeholder="Your phone number"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Message
              </label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none transition-colors resize-none"
                placeholder="Tell me a bit about your situation..."
              />
            </div>

            {status === 'error' && (
              <p className="text-red-600 text-sm">
                Something went wrong. Please try again or call directly.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-navy px-8 py-3.5 rounded-md text-sm font-semibold hover:bg-brand-gold/90 transition-colors disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {status === 'sending' ? 'Sending...' : 'Send Enquiry'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
