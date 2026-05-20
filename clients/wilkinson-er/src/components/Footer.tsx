export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Kate Wilkinson" className="h-10 w-auto" />
              <div>
                <p className="font-serif text-lg font-semibold tracking-wide leading-tight">
                  KATE WILKINSON
                </p>
                <p className="text-brand-gold text-[10px] tracking-[0.2em] uppercase">
                  Equity Release Specialist
                </p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mt-4">
              Helping homeowners aged 55+ unlock the value in their property with expert, impartial advice.
            </p>

            {/* VIVA badge */}
            <div className="mt-6 flex items-center gap-2">
              <div className="bg-white/10 rounded-lg px-3 py-2">
                <span className="text-brand-gold font-serif font-bold text-sm tracking-wider">VIVA</span>
              </div>
              <span className="text-white/40 text-xs">Appointed Representative</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-brand-gold">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '#' },
                { label: 'About Kate', href: '#why-katie' },
                { label: 'Services', href: '#benefits' },
                { label: 'How It Works', href: '#journey' },
                { label: 'Testimonials', href: '#testimonials' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-brand-gold text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-brand-gold">
              Services
            </h4>
            <ul className="space-y-3 text-white/60 text-sm">
              <li>Lifetime Mortgages</li>
              <li>Home Reversion Plans</li>
              <li>Later Life Mortgages</li>
              <li>Retirement Interest-Only</li>
              <li>Drawdown Plans</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-brand-gold">
              Contact
            </h4>
            <ul className="space-y-3 text-white/60 text-sm">
              <li>
                <span className="text-white/80">Phone:</span>{' '}
                <a href="tel:08081657795" className="hover:text-brand-gold transition-colors">
                  0808 165 7795
                </a>
              </li>
              <li>
                <span className="text-white/80">Email:</span>{' '}
                <a
                  href="mailto:kate@wilkinsonequityrelease.co.uk"
                  className="hover:text-brand-gold transition-colors"
                >
                  kate@wilkinsonequityrelease.co.uk
                </a>
              </li>
              <li>
                <span className="text-white/80">Area:</span> South East England
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>
              &copy; {new Date().getFullYear()} Kate Wilkinson Equity Release. All rights reserved.
            </p>
            <p>
              Kate Wilkinson is an Appointed Representative of VIVA Financial Planning Ltd, which is authorised and regulated by the Financial Conduct Authority.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
