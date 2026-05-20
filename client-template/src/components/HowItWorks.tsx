import { ArrowRight, Users, Network, Code2, CheckCircle, ShieldCheck } from 'lucide-react'

interface HowItWorksProps {
  onQuiz: () => void
}

const steps = [
  {
    number: '01',
    icon: Users,
    title: 'We understand\nyour business',
    description: 'A short call to map how you actually operate — where deals stall, admin builds up, and what should be happening automatically.',
  },
  {
    number: '02',
    icon: Network,
    title: 'We design\nyour system',
    description: 'We map your entire workflow — from lead to completion — and design how everything connects and runs automatically.',
  },
  {
    number: '03',
    icon: Code2,
    title: 'We build and\ninstall it',
    description: 'We build your system around your exact process — not a template, not off-the-shelf software. Then we put it straight into your business.',
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Your business\nruns differently',
    description: 'Leads are captured. Clients onboard themselves. Tasks, documents and follow-ups happen automatically. You focus on the work — not the admin.',
  },
]

const trustItems = [
  'Fixed monthly pricing from £75/month',
  'No per-user fees\nCancel anytime',
  'Built for regulated professionals',
]

export default function HowItWorks({ onQuiz }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-brand-green uppercase tracking-widest mb-4">How it works</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
            Simple. Fast. Built around your business.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            From conversation to a fully automated business — in weeks, not months.
          </p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 items-stretch">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative">
                {/* Arrow connector */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-10 -right-3 z-10 items-center justify-center">
                    <ArrowRight size={20} className="text-brand-green" />
                  </div>
                )}
                <div className="flex flex-col items-center h-full">
                  {/* Icon above card */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                      <Icon size={34} className="text-brand-green opacity-70" />
                    </div>
                    <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-brand-green text-white text-xs font-bold flex items-center justify-center">
                      {step.number}
                    </span>
                  </div>
                  {/* Card */}
                  <div className="bg-white rounded-2xl mt-3.5 px-6 py-6 border border-gray-100 shadow-sm w-full flex-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-snug mb-3 whitespace-pre-line text-center">{step.title}</h3>
                    <div className="w-8 h-0.5 bg-brand-green mb-3 rounded-full mx-auto" />
                    <p className="text-sm text-gray-500 leading-relaxed text-center">{step.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom banner */}
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} className="text-brand-green" />
            </div>
            <div>
              <p className="font-bold text-gray-900">No long IT projects. No disruption.</p>
              <p className="text-sm text-gray-600 mt-0.5">
                Most systems are <span className="text-brand-green font-semibold">live within a few weeks.</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {trustItems.map((item) => (
              <span key={item} className="flex items-start gap-1.5 text-sm text-gray-600 whitespace-pre-line">
                <span className="text-brand-green font-bold mt-0.5">✓</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onQuiz}
            className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-green-700 transition-colors"
          >
            See how your business would run automated
            <ArrowRight size={18} />
          </button>
          <p className="mt-3 text-sm text-gray-400">No obligation. Just clarity.</p>
        </div>

      </div>
    </section>
  )
}
