import { useEffect, useRef } from 'react'

const WIDGET_SRC =
  'https://vgsqkctwluheuwqbtfey.supabase.co/functions/v1/widget-embed?key=9f3cad78-1c9d-4921-b1e4-a993d24fb71d'

export default function ContactForm() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const script = document.createElement('script')
    script.src = WIDGET_SRC
    el.appendChild(script)

    return () => {
      el.innerHTML = ''
    }
  }, [])

  return (
    <section id="contact" className="py-20 px-6 bg-gray-50">
      <div className="max-w-xl mx-auto">
        <div ref={containerRef} />
      </div>
    </section>
  )
}
