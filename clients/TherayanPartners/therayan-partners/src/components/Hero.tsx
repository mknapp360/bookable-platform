import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section
      className="relative bg-brand-dark pt-16 min-h-screen flex items-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background hero image — right half blending in */}
      <div
        className="absolute inset-y-0 right-0 w-full lg:w-3/5"
        aria-hidden="true"
      >
        <img
          src="/hero.png"
          alt=""
          className="w-full h-full object-cover object-center opacity-60 lg:opacity-100"
        />
        {/* Gradient overlay — fades the image into the dark left panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="max-w-xl">

          {/* Eyebrow */}
          <p className="text-brand-green text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            Strategic solutions for sellers.&nbsp; Sustainable growth for investors.
          </p>

          {/* Divider */}
          <div className="w-8 h-0.5 bg-brand-green mb-8" />

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-8">
            Connecting{' '}
            <span className="text-brand-green">
              property opportunity
            </span>{' '}
            with investment ambition.
          </h1>

          {/* Sub-copy */}
          <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-md">
            We create innovative, tailor-made strategies that deliver strong
            outcomes for sellers and long-term growth for property investors.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-brand-green text-white font-semibold text-sm px-7 py-3.5 hover:bg-amber-600 transition-colors tracking-widest uppercase"
            >
              I want to sell
              <ArrowRight size={16} />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 border border-white/60 text-white font-semibold text-sm px-7 py-3.5 hover:border-brand-green hover:text-brand-green transition-colors tracking-widest uppercase"
            >
              I want to invest
              <ArrowRight size={16} />
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}
