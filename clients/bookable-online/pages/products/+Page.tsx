import { Briefcase, UtensilsCrossed, Building2, BookOpen, ShieldCheck, QrCode } from 'lucide-react'
import Navbar from '../../src/components/Navbar'
import Footer from '../../src/components/Footer'

const products = [
  {
    icon: Briefcase,
    name: 'Bookable CRM',
    href: 'https://www.bookablecrm.com/',
    audience: 'For small business owners & regulated professionals',
    description:
      'Your pipeline, your process. Cases tracked, clients chased, documents generated \u2014 without a human in the loop for every step. Live since August 2020.',
  },
  {
    icon: UtensilsCrossed,
    name: 'Dining Steward',
    href: 'https://diningsteward.app',
    audience: 'For membership clubs and private dining operators',
    description:
      'Covers, events, members \u2014 managed in one place. Stop cross-referencing spreadsheets every time a booking changes. Live since September 2025.',
  },
  {
    icon: Building2,
    name: 'PropWorth',
    href: 'https://propworth.co.uk',
    audience: 'For letting agents',
    description:
      'Built in response to the Renters\u2019 Rights Act 2026. Letting agencies using PropWorth went from manually keeping up with notification cycles in spreadsheets to automated notifications and document prompts. Live since May 2026.',
  },
  {
    icon: BookOpen,
    name: 'Pagewright',
    href: 'https://www.pagewright.co/',
    audience: 'For authors and writing professionals',
    description:
      'Plan, draft and publish without switching between five different tools. Your whole writing workflow in a single place. Live since April 2026.',
  },
  {
    icon: ShieldCheck,
    name: 'SafeReg',
    href: 'https://www.safereg.co/',
    audience: 'For organisations that need registration and compliance records',
    description:
      'Registrations captured, compliance records stored, renewal reminders sent. No manual chasing. Live since November 2025.',
  },
  {
    icon: QrCode,
    name: 'QR Card',
    href: 'https://qrcard.bookable.online/',
    audience: 'For professionals who network',
    description:
      'Your contact details, always current. Share instantly via QR. No more out-of-date business cards. Live since May 2026.',
  },
]

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-bookable-green uppercase tracking-widest mb-4">
              Our products
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              Built for the operator, not the shelf
            </h1>
            <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
              Each product targets a specific niche where standard software doesn't fit.
              Outcome first. Technology underneath.
            </p>
          </div>

          {/* Product cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const Icon = product.icon
              return (
                <a key={product.name} href={product.href} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-bookable-green" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-snug">{product.name}</h3>
                      <p className="text-xs text-bookable-green font-medium mt-0.5">{product.audience}</p>
                    </div>
                  </div>
                  <div className="w-8 h-0.5 bg-bookable-green mb-3 rounded-full ml-[52px]" />
                  <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
                </a>
              )
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm font-semibold text-gray-900">
              Not sure which fits? Book a conversation and we'll tell you straight.
            </p>
            <a
              href="/#contact"
              className="bg-bookable-green text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
            >
              Book a conversation
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
