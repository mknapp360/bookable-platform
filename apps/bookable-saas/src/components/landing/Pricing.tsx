import { ArrowRight, Check } from 'lucide-react'

const tiers = [
  {
    name: 'Core',
    price: '£20',
    period: '/month',
    description: 'The complete automated business system',
    features: [
      'Full CRM — contacts, pipeline, cases, tasks',
      'Automated communications and follow-ups',
      'Calendar integration',
      'Document and case management',
      'No per-user fees',
    ],
    cta: 'Get started free',
    href: '/signup',
    badge: null,
    highlighted: false,
  },
  {
    name: 'AI',
    price: '£70',
    period: '/month',
    description: 'Everything in Core, plus AI-powered interfaces',
    features: [
      'Everything in Core',
      'Embedded AI chat — ask AI to manage your business',
      'MCP connector — use Bookable from Claude or ChatGPT',
      'No per-user fees',
    ],
    cta: 'Join the waitlist',
    href: '/#contact',
    badge: 'Coming soon',
    highlighted: true,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-bookable-green uppercase tracking-widest mb-4">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
            Simple, fixed pricing.
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            14-day free trial. No contract. Cancel anytime.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                tier.highlighted
                  ? 'bg-gray-800 border-2 border-bookable-green'
                  : 'bg-gray-800 border border-gray-700'
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <span className="absolute -top-3 right-6 bg-bookable-green text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {tier.badge}
                </span>
              )}

              {/* Name & Price */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-gray-400 text-base">{tier.period}</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">{tier.description}</p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-700 mb-6" />

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check size={16} className="text-bookable-green flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={tier.href}
                className={`mt-8 inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-lg font-semibold text-base transition-colors ${
                  tier.highlighted
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 cursor-pointer'
                    : 'bg-bookable-green text-white hover:bg-green-700'
                }`}
              >
                {tier.cta}
                <ArrowRight size={18} />
              </a>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
