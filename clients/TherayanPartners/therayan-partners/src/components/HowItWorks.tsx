import { Search, Lightbulb, Users, TrendingUp, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Understand',
    description:
      'We take the time to understand your goals and the opportunities available.',
  },
  {
    icon: Lightbulb,
    number: '02',
    title: 'Strategise',
    description:
      'We design a tailored strategy that delivers the best possible outcome.',
  },
  {
    icon: Users,
    number: '03',
    title: 'Connect',
    description:
      'We connect motivated sellers with investors who are ready to act.',
  },
  {
    icon: TrendingUp,
    number: '04',
    title: 'Deliver',
    description:
      'We manage the process professionally to ensure a smooth and successful result.',
  },
]

export default function HowItWorks() {
  return (
    <>
      {/* ── Our Approach ── */}
      <section
        id="approach"
        className="py-24 bg-white"
        aria-label="Our approach"
      >
        <div className="max-w-7xl mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-brand-green text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              Our Approach
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Strategy. Creativity.{' '}
              <span className="text-brand-green">Results.</span>
            </h2>
          </div>

          {/* Steps */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ icon: Icon, number, title, description }) => (
              <div key={number} className="flex flex-col items-center text-center">
                {/* Icon circle */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border border-brand-green/20 bg-amber-50 flex items-center justify-center">
                    <Icon size={30} className="text-brand-green opacity-80" />
                  </div>
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-brand-green text-white text-xs font-bold flex items-center justify-center">
                    {number}
                  </span>
                </div>

                {/* Card */}
                <div className="bg-white border border-gray-100 rounded-2xl px-6 py-6 shadow-sm w-full mt-3">
                  <h3 className="font-bold text-gray-900 text-lg mb-3">{title}</h3>
                  <div className="w-8 h-0.5 bg-brand-green mb-3 rounded-full mx-auto" />
                  <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        className="relative bg-brand-dark py-20 overflow-hidden"
        aria-label="Call to action"
      >
        {/* Subtle background texture */}
        <div
          className="absolute inset-0 opacity-10 bg-[url('/hero.png')] bg-cover bg-center"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-brand-dark/80" aria-hidden="true" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            Let's create the right solution for you.
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Whether you are selling a property or looking to grow your portfolio,
            Thérayan Partners is here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-brand-green text-white font-semibold text-sm px-8 py-3.5 hover:bg-amber-600 transition-colors tracking-widest uppercase"
            >
              I want to sell
              <ArrowRight size={16} />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 border border-white/50 text-white font-semibold text-sm px-8 py-3.5 hover:border-brand-green hover:text-brand-green transition-colors tracking-widest uppercase"
            >
              I want to invest
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
