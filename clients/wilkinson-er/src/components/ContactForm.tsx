import { useEffect, useRef } from 'react'

export default function ContactForm() {
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!widgetRef.current) return
    const script = document.createElement('script')
    script.src =
      'https://uizhkuydcmlfchuutdwu.supabase.co/functions/v1/widget-embed?key=c41b7547-7ec8-400b-ac61-6e2d3b0fda9c'
    widgetRef.current.appendChild(script)
  }, [])

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

          {/* Widget embed */}
          <div ref={widgetRef} />
        </div>
      </div>
    </section>
  )
}
