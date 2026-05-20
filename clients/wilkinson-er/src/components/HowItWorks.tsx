import { MessageCircle, Search, FileCheck, HeartHandshake } from 'lucide-react'

const steps = [
  {
    icon: MessageCircle,
    number: '01',
    title: 'Free Consultation',
    description:
      'We start with a relaxed, no-obligation chat to understand your circumstances, goals, and answer your questions.',
  },
  {
    icon: Search,
    number: '02',
    title: 'Explore Your Options',
    description:
      'I research the whole market to find the most suitable equity release or later life mortgage products for you.',
  },
  {
    icon: FileCheck,
    number: '03',
    title: 'Application & Completion',
    description:
      'I handle the paperwork and liaise with solicitors and lenders, keeping you informed every step of the way.',
  },
  {
    icon: HeartHandshake,
    number: '04',
    title: 'Ongoing Support',
    description:
      'Your needs may change over time. I provide annual reviews and continued support throughout the life of your plan.',
  },
]

export default function HowItWorks() {
  return (
    <section id="journey" className="py-20 sm:py-28 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
            Your Journey With Kate
          </h2>
          <div className="w-16 h-1 bg-brand-gold mx-auto" />
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center group">
              {/* Icon circle with number badge */}
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-full bg-brand-navy flex items-center justify-center mx-auto group-hover:bg-brand-teal transition-colors">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-brand-gold text-brand-navy text-xs font-bold flex items-center justify-center">
                  {step.number}
                </span>
              </div>

              {/* Content card */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-serif text-lg font-semibold text-brand-navy mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
