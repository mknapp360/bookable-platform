import { useData } from 'vike-react/useData'
import type { Data } from './+data'

export default function LocationLandingPage() {
  const { sector, location } = useData<Data>()

  const locationLabel = location.type === 'city' && location.county
    ? `${location.name}, ${location.county}`
    : location.name

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center"><img src="/logo.png" alt="bookable" className="h-7 w-auto" /></a>
          <nav className="hidden sm:flex gap-6 text-sm text-gray-500">
            <a href="/#what-we-build" className="hover:text-gray-900 transition-colors">What we build</a>
            <a href="/blog" className="hover:text-gray-900 transition-colors">Blog</a>
          </nav>
          <a
            href="/"
            className="bg-brand-green text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-green-700 transition-colors"
          >
            Get started
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-brand-green uppercase tracking-widest mb-3">
            {locationLabel} · {location.region}
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            {sector.headline} in {location.name}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl leading-relaxed mb-8">
            {sector.intro}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-brand-green text-white px-8 py-3.5 rounded-full font-semibold hover:bg-green-700 transition-colors"
            >
              See if we can help you
            </a>
            <a
              href="/#what-we-build"
              className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-8 py-3.5 rounded-full font-semibold hover:border-gray-400 transition-colors"
            >
              See what we build
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            £500 setup · £75/month · No per-user fees · Cancel any time
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Sound familiar?
          </h2>
          <ul className="space-y-4">
            {sector.problems.map((p) => (
              <li key={p} className="flex gap-3 items-start">
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold">✕</span>
                <span className="text-gray-600">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Bookable builds for {sector.namePlural} in {location.name}
          </h2>
          <p className="text-gray-500 mb-10">
            Custom-built. No off-the-shelf software. No adapting your process to fit a product.
            Your logic, your workflow, built to order.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {sector.solutions.map((s) => (
              <div key={s.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Fixed price. Built for {location.name}.
          </h2>
          <p className="text-gray-500 mb-8">
            No per-user fees. No surprise costs. One setup fee, one monthly fee — and a system
            built exactly for how {sector.namePlural.toLowerCase()} in {locationLabel} actually work.
          </p>
          <div className="inline-flex items-center gap-8 bg-gray-50 rounded-2xl px-8 py-6 mb-8 border border-gray-100">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-gray-900">£500</p>
              <p className="text-sm text-gray-500 mt-1">One-time setup</p>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center">
              <p className="text-3xl font-extrabold text-gray-900">£75</p>
              <p className="text-sm text-gray-500 mt-1">Per month</p>
            </div>
          </div>
          <div>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-brand-green text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-green-700 transition-colors"
            >
              Start the conversation
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">
            Common questions from {sector.namePlural.toLowerCase()} in {location.name}
          </h2>
          <div className="space-y-6">
            {sector.faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <a href="/" className="flex items-center"><img src="/logo.png" alt="bookable" className="h-7 w-auto" /></a>
          <p>© {new Date().getFullYear()} Bookable · Custom CRM &amp; automation for finance, property and legal · {location.region}</p>
          <a href="/blog" className="hover:text-gray-600 transition-colors">Blog</a>
        </div>
      </footer>
    </div>
  )
}
