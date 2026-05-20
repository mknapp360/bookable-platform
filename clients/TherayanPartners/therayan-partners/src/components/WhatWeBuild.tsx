import { Handshake, Target, ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react'

const trustItems = [
  {
    icon: Handshake,
    title: 'Win-Win Outcomes',
    description: 'Strong results for sellers. Quality assets for investors.',
  },
  {
    icon: Target,
    title: 'Tailored Strategies',
    description: 'Solutions designed around your unique goals.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted & Transparent',
    description: 'Clear communication and complete confidentiality.',
  },
  {
    icon: TrendingUp,
    title: 'Long-Term Growth',
    description: 'Sustainable investments. Stronger portfolios.',
  },
]

export default function WhatWeBuild() {
  return (
    <>
      {/* ── Trust Bar ── */}
      <section className="py-16 bg-white border-b border-gray-100" aria-label="Why choose us">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-brand-green text-xs font-semibold tracking-[0.2em] uppercase mb-10">
            Trusted by sellers and investors
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustItems.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full border border-brand-green/30">
                  <Icon size={20} className="text-brand-green" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Sellers / For Investors cards ── */}
      <section
        aria-label="For sellers and investors"
        style={{ backgroundColor: '#EDE8DF' }}
        className="py-10 px-6"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">

          {/* FOR SELLERS — text left, image right */}
          <div id="sellers" className="bg-white overflow-hidden flex flex-row min-h-[280px]">
            <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center min-w-0">
              <p className="text-brand-green text-xs font-semibold tracking-[0.2em] uppercase mb-5">
                For Sellers
              </p>
              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight mb-4">
                A better way to{' '}
                <span className="text-brand-green">sell</span> your property.
              </h2>
              <div className="w-8 h-0.5 bg-brand-green mb-5" />
              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                We connect you with serious, experienced investors ready to move
                quickly and secure strong value for your property.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 bg-brand-green text-white font-semibold text-xs px-6 py-3 hover:bg-amber-600 transition-colors tracking-widest uppercase self-start"
              >
                Learn more
                <ArrowRight size={14} />
              </a>
            </div>
            <div className="w-2/5 flex-shrink-0 overflow-hidden">
              <img
                src="/middle_left.png"
                alt="Elegant property interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* FOR INVESTORS — text left, image right */}
          <div id="investors" className="bg-brand-dark overflow-hidden flex flex-row min-h-[280px]">
            <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center min-w-0">
              <p className="text-brand-green text-xs font-semibold tracking-[0.2em] uppercase mb-5">
                For Investors
              </p>
              <h2 className="text-2xl font-extrabold text-white leading-tight mb-4">
                Quality properties. Built for{' '}
                <span className="text-brand-green">growth</span>.
              </h2>
              <div className="w-8 h-0.5 bg-brand-green mb-5" />
              <p className="text-white/70 text-sm leading-relaxed mb-8">
                Access handpicked opportunities aligned with our investment
                criteria and long-term portfolio growth.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold text-xs px-6 py-3 hover:border-brand-green hover:text-brand-green transition-colors tracking-widest uppercase self-start"
              >
                View opportunities
                <ArrowRight size={14} />
              </a>
            </div>
            <div className="w-2/5 flex-shrink-0 overflow-hidden">
              <img
                src="/middle_right.png"
                alt="Premium investment property"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
