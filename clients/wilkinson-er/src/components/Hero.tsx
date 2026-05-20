import { ShieldCheck, Globe, Users } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative pt-20 bg-white overflow-hidden min-h-[600px] lg:min-h-[700px]">
      {/* Background image — pinned to the right, full height */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-3/5">
        <img
          src="/hero.png"
          alt=""
          className="w-full h-full object-cover object-center"
        />
        {/* Gradient fade into white on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/30 via-30% to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
        <div className="max-w-xl">
          {/* Eyebrow */}
          <p className="text-brand-gold text-xs sm:text-sm font-semibold tracking-wider uppercase mb-4">
            Specialist Equity Release &amp; Later Life Mortgage Adviser
          </p>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-brand-navy leading-tight mb-2">
            Unlock the Wealth{' '}
            <br className="hidden sm:block" />
            in Your Home.
          </h1>
          <p className="font-script text-2xl sm:text-3xl text-brand-gold mb-5">
            Without Leaving It Behind.
          </p>

          {/* Sub-copy */}
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
            Advice for Homeowners Aged 55+. Across
            Equitas and the South East.
          </p>

          {/* CTA */}
          <a
            href="#contact-form"
            className="inline-flex items-center gap-2 bg-brand-gold text-white px-7 py-3.5 rounded-md text-sm sm:text-base font-semibold hover:bg-brand-gold/90 transition-colors shadow-md"
          >
            Book Your Free Consultation
          </a>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap gap-6 sm:gap-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-brand-navy/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-brand-navy" />
              </div>
              <p className="text-brand-navy text-xs sm:text-sm font-semibold">FCA Regulated</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-brand-navy/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-brand-navy" />
              </div>
              <div>
                <p className="text-brand-navy text-xs sm:text-sm font-semibold leading-tight">Whole of Market</p>
                <p className="text-gray-400 text-[10px] sm:text-xs">Choice</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-brand-navy/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-brand-navy" />
              </div>
              <div>
                <p className="text-brand-navy text-xs sm:text-sm font-semibold leading-tight">Trusted by 100+</p>
                <p className="text-gray-400 text-[10px] sm:text-xs">Families</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
