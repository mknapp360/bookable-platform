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
    q: 'Will this support my compliance requirements?',
    a: 'Yes. Systems are structured to maintain full audit trails and document tracking throughout the case lifecycle. Every action is logged, every document is stored against the case, and the system is designed with regulated environments in mind.',
  },
  {
    q: 'Can I track every stage of a case?',
    a: 'Yes — each case follows a defined, visible journey. You can see at a glance where every case sits, what\'s outstanding, and what needs action. No guesswork, no digging through emails.',
  },
  {
    q: 'Do I need to change how I work?',
    a: 'No. The system is built around your existing process — not the other way around. We start by mapping how your cases actually progress and build the system to reflect that exactly.',
  },
  {
    q: 'Can this replace my spreadsheets entirely?',
    a: 'Yes — that\'s exactly the goal. Spreadsheets get replaced by a structured system that does the same job better, with less effort and a complete audit trail built in.',
  },
  {
    q: 'How long does it take to go live?',
    a: 'Most systems are live within 2–4 weeks of the initial scoping call. We configure your case stages, document types, client intake and automations to match your workflow precisely.',
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

export default function CrmEquityReleasePage() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingNav onBook={() => setBookingOpen(true)} />

      {/* ── HERO ── */}
      <section className="bg-bookable-dark pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-bookable-green text-sm font-semibold uppercase tracking-widest mb-4">
            CRM for Equity Release Advisors UK
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Manage complex cases and compliance with one system built around{' '}
            <span className="text-bookable-green">how equity release actually works</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Manage complex cases, compliance, and client journeys with one automated system
            built around how equity release actually works.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setBookingOpen(true)}
              className="bg-bookable-green text-white px-7 py-3.5 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              See how your process would run automated
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
          <SectionLabel>The reality of equity release</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Equity release isn't a fast transaction.{' '}
            <span className="text-bookable-green">It's a process.</span>
          </h2>
          <div className="text-gray-600 leading-relaxed space-y-4 text-lg">
            <p>
              Clients need time. Documentation needs to be complete. Compliance needs to be
              watertight.
            </p>
            <p>And yet most advisors are managing this with:</p>
            <ul className="space-y-2 my-4">
              <CrossItem>Spreadsheets</CrossItem>
              <CrossItem>Email chains</CrossItem>
              <CrossItem>Manual follow-ups</CrossItem>
            </ul>
            <p>Which creates a constant tension between:</p>
            <div className="flex flex-col sm:flex-row gap-3 my-4">
              <div className="flex-1 bg-bookable-grey rounded-xl px-5 py-4 text-base font-medium text-gray-700">
                Serving the client properly
              </div>
              <div className="flex-1 bg-bookable-grey rounded-xl px-5 py-4 text-base font-medium text-gray-700">
                Keeping the case moving
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="bg-bookable-grey py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>The real problem</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-10">
            A typical equity release workflow
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-7 border border-gray-200">
              <p className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                What most advisors are working with
              </p>
              <ul className="space-y-3">
                <CrossItem>Initial enquiry captured manually</CrossItem>
                <CrossItem>Notes stored across multiple places</CrossItem>
                <CrossItem>Documents requested via email</CrossItem>
                <CrossItem>Follow-ups tracked in your head or calendar</CrossItem>
                <CrossItem>Compliance checks handled separately</CrossItem>
              </ul>
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-sm text-gray-500">It works… but only just.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-red-100">
              <p className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                Over time, this leads to
              </p>
              <ul className="space-y-3">
                <CrossItem>Missed follow-ups</CrossItem>
                <CrossItem>Incomplete document trails</CrossItem>
                <CrossItem>Slow case progression</CrossItem>
                <CrossItem>Increased compliance risk</CrossItem>
                <CrossItem>A poor client experience during a sensitive financial decision</CrossItem>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE SHIFT ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>A different way to think about it</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Equity release is not a sales pipeline.
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Most systems are built for fast-moving sales teams. Equity release is a guided,
            compliant journey. You don't need more tools — you need a system that manages
            the entire lifecycle of a case.
          </p>
          <div className="bg-bookable-grey rounded-2xl p-7">
            <p className="font-semibold text-gray-900 mb-4">What that system looks like:</p>
            <ul className="space-y-3">
              <Check>Structured stages that reflect how cases actually progress</Check>
              <Check>Document collection that happens automatically</Check>
              <Check>A full audit trail maintained without extra effort</Check>
              <Check>Visibility across every case, at every stage</Check>
            </ul>
          </div>
        </div>
      </section>

      {/* ── SOLUTION / WORKFLOW ── */}
      <section className="bg-bookable-dark py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>Your solution</SectionLabel>
          <h2 className="text-3xl font-bold text-white mb-3">
            A custom CRM built for equity release advisors
          </h2>
          <p className="text-gray-400 mb-12 text-lg">
            A system that reflects how your cases actually progress — not a generic pipeline
            bent to fit your workflow.
          </p>
          <div className="space-y-4">
            {[
              { n: '01', title: 'Enquiry captured automatically', body: 'Every new enquiry lands in the system immediately — from your website, referrals, or intake forms. Nothing falls through the cracks.' },
              { n: '02', title: 'Case created with full client profile', body: 'A complete case record is built from the start. Client details, property information, objectives — all in one place.' },
              { n: '03', title: 'Key stages defined', body: 'Fact-find → recommendation → application → completion. Each stage is clear, tracked, and visible. Your team always knows where a case stands.' },
              { n: '04', title: 'Document requests triggered automatically', body: 'At each stage, the right documents are requested automatically. No manual chasing, no missed items.' },
              { n: '05', title: 'Full audit trail maintained throughout', body: 'Every action, every document, every communication is logged against the case. Compliance confidence built in.' },
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
          <div className="mt-8 bg-white/5 rounded-xl p-5 border border-white/10">
            <p className="text-white font-semibold mb-3">At any moment, you can see:</p>
            <ul className="space-y-2">
              {['Where every case stands', 'What\'s outstanding', 'What needs action'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                  <CheckCircle size={15} className="text-bookable-green flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
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
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-7 border border-red-100">
              <p className="font-semibold text-red-500 mb-4 text-sm uppercase tracking-wide">Before</p>
              <ul className="space-y-3">
                <CrossItem>Spreadsheets</CrossItem>
                <CrossItem>Emails</CrossItem>
                <CrossItem>Manual tracking</CrossItem>
                <CrossItem>Chasing clients</CrossItem>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-green-100">
              <p className="font-semibold text-bookable-green mb-4 text-sm uppercase tracking-wide">After</p>
              <ul className="space-y-3">
                <Check>Structured case journeys</Check>
                <Check>Automated document collection</Check>
                <Check>Clear audit trail</Check>
                <Check>One system for everything</Check>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── EQUITY RELEASE CLIENT EMOTION ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>Why this really matters</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-10">
            Your clients deserve a smoother experience
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-bookable-grey rounded-2xl p-6 border border-gray-200">
              <p className="font-semibold text-gray-900 mb-3">Your clients are often</p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Older and more cautious</li>
                <li>Reliant on your guidance</li>
                <li>Making a significant financial decision</li>
              </ul>
            </div>
            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <p className="font-semibold text-gray-900 mb-3">A disorganised process creates</p>
              <ul className="space-y-2 text-sm">
                <CrossItem>Confusion</CrossItem>
                <CrossItem>Delays</CrossItem>
                <CrossItem>Loss of trust</CrossItem>
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <p className="font-semibold text-gray-900 mb-3">A structured system creates</p>
              <ul className="space-y-2 text-sm">
                <Check>Confidence</Check>
                <Check>Smoother journeys</Check>
                <Check>Better outcomes</Check>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUTCOMES ── */}
      <section className="bg-bookable-grey py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Outcomes</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-10">
            After implementing a structured system, advisors typically see
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { stat: 'Less',    label: 'Manual admin across the entire case lifecycle' },
              { stat: 'Faster',  label: 'Progression through defined case stages' },
              { stat: 'Fewer',   label: 'Missed follow-ups and outstanding document requests' },
              { stat: 'Full',    label: 'Document history accessible at any point' },
              { stat: 'Stronger', label: 'Compliance position with built-in audit trails' },
              { stat: 'Calmer',  label: 'More controlled workflow day to day' },
            ].map((item) => (
              <div key={item.stat} className="bg-white rounded-2xl p-6 border border-gray-200">
                <p className="text-2xl font-extrabold text-bookable-green mb-1">{item.stat}</p>
                <p className="text-gray-600 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY NOT OFF-THE-SHELF ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>Why not a standard CRM?</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Most CRMs weren't built for this
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Standard CRMs are built for sales teams, fast-moving deals, and generic
            pipelines. Equity release requires structured stages, document-heavy workflows,
            and full auditability. So you end up adapting your process to the CRM — and
            still relying on spreadsheets for everything else.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-bookable-grey rounded-2xl p-7 border border-gray-200">
              <p className="font-semibold text-gray-900 mb-4">Generic CRM approach</p>
              <ul className="space-y-3">
                <CrossItem>You adapt your process to the software</CrossItem>
                <CrossItem>Built for sales, not case management</CrossItem>
                <CrossItem>No built-in document trail</CrossItem>
                <CrossItem>Still need spreadsheets for the gaps</CrossItem>
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-7 border border-green-100">
              <p className="font-semibold text-gray-900 mb-4">The Bookable approach</p>
              <ul className="space-y-3">
                <Check>System built around your case workflow</Check>
                <Check>Structured for document-heavy, regulated processes</Check>
                <Check>Audit trail maintained automatically</Check>
                <Check>Replaces the spreadsheets entirely</Check>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="bg-bookable-grey py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Custom systems. Simplified pricing.
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Custom builds typically cost thousands upfront plus ongoing licensing. We've
            simplified the model.
          </p>
          <div className="bg-white rounded-2xl p-8 border border-gray-200 w-full">
            <p className="text-5xl font-extrabold text-gray-900 mb-1">
              £75<span className="text-lg font-medium text-gray-500">/month</span>
            </p>
            <p className="text-gray-500 mb-6">No per-user fees. No hidden costs.</p>
            <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto">
              <Check>Full custom case management build</Check>
              <Check>Your case stages and document types</Check>
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
      <section className="bg-white py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>Why Bookable</SectionLabel>
          <ul className="space-y-4">
            <Check>Built with financial services workflows in mind</Check>
            <Check>Designed for regulated environments from the ground up</Check>
            <Check>Focused on clarity, control, and compliance — not generic features</Check>
          </ul>
        </div>
      </section>

      {/* ── CTA REPEAT ── */}
      <section className="bg-bookable-dark py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            See how your equity release process could run fully automated
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Book a demo and walk through exactly how the system would work for your cases.
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
              Walk through your exact workflow
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

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  )
}
