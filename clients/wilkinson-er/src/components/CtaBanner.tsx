import { Phone } from 'lucide-react'

export default function CtaBanner() {
  return (
    <section
      id="contact"
      className="relative py-20 sm:py-28 bg-brand-navy overflow-hidden"
    >
      {/* Subtle background image */}
      <div className="absolute inset-0 opacity-10">
        <img
          src="/middle_right.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          Retirement Should Feel Secure.
          <br />
          <span className="font-script text-brand-gold font-normal text-3xl sm:text-4xl">
            Not Stressful.
          </span>
        </h2>

        <p className="text-white/70 text-base sm:text-lg mb-10 max-w-xl mx-auto">
          Let's unlock the potential in your home together.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contact-form"
            className="inline-flex items-center gap-2 bg-brand-gold text-brand-navy px-8 py-4 rounded-md text-base font-semibold hover:bg-brand-gold/90 transition-colors shadow-lg"
          >
            Book Your Free Consultation
          </a>

          <a
            href="tel:01onal"
            className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-md text-base font-semibold hover:border-brand-gold hover:text-brand-gold transition-colors"
          >
            <Phone className="w-5 h-5" />
            01onal
          </a>
        </div>
      </div>
    </section>
  )
}
