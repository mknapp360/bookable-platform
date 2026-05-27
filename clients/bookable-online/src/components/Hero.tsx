import { ArrowRight, Settings } from 'lucide-react'

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
              <span className="text-bookable-green">Your systems are.</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              We design and build AI-powered systems around how your business actually operates.
            </p>

            {/* CTA */}
            <button
              onClick={onQuiz}
              className="inline-flex items-center gap-2 bg-bookable-green text-white px-8 py-3.5 rounded-full font-semibold text-base hover:bg-green-700 transition-colors mb-6"
            >
              Check your automation potential
              <ArrowRight size={18} />
            </button>

            {/* Bespoke tier callout */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
              <div className="flex items-start gap-4 mb-4">
                <Settings size={22} className="text-bookable-green flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Custom-built CRM &amp; Booking systems, no enterprise pricing</p>
                  <p className="text-sm text-gray-500 mt-0.5">From <span className="text-bookable-green font-semibold">£75/month</span>. No per-user fees.</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                {['£500 setup', '£75/month', 'No per-user fees', 'No contract'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <span className="text-bookable-green font-bold">✓</span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <a
              href="https://bookablecrm.com"
              className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-bookable-green hover:text-green-700 transition-colors"
            >
              Just starting out? BookableCRM starts at £20 a month
              <ArrowRight size={14} />
            </a>

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
