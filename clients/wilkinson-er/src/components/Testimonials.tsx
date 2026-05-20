import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Margaret & David H.',
    location: 'Surrey',
    text: "Kate made the whole process so straightforward. We were nervous about equity release, but she explained everything clearly and found us a plan that gives us real peace of mind.",
    stars: 5,
  },
  {
    name: 'Brian T.',
    location: 'Kent',
    text: "I wanted to help my daughter with a house deposit. Kate found the perfect solution and handled everything. I couldn't have asked for better service.",
    stars: 5,
  },
  {
    name: 'Susan & Peter L.',
    location: 'Hampshire',
    text: "After retiring, our income dropped significantly. Kate helped us unlock the value in our home without any stress. She's been wonderful throughout.",
    stars: 5,
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
            What My Clients Say
          </h2>
          <div className="w-16 h-1 bg-brand-gold mx-auto" />
        </div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-brand-gold fill-brand-gold"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">
                "{t.text}"
              </p>

              {/* Attribution */}
              <div className="border-t border-gray-100 pt-4">
                <p className="font-semibold text-brand-navy text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
