import { useState, useRef } from 'react'
import { Menu, X, Phone } from 'lucide-react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const links = [
    { label: 'Home', href: '#' },
    { label: 'About', href: '#why-katie' },
    { label: 'Services', href: '#benefits' },
    { label: 'How It Works', href: '#journey' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact-form' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-navy shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-3"
            onClick={(e) => {
              e.preventDefault()
              clickTimeout.current = setTimeout(() => {
                clickTimeout.current = null
                window.location.href = '/'
              }, 300)
            }}
            onDoubleClick={(e) => {
              e.preventDefault()
              if (clickTimeout.current) {
                clearTimeout(clickTimeout.current)
                clickTimeout.current = null
              }
              window.location.href = '/admin'
            }}
          >
            <img
              src="/logo.png"
              alt="Kate Wilkinson"
              className="h-10 w-auto"
            />
            <div className="hidden sm:block">
              <p className="text-white font-serif text-lg font-semibold tracking-wide leading-tight">
                KATE WILKINSON
              </p>
              <p className="text-brand-gold text-[10px] tracking-[0.2em] uppercase">
                Equity Release Specialist
              </p>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-white/80 hover:text-brand-gold text-sm font-medium transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="tel:08081657795"
              className="flex items-center gap-2 bg-brand-gold text-brand-navy px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-brand-gold/90 transition-colors"
            >
              <Phone className="w-4 h-4" />
              0808 165 7795
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-brand-navy border-t border-white/10 px-4 pb-6 pt-2 space-y-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-3 text-white/80 hover:text-brand-gold text-sm font-medium transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="tel:08081657795"
            className="flex items-center justify-center gap-2 mt-4 bg-brand-gold text-brand-navy px-5 py-3 rounded-md text-sm font-semibold"
          >
            <Phone className="w-4 h-4" />
            0808 165 7795
          </a>
        </div>
      )}
    </nav>
  )
}
