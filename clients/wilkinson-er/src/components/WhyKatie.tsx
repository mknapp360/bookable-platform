import { Quote } from 'lucide-react'

export default function WhyKatie() {
  return (
    <section id="why-katie" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
            Why Clients Choose Kate Wilkinson
          </h2>
          <div className="w-16 h-1 bg-brand-gold mx-auto" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/middle_left.png"
                alt="Kate Wilkinson, Equity Release Specialist"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-gold/20 rounded-2xl -z-10" />
          </div>

          {/* Content */}
          <div>
            <div className="relative mb-8">
              <Quote className="w-10 h-10 text-brand-gold/40 absolute -top-2 -left-2" />
              <blockquote className="pl-8 font-serif text-xl sm:text-2xl text-brand-navy italic leading-relaxed">
                My goal is to help people enjoy their retirement with confidence and peace of mind.
              </blockquote>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'Fully qualified, FCA-regulated adviser',
                'Whole-of-market access — impartial, unbiased advice',
                'Personal, face-to-face consultations',
                'Transparent process with no hidden fees',
                'Member of the Equity Release Council',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-gold flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="#contact-form"
              className="inline-flex items-center gap-2 bg-brand-gold text-brand-navy px-7 py-3.5 rounded-md text-sm font-semibold hover:bg-brand-gold/90 transition-colors"
            >
              Book a Free Consultation
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
