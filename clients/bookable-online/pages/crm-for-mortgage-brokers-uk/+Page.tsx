import { useState } from 'react'
import { CheckCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import BookingModal from '../../src/components/BookingModal'
import Footer from '../../src/components/Footer'

// ── Minimal landing nav ────────────────────────────────────────────────────

function LandingNav({ onBook }: { onBook: () => void }) {
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <img src="/logo.png" alt="Bookable" className="h-8 w-auto" />
        </a>
        <div className="flex items-center gap-5">
          <a
            href="tel:07562080026"
            className="hidden sm:block text-sm font-semibold text-gray-700 hover:text-bookable-green transition-colors"
          >
            07562 080026
          </a>
          <button
            onClick={onBook}
            className="bg-bookable-green text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Book a demo
          </button>
        </div>
      </div>
    </nav>
  )
}

// ── FAQ accordion ──────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Do I need to migrate all my data?',
    a: 'We handle migration from spreadsheets and existing systems. Most brokers are surprised how straightforward it is — we map your existing data to the new system so nothing gets lost.',
  },
  {
    q: 'Will this work with my current tools?',
    a: 'We can integrate or replace depending on what you need. Common integrations include sourcing platforms, email, calendar and accounting tools. Where an integration isn\'t worth the complexity, we build a better replacement.',
  },
  {
    q: 'How long does it take to go live?',
    a: 'Most systems are live within 2–4 weeks of the initial scoping call. We configure your pipeline stages, document types, intake forms and automations to match exactly how your business works.',
  },
  {
    q: 'Is this compliant with FCA requirements?',
    a: 'The system is structured to support audit trails, documentation workflows and data retention. We\'ve designed it with regulated environments in mind. You should always verify compliance with your compliance officer, but the architecture is built to support it.',
  },
  {
    q: 'What happens if we grow — can the system scale?',
    a: 'Yes. The system scales without per-user fees. Whether you add advisers, admin staff or new product lines, the monthly cost stays at £75. The platform grows with your business.',
  },
]

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 overflow-hidden">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="bg-white">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900 pr-4">{item.q}</span>
            {open === i ? (
              <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
            )}
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm">{item.a}</div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Shared primitives ──────────────────────────────────────────────────────

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle size={18} className="text-bookable-green mt-0.5 flex-shrink-0" />
      <span className="text-gray-700">{children}</span>
    </li>
  )
}

function CrossItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-red-400 mt-0.5 flex-shrink-0 font-bold text-sm">✕</span>
      <span className="text-gray-700">{children}</span>
    </li>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-bookable-green mb-3">
      {children}
    </p>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function CrmMortgageBrokersPage() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingNav onBook={() => setBookingOpen(true)} />

      {/* ── HERO ── */}
      <section className="bg-bookable-dark pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-bookable-green text-sm font-semibold uppercase tracking-widest mb-4">
            CRM for Mortgage Brokers UK
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Replace spreadsheets and admin with one system built around{' '}
            <span className="text-bookable-green">your brokerage</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Replace spreadsheets, admin, and scattered tools with one automated system built
            around how your brokerage actually works.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setBookingOpen(true)}
              className="bg-bookable-green text-white px-7 py-3.5 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              See how your business would run automated
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setBookingOpen(true)}
              className="border border-white/30 text-white px-7 py-3.5 rounded-xl font-semibold text-base hover:bg-white/10 transition-colors"
            >
              Book a demo
            </button>
          </div>
        </div>
      </section>

      {/* ── OPENING HOOK ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>The real situation</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Most mortgage brokers don't have a CRM problem.{' '}
            <span className="text-bookable-green">They have a workflow problem.</span>
          </h2>
          <div className="text-gray-600 leading-relaxed space-y-4 text-lg">
            <p>
              Leads come in from multiple sources. Client data is scattered across
              spreadsheets, emails, and sourcing tools. Documents are chased manually. And
              compliance becomes a constant background pressure.
            </p>
            <p>So you end up doing what most firms do:</p>
            <p className="font-semibold text-gray-900">You build workarounds.</p>
            <p>
              More spreadsheets. More manual steps. More admin. Until the system itself
              becomes the bottleneck.
            </p>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="bg-bookable-grey py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>The real problem</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-10">
            Typical mortgage broker setup
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {/* What they have */}
            <div className="bg-white rounded-2xl p-7 border border-gray-200">
              <p className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                What most brokers are working with
              </p>
              <ul className="space-y-3">
                <CrossItem>Excel or Google Sheets tracking clients</CrossItem>
                <CrossItem>Email threads for document collection</CrossItem>
                <CrossItem>Notes stored inconsistently</CrossItem>
                <CrossItem>Multiple tools that don't talk to each other</CrossItem>
                <CrossItem>Manual follow-ups for every case</CrossItem>
              </ul>
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-sm font-semibold text-red-500">
                  This isn't a CRM. It's a patchwork.
                </p>
              </div>
            </div>
            {/* What that leads to */}
            <div className="bg-white rounded-2xl p-7 border border-red-100">
              <p className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                And it leads to
              </p>
              <ul className="space-y-3">
                <CrossItem>Lost leads</CrossItem>
                <CrossItem>Delayed cases</CrossItem>
                <CrossItem>Compliance risk</CrossItem>
                <CrossItem>Hours of admin every week</CrossItem>
                <CrossItem>No visibility across your pipeline</CrossItem>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE SHIFT ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>What you actually need</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Not "a CRM". A system.
          </h2>
          <p className="text-gray-500 mb-10 text-lg">
            What most brokers actually need isn't another tool to log into. They need a
            system that runs the workflow for them.
          </p>
          <ul className="space-y-4">
            <Check>Tracks every lead automatically</Check>
            <Check>Moves cases through defined stages</Check>
            <Check>Collects documents without chasing</Check>
            <Check>Keeps everything audit-ready</Check>
            <Check>Reduces admin to near zero</Check>
          </ul>
        </div>
      </section>

      {/* ── SOLUTION / WORKFLOW ── */}
      <section className="bg-bookable-dark py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>Your solution</SectionLabel>
          <h2 className="text-3xl font-bold text-white mb-3">
            A custom CRM built for your brokerage
          </h2>
          <p className="text-gray-400 mb-12 text-lg">
            Not a generic tool. Not another login. A system designed around your exact
            workflow.
          </p>
          <div className="space-y-4">
            {[
              { n: '01', title: 'Lead comes in', body: 'Automatically captured from your website, referral sources or intake forms — no manual entry.' },
              { n: '02', title: 'Assigned to pipeline stage', body: 'The lead lands in the right stage immediately. Your team knows exactly what needs to happen next.' },
              { n: '03', title: 'Client receives document request instantly', body: 'Automated messaging prompts the client for the right documents at the right time.' },
              { n: '04', title: 'Documents stored against the case', body: 'Everything in one place, attached to the client record. No hunting through email threads.' },
              { n: '05', title: 'Case progresses automatically', body: 'Stage transitions trigger the next action. You always know where every deal is, what\'s missing, and what needs attention.' },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-5 bg-white/5 rounded-xl p-5 border border-white/10">
                <span className="text-bookable-green font-bold text-sm flex-shrink-0 w-8 pt-0.5">{step.n}</span>
                <div>
                  <p className="font-semibold text-white mb-1">{step.title}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="bg-bookable-grey py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>The transformation</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            From this → To this
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div className="bg-white rounded-2xl p-7 border border-red-100">
              <p className="font-semibold text-red-500 mb-4 text-sm uppercase tracking-wide">Before</p>
              <ul className="space-y-3">
                <CrossItem>Spreadsheet</CrossItem>
                <CrossItem>Email threads</CrossItem>
                <CrossItem>Inconsistent notes</CrossItem>
                <CrossItem>Chasing clients manually</CrossItem>
                <CrossItem>No visibility</CrossItem>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-green-100">
              <p className="font-semibold text-bookable-green mb-4 text-sm uppercase tracking-wide">After</p>
              <ul className="space-y-3">
                <Check>One system</Check>
                <Check>One pipeline</Check>
                <Check>One source of truth</Check>
                <Check>Automated workflows</Check>
                <Check>Complete visibility</Check>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUTCOMES ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Outcomes</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-10">
            After implementation, most brokers see
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { stat: '50–70%', label: 'Reduction in admin time' },
              { stat: 'Faster', label: 'Case progression across the board' },
              { stat: 'Fewer', label: 'Missed or delayed document requests' },
              { stat: 'Full', label: 'Pipeline visibility at all times' },
              { stat: 'Scales', label: 'System grows with your business without extra cost' },
            ].map((item) => (
              <div key={item.stat} className="bg-bookable-grey rounded-2xl p-6 border border-gray-200">
                <p className="text-2xl font-extrabold text-bookable-green mb-1">{item.stat}</p>
                <p className="text-gray-600 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY NOT OFF-THE-SHELF ── */}
      <section className="bg-bookable-grey py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>Why not just use HubSpot?</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Off-the-shelf CRMs are built for sales teams, not broker workflows
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            So you end up bending your process to fit the software, paying for features you
            don't use, and still relying on spreadsheets for the things it can't handle.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-7 border border-red-100">
              <p className="font-semibold text-gray-900 mb-4">Generic CRM approach</p>
              <ul className="space-y-3">
                <CrossItem>You adapt your process to the software</CrossItem>
                <CrossItem>Pay for features you'll never use</CrossItem>
                <CrossItem>Per-seat pricing that grows with headcount</CrossItem>
                <CrossItem>Still need spreadsheets for the gaps</CrossItem>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-green-100">
              <p className="font-semibold text-gray-900 mb-4">The Bookable approach</p>
              <ul className="space-y-3">
                <Check>System fits your business — not the other way round</Check>
                <Check>Built for exactly your workflow</Check>
                <Check>Flat monthly fee, no per-user costs</Check>
                <Check>Replaces the spreadsheets entirely</Check>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Custom systems. Productised pricing.
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Custom builds typically cost £5,000–£20,000 with ongoing retainers. We've
            productised the process.
          </p>
          <div className="bg-bookable-grey rounded-2xl p-8 border border-gray-200 inline-block w-full">
            <p className="text-5xl font-extrabold text-gray-900 mb-1">
              £75<span className="text-lg font-medium text-gray-500">/month</span>
            </p>
            <p className="text-gray-500 mb-6">No per-user fees. No hidden costs.</p>
            <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto">
              <Check>Full custom CRM build</Check>
              <Check>Your workflow, your pipeline stages</Check>
              <Check>Automated document collection</Check>
              <Check>Ongoing support and updates</Check>
            </ul>
            <button
              onClick={() => setBookingOpen(true)}
              className="bg-bookable-green text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity w-full sm:w-auto"
            >
              Book a walkthrough
            </button>
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="bg-bookable-grey py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>Why Bookable</SectionLabel>
          <ul className="space-y-4">
            <Check>Built by someone with financial services experience</Check>
            <Check>Designed for regulated environments from the ground up</Check>
            <Check>Focused on real workflows — not theoretical features</Check>
          </ul>
        </div>
      </section>

      {/* ── CTA REPEAT ── */}
      <section className="bg-bookable-dark py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            See how your brokerage would run fully automated
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Book a demo and get a walkthrough of exactly how the system would work for your
            business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setBookingOpen(true)}
              className="bg-bookable-green text-white px-7 py-3.5 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Book a demo
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setBookingOpen(true)}
              className="border border-white/30 text-white px-7 py-3.5 rounded-xl font-semibold text-base hover:bg-white/10 transition-colors"
            >
              Get a walkthrough of your exact workflow
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Common questions</h2>
          <FaqAccordion />
        </div>
      </section>

      <Footer />

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  )
}
