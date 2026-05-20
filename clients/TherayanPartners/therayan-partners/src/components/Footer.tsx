import { ExternalLink, Mail } from 'lucide-react'

const quickLinks = [
  { label: 'For Sellers', href: '#sellers' },
  { label: 'For Investors', href: '#investors' },
  { label: 'Our Approach', href: '#approach' },
  { label: 'About Us', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

const services = [
  'Property Solutions',
  'Investment Opportunities',
  'Portfolio Growth',
  'Strategic Advisory',
]

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white/70" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1 — Brand */}
          <div>
            <img src="/logo.png" alt="Therayan Partners" className="h-10 w-auto mb-4" />
            <p className="text-sm leading-relaxed mb-6">
              Strategic solutions for sellers.<br />
              Sustainable growth for investors.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 border border-white/20 flex items-center justify-center hover:border-brand-green hover:text-brand-green transition-colors"
              >
                <ExternalLink size={14} />
              </a>
              <a
                href="mailto:info@therayanpartners.com"
                aria-label="Email us"
                className="w-8 h-8 border border-white/20 flex items-center justify-center hover:border-brand-green hover:text-brand-green transition-colors"
              >
                <Mail size={14} />
              </a>
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <p className="text-white text-xs font-semibold tracking-[0.15em] uppercase mb-5">
              Quick Links
            </p>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-brand-green transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Services */}
          <div>
            <p className="text-white text-xs font-semibold tracking-[0.15em] uppercase mb-5">
              Services
            </p>
            <ul className="space-y-3">
              {services.map(service => (
                <li key={service} className="text-sm">{service}</li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div id="contact">
            <p className="text-white text-xs font-semibold tracking-[0.15em] uppercase mb-5">
              Contact
            </p>
            <address className="not-italic space-y-3 text-sm">
              <a href="tel:+442012345678" className="block hover:text-brand-green transition-colors">
                +44 20 1234 5678
              </a>
              <a href="mailto:info@therayanpartners.com" className="block hover:text-brand-green transition-colors">
                info@therayanpartners.com
              </a>
            </address>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Therayan Partners Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-white/40">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>|</span>
            <a href="/terms" className="hover:text-white transition-colors">Terms and Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
