import { ShieldCheck, Glasses, Mountain, PoundSterling, Wallet, Users, Home, Plane } from 'lucide-react'

const trustItems = [
  { icon: ShieldCheck, label: 'FCA\nRegulated' },
  { icon: Glasses, label: 'Whole of\nMarket Advice' },
  { icon: Mountain, label: 'Equity Release\nCouncil Standards' },
  { icon: PoundSterling, label: '£995\nCompletion Only Fee' },
]

const benefits = [
  {
    icon: Wallet,
    title: 'Supplement Retirement Income',
    description:
      'Boost your income and enjoy your retirement with greater financial freedom.',
  },
  {
    icon: Users,
    title: 'Help Children Onto the Property Ladder',
    description:
      'Provide a helping hand to loved ones when they need it most.',
  },
  {
    icon: Home,
    title: 'Pay Off Existing Mortgage',
    description:
      'Clear your mortgage and reduce monthly outgoings in retirement.',
  },
  {
    icon: Plane,
    title: 'Fund Home Improvements & Travel',
    description:
      'Improve your home, support your lifestyle and create lasting memories.',
  },
]

export default function Benefits() {
  return (
    <section id="benefits">
      {/* Trust bar */}
      <div className="bg-white border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-6 py-5">
                <item.icon className="w-6 h-6 text-brand-navy/60 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-brand-navy text-xs sm:text-sm font-medium leading-tight whitespace-pre-line">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits section */}
      <div className="py-20 sm:py-28 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
              How Equity Release Could Help
            </h2>
            <div className="w-12 h-1 bg-brand-gold mx-auto" />
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-2xl border border-gray-200/60 pt-10 pb-8 px-6 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-8 rounded-full bg-brand-navy flex items-center justify-center">
                  <b.icon className="w-6 h-6 text-brand-gold" />
                </div>
                <h3 className="font-serif text-base sm:text-lg font-semibold text-brand-navy mb-3">
                  {b.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
