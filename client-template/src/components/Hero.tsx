import { ArrowRight, Settings, Users, ShieldCheck, Plug } from 'lucide-react'

interface HeroProps {
  onQuiz: () => void
}

export default function Hero({ onQuiz }: HeroProps) {
  return (
    <section className="pt-28 pb-16" aria-label="Hero">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left column */}
          <div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Your business<br />isn't broken.<br />
              <span className="text-brand-green">Your systems are.</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              We replace spreadsheets, paperwork, and admin with automation.
            </p>

            {/* Pricing callout */}
            <div className="flex items-start gap-4 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mb-6">
              <Settings size={22} className="text-brand-green flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Custom-built CRM &amp; Booking systems, no enterprise pricing</p>
                <p className="text-sm text-gray-500 mt-0.5">From <span className="text-brand-green font-semibold">£75/month</span>. No per-user fees.</p>
              </div>
            </div>

            {/* Trust bullets */}
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <Users size={16} className="text-brand-green flex-shrink-0" />
                Designed for regulated professionals drowning in admin.
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <ShieldCheck size={16} className="text-brand-green flex-shrink-0" />
                Used by brokers, investors and legal firms.
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <Plug size={16} className="text-brand-green flex-shrink-0" />
                Built to integrate with Xero, compliance platforms, and the tools your firm already uses.
              </li>
            </ul>

            {/* CTA */}
            <button
              onClick={onQuiz}
              className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-3.5 rounded-full font-semibold text-base hover:bg-green-700 transition-colors"
            >
              Check your automation potential
              <ArrowRight size={18} />
            </button>

            {/* Trust bar */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6">
              {['£500 setup', '£75/month', 'No per-user fees', 'Cancel any time'].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span className="text-brand-green font-bold">✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right column — dashboard image */}
          <div className="block mt-8 lg:mt-0">
            <img
              src="/dashboard.jpg"
              alt="Bookable CRM dashboard"
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
