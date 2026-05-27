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
    q: 'Can this handle document storage and drafts?',
    a: 'Yes — documents are stored, organised, and linked to each client case. Drafts are versioned clearly so there\'s no confusion over which is the current version. Everything is accessible in one place, attached to the right client.',
  },
  {
    q: 'Will this replace my spreadsheets and folders?',
    a: 'Yes — that\'s exactly what it\'s designed to do. Spreadsheets, paper files, and folder structures are replaced by a single system that tracks clients, documents, and case progression automatically.',
  },
  {
    q: 'Do I need to change how I work?',
    a: 'No. The system is built around your current workflow. We start by mapping how your cases progress and build the system to reflect that exactly — not the other way around.',
  },
  {
    q: 'Is this suitable for a small will writing firm?',
    a: 'Yes — especially those looking to scale without increasing admin overhead. The system gives you the structure to handle more clients without adding more complexity to your process.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most systems are live within 2–4 weeks of the initial scoping call. We configure your client stages, document types, and workflows to match your practice precisely.',
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
            {open === i
              ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
              : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
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

export default function CrmWillWritersPage() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingNav onBook={() => setBookingOpen(true)} />

      {/* ── HERO ── */}
      <section className="bg-bookable-dark pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-bookable-green text-sm font-semibold uppercase tracking-widest mb-4">
            CRM for Will Writers UK
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Replace paperwork and manual processes with one system built around{' '}
            <span className="text-bookable-green">your practice</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Replace paperwork, spreadsheets, and manual processes with one system that
            manages every client, document, and case from start to finish.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setBookingOpen(true)}
              className="bg-bookable-green text-white px-7 py-3.5 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              See your practice run without admin
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
          <SectionLabel>The real challenge</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Most will writing firms don't struggle with getting clients.{' '}
            <span className="text-bookable-green">They struggle with everything that comes after.</span>
          </h2>
          <div className="text-gray-600 leading-relaxed space-y-4 text-lg">
            <p>
              Client details. Documents. Instructions. Revisions. Storage. Compliance.
            </p>
            <p>It all builds up. And most of it is handled manually.</p>
            <p>
              Which means every new client adds not just work — but complexity. More to
              track. More to remember. More that can go wrong.
            </p>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="bg-bookable-grey py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>The real problem</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-10">
            A typical will writing workflow
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-7 border border-gray-200">
              <p className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                What most firms are working with
              </p>
              <ul className="space-y-3">
                <CrossItem>Client details captured on paper or basic forms</CrossItem>
                <CrossItem>Notes stored in Word documents or emails</CrossItem>
                <CrossItem>Drafts saved in folders with no versioning</CrossItem>
                <CrossItem>Documents sent back and forth manually</CrossItem>
                <CrossItem>Follow-ups tracked in diaries or spreadsheets</CrossItem>
              </ul>
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-sm text-gray-500">It works… until volume increases.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-red-100">
              <p className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                Then you get
              </p>
              <ul className="space-y-3">
                <CrossItem>Lost documents</CrossItem>
                <CrossItem>Version confusion</CrossItem>
                <CrossItem>Missed follow-ups</CrossItem>
                <CrossItem>Inconsistent processes</CrossItem>
                <CrossItem>Growing admin overhead</CrossItem>
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
            Not "software". Structure.
          </h2>
          <p className="text-gray-500 mb-8 text-lg leading-relaxed">
            Most will writers don't need another tool to learn. They need a system that
            keeps everything organised without them having to think about it.
          </p>
          <ul className="space-y-4">
            <Check>Every client kept organised automatically</Check>
            <Check>Every stage of the process tracked clearly</Check>
            <Check>Every document stored in one place</Check>
            <Check>No need to remember what happens next — the system does it</Check>
          </ul>
        </div>
      </section>

      {/* ── SOLUTION / WORKFLOW ── */}
      <section className="bg-bookable-dark py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>Your solution</SectionLabel>
          <h2 className="text-3xl font-bold text-white mb-3">
            A custom CRM built for will writing practices
          </h2>
          <p className="text-gray-400 mb-12 text-lg">
            Built around how your work actually flows — not a generic system bent to fit.
          </p>
          <div className="space-y-4">
            {[
              { n: '01', title: 'New client enquiry captured', body: 'Every enquiry lands in the system immediately — from your website, referrals, or intake forms. No manual entry, nothing missed.' },
              { n: '02', title: 'Client profile created automatically', body: 'Full client record built from the start. Personal details, family structure, assets, wishes — everything in one place.' },
              { n: '03', title: 'Instruction stage logged and structured', body: 'The instruction is recorded against the case with a clear status. You always know where you are with every client.' },
              { n: '04', title: 'Draft documents stored and versioned', body: 'Drafts are attached to the case, versioned clearly. No more hunting through folders or emailing files back and forth.' },
              { n: '05', title: 'Revisions tracked clearly', body: 'Changes are logged against the case. You can see exactly what changed, when, and why — without digging through email threads.' },
              { n: '06', title: 'Final documents stored and case completed', body: 'Completed wills are stored securely against the client record. The case is marked complete with a full, clean history.' },
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
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {['Everything in one place', 'Nothing lost', 'Nothing missed'].map((item) => (
              <div key={item} className="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                <CheckCircle size={15} className="text-bookable-green flex-shrink-0" />
                <span className="text-white text-sm font-medium">{item}</span>
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
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-7 border border-red-100">
              <p className="font-semibold text-red-500 mb-4 text-sm uppercase tracking-wide">Before</p>
              <ul className="space-y-3">
                <CrossItem>Paper files</CrossItem>
                <CrossItem>Word documents</CrossItem>
                <CrossItem>Email chains</CrossItem>
                <CrossItem>Spreadsheets</CrossItem>
                <CrossItem>Manual tracking</CrossItem>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-green-100">
              <p className="font-semibold text-bookable-green mb-4 text-sm uppercase tracking-wide">After</p>
              <ul className="space-y-3">
                <Check>One system</Check>
                <Check>Structured client journeys</Check>
                <Check>Centralised document storage</Check>
                <Check>Clear case progression</Check>
                <Check>Automated reminders</Check>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY THIS MATTERS ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>Why this really matters</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Will writing is detail-heavy, document-heavy, and process-driven
          </h2>
          <p className="text-gray-600 text-lg mb-10 leading-relaxed">
            Small mistakes can lead to client dissatisfaction, legal issues, or reputational
            damage. A structured system removes the risk that comes from relying on memory,
            manual processes, and ad hoc organisation.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <p className="font-semibold text-gray-900 mb-3">Without structure</p>
              <ul className="space-y-2 text-sm">
                <CrossItem>Inconsistency across cases</CrossItem>
                <CrossItem>Errors due to missed steps</CrossItem>
                <CrossItem>Hard to scale</CrossItem>
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <p className="font-semibold text-gray-900 mb-3">With structure</p>
              <ul className="space-y-2 text-sm">
                <Check>Consistency on every case</Check>
                <Check>Confidence in the process</Check>
                <Check>Ready to scale</Check>
              </ul>
            </div>
            <div className="bg-bookable-grey rounded-2xl p-6 border border-gray-200">
              <p className="font-semibold text-gray-900 mb-3">What that means</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Fewer errors</li>
                <li>Happier clients</li>
                <li>A practice you can grow</li>
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
            After implementing a structured system
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { stat: 'Less',     label: 'Manual admin across every client case' },
              { stat: 'Clear',    label: 'Visibility across all active cases at any time' },
              { stat: 'No',       label: 'Lost documents or version confusion' },
              { stat: 'Faster',   label: 'Turnaround on drafts and revisions' },
              { stat: 'Scalable', label: 'Process that grows with your practice' },
              { stat: 'One',      label: 'System for everything — no more patchwork' },
            ].map((item) => (
              <div key={item.stat} className="bg-white rounded-2xl p-6 border border-gray-200">
                <p className="text-2xl font-extrabold text-bookable-green mb-1">{item.stat}</p>
                <p className="text-gray-600 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY NOT STANDARD SOFTWARE ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>Why not standard software?</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Most tools weren't built for will writing
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Generic CRMs are built for sales teams. They're not designed for document-heavy
            workflows or the specific stages of a will writing case. So you end up adapting
            your workflow to the software — and keeping spreadsheets for everything the
            software can't handle.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-bookable-grey rounded-2xl p-7 border border-gray-200">
              <p className="font-semibold text-gray-900 mb-4">Generic tools</p>
              <ul className="space-y-3">
                <CrossItem>Built for sales, not document workflows</CrossItem>
                <CrossItem>You adapt your process to fit the software</CrossItem>
                <CrossItem>Pay for features you'll never use</CrossItem>
                <CrossItem>Still need spreadsheets for the gaps</CrossItem>
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-7 border border-green-100">
              <p className="font-semibold text-gray-900 mb-4">The Bookable approach</p>
              <ul className="space-y-3">
                <Check>Built around your will writing workflow</Check>
                <Check>Document storage built in from the start</Check>
                <Check>Only what you actually need</Check>
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
            Simple pricing. No complexity.
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Traditional systems are expensive, complex, and overbuilt for what most
            practices actually need. We've simplified everything.
          </p>
          <div className="bg-white rounded-2xl p-8 border border-gray-200 w-full">
            <p className="text-5xl font-extrabold text-gray-900 mb-1">
              £75<span className="text-lg font-medium text-gray-500">/month</span>
            </p>
            <p className="text-gray-500 mb-6">One-time setup fee. No per-user costs.</p>
            <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto">
              <Check>Full custom CRM build</Check>
              <Check>Document storage and versioning</Check>
              <Check>Your workflow, your case stages</Check>
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
            <Check>Built with experience in financial services and estate planning workflows</Check>
            <Check>Designed for detail-heavy, document-driven practices</Check>
            <Check>Focused on giving you structure, not selling you features</Check>
          </ul>
        </div>
      </section>

      {/* ── CTA REPEAT ── */}
      <section className="bg-bookable-dark py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            See how your will writing practice could run on one system
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Book a demo and walk through exactly how the system would work for your practice.
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
