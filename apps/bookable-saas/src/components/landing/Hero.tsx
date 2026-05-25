import { ArrowRight, Zap } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-28 pb-16" aria-label="Hero">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left column */}
          <div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Run Your Business <br />
              <span className="text-bookable-green">From Anywhere.</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Manage on the dashboard, or let AI do it for you.
            </p>

            {/* CTA */}
            <a
              href="/signup"
              className="inline-flex items-center gap-2 bg-bookable-green text-white px-8 py-3.5 rounded-full font-semibold text-base hover:bg-green-700 transition-colors mb-6"
            >
              Get Started for free
              <ArrowRight size={18} />
            </a>

            {/* Self-serve tier callout */}
            <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-3">
              <div className="flex items-start gap-4 mb-4">
                <Zap size={22} className="text-bookable-green flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Built for the future of work</p>
                  <p className="text-sm text-gray-500 mt-0.5">The first CRM designed for both humans and AI</p>
                </div>
              </div>
              <div className="border-t border-green-200 pt-3 space-y-1.5">
                {[
                  'Manage clients, tasks and documents',
                  'Automate contacts, pipeline and communications',
                  'Connect Google, Outlook, Xero and compliance tools',
                  'Ask AI to find information, update records and complete work',
                  'MCP to Claude, ChatGPT, Gemini, CoPilot',
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <span className="text-bookable-green font-bold">✓</span>
                    {item}
                  </span>
                ))}
              </div>
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
