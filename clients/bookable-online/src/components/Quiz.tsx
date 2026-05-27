import { useState } from 'react'
import { ArrowRight, ArrowLeft, Activity, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

// --- Quiz data ---

interface QuizOption {
  label: string
  score: number
  insight: string
}

interface QuizQuestion {
  question: string
  subtext: string
  options: QuizOption[]
}

const questions: QuizQuestion[] = [
  {
    question: 'When a new lead contacts you, what happens?',
    subtext: 'Think about the very first moment someone reaches out.',
    options: [
      { label: 'I just want to log it and set a reminder to follow up', score: 0, insight: 'simple_crm' },
      { label: 'I reply manually when I see it', score: 1, insight: 'lead_manual' },
      { label: 'It goes into a shared inbox or spreadsheet', score: 2, insight: 'lead_inbox' },
      { label: 'It lands in a CRM but I still handle follow-up', score: 3, insight: 'lead_crm_manual' },
      { label: 'It is captured and followed up automatically', score: 5, insight: 'lead_automated' },
    ],
  },
  {
    question: 'How do you onboard a new client?',
    subtext: 'From the moment they say yes to being fully set up.',
    options: [
      { label: 'I don\'t have a formal process — I just want to stay organised', score: 0, insight: 'simple_crm' },
      { label: 'Emails back and forth until everything is sorted', score: 1, insight: 'onboard_email' },
      { label: 'I send documents and forms manually', score: 2, insight: 'onboard_manual_docs' },
      { label: 'I use a few tools but they are not connected', score: 3, insight: 'onboard_disconnected' },
      { label: 'A smooth automated flow from start to finish', score: 5, insight: 'onboard_automated' },
    ],
  },
  {
    question: 'How do clients book time with you?',
    subtext: 'Consultations, appointments, meetings — however you work.',
    options: [
      { label: 'I just need a simple calendar to manage my appointments', score: 0, insight: 'simple_crm' },
      { label: 'Phone calls and texts — I juggle it in my head', score: 1, insight: 'book_manual' },
      { label: 'A shared calendar or diary, manually updated', score: 2, insight: 'book_calendar' },
      { label: 'A booking tool like Calendly, but it is standalone', score: 3, insight: 'book_standalone' },
      { label: 'Booking is integrated into my whole workflow', score: 5, insight: 'book_integrated' },
    ],
  },
  {
    question: 'How do invoices and payments work?',
    subtext: 'From generating the invoice to chasing payment.',
    options: [
      { label: 'Payments aren\'t an issue — I just need to track my contacts better', score: 0, insight: 'simple_crm' },
      { label: 'I create each invoice manually and chase by email', score: 1, insight: 'pay_manual' },
      { label: 'I use accounting software but trigger it myself', score: 2, insight: 'pay_software' },
      { label: 'Some invoices go out automatically, some do not', score: 3, insight: 'pay_partial' },
      { label: 'Invoicing, payment, and reminders are fully automated', score: 5, insight: 'pay_automated' },
    ],
  },
  {
    question: 'How do you keep clients informed and engaged?',
    subtext: 'Updates, reminders, follow-ups, check-ins.',
    options: [
      { label: 'I just want to remember who I\'ve spoken to and when', score: 0, insight: 'simple_crm' },
      { label: 'I remember to reach out when I can', score: 1, insight: 'comms_adhoc' },
      { label: 'I have templates but send them manually', score: 2, insight: 'comms_templates' },
      { label: 'Some messages are automated, most are not', score: 3, insight: 'comms_partial' },
      { label: 'Communications happen automatically at the right time', score: 5, insight: 'comms_automated' },
    ],
  },
]

// --- Scoring & recommendations ---

interface Recommendation {
  grade: string
  gradeColor: string
  headline: string
  summary: string
  priorities: string[]
}

const SIMPLE_CRM_GRADE = 'CRM'

function getRecommendation(score: number, insights: string[]): Recommendation {
  // If 3 or more answers point to "just need a simple CRM", route them there
  const simpleCrmCount = insights.filter(i => i === 'simple_crm').length
  if (simpleCrmCount >= 3) {
    return {
      grade: SIMPLE_CRM_GRADE,
      gradeColor: 'text-bookable-green',
      headline: 'You just need a simple CRM to track things better.',
      summary: 'You\'re not looking for automation or complex workflows — you just want one place to manage your contacts, follow-ups, and appointments without things slipping through the cracks. That\'s exactly what Bookable CRM is built for.',
      priorities: [],
    }
  }

  const hasManualLeads = insights.some(i => i.includes('lead_manual') || i.includes('lead_inbox'))
  const hasManualOnboarding = insights.some(i => i.includes('onboard_email') || i.includes('onboard_manual'))
  const hasManualBooking = insights.some(i => i.includes('book_manual') || i.includes('book_calendar'))
  const hasManualPayments = insights.some(i => i.includes('pay_manual') || i.includes('pay_software'))
  const hasManualComms = insights.some(i => i.includes('comms_adhoc') || i.includes('comms_templates'))

  const priorities: string[] = []
  if (hasManualLeads) priorities.push('A lead capture pipeline so no enquiry slips through the cracks — every contact captured, qualified, and routed automatically.')
  if (hasManualOnboarding) priorities.push('An onboarding system that takes clients from "yes" to fully set up without you chasing documents and forms by email.')
  if (hasManualBooking) priorities.push('A custom booking system built into your workflow — not a standalone tool, but something that triggers the right next steps automatically.')
  if (hasManualPayments) priorities.push('Automated invoicing and payment tracking so you stop chasing money and start getting paid on time, every time.')
  if (hasManualComms) priorities.push('Automated client communications — the right message at the right moment, without you having to remember to send it.')

  if (score <= 8) {
    return {
      grade: 'D',
      gradeColor: 'text-red-500',
      headline: 'Your business is running on you.',
      summary: 'Almost every process in your business depends on someone — probably you — remembering to do something. That\'s a lot of mental load, and it means things get missed when you\'re busy. The good news: this is exactly where automation makes the biggest difference, fastest.',
      priorities,
    }
  } else if (score <= 14) {
    return {
      grade: 'C',
      gradeColor: 'text-orange-500',
      headline: 'You\'ve got tools, but they\'re not talking to each other.',
      summary: 'You\'re using some software to help, but the pieces aren\'t connected. You\'re still the glue holding it together — copying data between systems, triggering things manually, filling the gaps. A connected platform would take that off your plate.',
      priorities,
    }
  } else if (score <= 20) {
    return {
      grade: 'B',
      gradeColor: 'text-yellow-500',
      headline: 'You\'re partly automated, but there are gaps.',
      summary: 'Some of your processes run smoothly, but others still need manual intervention. You\'re close to having a system that runs without you — there are just a few key connections to make.',
      priorities,
    }
  } else {
    return {
      grade: 'A',
      gradeColor: 'text-bookable-green',
      headline: 'Your infrastructure is solid.',
      summary: 'Most of your processes are automated and connected. You\'re already thinking the right way. If there are edges to smooth out or AI to layer in, we should talk — but you\'re ahead of most.',
      priorities,
    }
  }
}

// --- Component ---

interface QuizProps {
  open: boolean
  onClose: () => void
  onBook: () => void
  onCaptureDetails?: (details: { name: string; email: string; company: string }) => void
}

export default function Quiz({ open, onClose, onBook, onCaptureDetails }: QuizProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phase, setPhase] = useState<'intro' | 'questions' | 'capture' | 'saving' | 'result'>('intro')
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)

  const handleAnswer = (score: number, insight: string) => {
    const newAnswers = [...answers, score]
    const newInsights = [...insights, insight]
    setAnswers(newAnswers)
    setInsights(newInsights)

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      // Quiz complete — capture their details before showing results
      setPhase('capture')
    }
  }

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1)
      setAnswers(answers.slice(0, -1))
      setInsights(insights.slice(0, -1))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPhase('saving')

    const totalScore = answers.reduce((a, b) => a + b, 0)
    const rec = getRecommendation(totalScore, insights)
    setRecommendation(rec)

    // Share details with parent so booking modal can pre-fill
    onCaptureDetails?.({ name, email, company })

    try {
      await supabase.from('quiz_results').insert({
        name,
        email,
        company,
        score: totalScore,
        grade: rec.grade,
        answers: insights,
        headline: rec.headline,
        summary: rec.summary,
        priorities: rec.priorities,
      })
    } catch {
      // Don't block the user experience if save fails
    }

    // Send results email via edge function (non-blocking)
    try {
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-quiz-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          name,
          email,
          company,
          grade: rec.grade,
          score: totalScore,
          maxScore: questions.length * 5,
          headline: rec.headline,
          summary: rec.summary,
          priorities: rec.priorities,
        }),
      })
    } catch {
      // Email is non-blocking — don't hold up the results screen
    }

    setPhase('result')
  }

  const handleClose = () => {
    setCurrentQ(0)
    setAnswers([])
    setInsights([])
    setEmail('')
    setName('')
    setCompany('')
    setPhase('intro')
    setRecommendation(null)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Intro */}
        {phase === 'intro' && (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-bookable-green/10 flex items-center justify-center mx-auto mb-6">
              <Activity className="w-8 h-8 text-bookable-green" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              How automated is your business?
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Five quick questions about how your business runs day to day.
              You'll get a personalised automation score and a clear recommendation
              — no jargon, no sales pitch.
            </p>
            <p className="text-sm text-gray-400 mb-8">Takes about 60 seconds</p>
            <button
              onClick={() => setPhase('questions')}
              className="inline-flex items-center gap-2 bg-bookable-green text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-green-700 transition-colors"
            >
              Let's find out
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Questions */}
        {phase === 'questions' && (
          <div className="p-8 sm:p-12">
            {/* Progress */}
            <div className="flex items-center gap-3 mb-8">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    i < currentQ ? 'bg-bookable-green' : i === currentQ ? 'bg-bookable-green/50' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <p className="text-sm text-gray-400 mb-2">Question {currentQ + 1} of {questions.length}</p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {questions[currentQ].question}
            </h3>
            <p className="text-gray-500 mb-8">{questions[currentQ].subtext}</p>

            <div className="space-y-3">
              {questions[currentQ].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.score, opt.insight)}
                  className="w-full text-left px-6 py-4 rounded-xl border border-gray-200 hover:border-bookable-green hover:bg-bookable-green/5 transition-all text-gray-700 font-medium"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {currentQ > 0 && (
              <button
                onClick={handleBack}
                className="mt-6 inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>
        )}

        {/* Email capture */}
        {phase === 'capture' && (
          <div className="p-8 sm:p-12">
            <div className="text-center mb-8">
              <CheckCircle className="w-12 h-12 text-bookable-green mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your results are ready</h3>
              <p className="text-gray-600">
                Pop in your details and we'll show you your score — plus email you
                a copy with your personalised recommendations.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-bookable-green focus:ring-2 focus:ring-bookable-green/20 outline-none transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-bookable-green focus:ring-2 focus:ring-bookable-green/20 outline-none transition-all"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business name <span className="text-gray-400">(optional)</span></label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-bookable-green focus:ring-2 focus:ring-bookable-green/20 outline-none transition-all"
                  placeholder="Your business"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-bookable-green text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-green-700 transition-colors"
              >
                Show my results
              </button>
            </form>
          </div>
        )}

        {/* Saving */}
        {phase === 'saving' && (
          <div className="p-12 text-center">
            <Loader2 className="w-12 h-12 text-bookable-green animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Analysing your business...</p>
          </div>
        )}

        {/* Results */}
        {phase === 'result' && recommendation && (
          <div className="p-8 sm:p-12">
            {recommendation.grade === SIMPLE_CRM_GRADE ? (
              /* Simple CRM result */
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-bookable-green/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-bookable-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {recommendation.headline}
                  </h3>
                  <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                    {recommendation.summary}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Bookable CRM</p>
                  <p className="text-sm text-gray-500 mb-4">Contacts, pipeline, calendar, client notes &amp; email campaigns — all in one place. 14-day free trial, £20/month, no contract.</p>
                  <a
                    href="https://bookablecrm.com/signup"
                    className="inline-flex items-center gap-2 bg-bookable-green text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Get started free
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-gray-500 text-sm">
                    We've emailed a copy of these results to <strong>{email}</strong>.
                  </p>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold px-6 py-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Done for now
                </button>
              </>
            ) : (
              /* Standard automation result */
              <>
                <div className="text-center mb-8">
                  <div className={`text-7xl font-extrabold ${recommendation.gradeColor} mb-2`}>
                    {recommendation.grade}
                  </div>
                  <p className="text-sm text-gray-400">
                    Your automation score: {answers.reduce((a, b) => a + b, 0)} / {questions.length * 5}
                  </p>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {recommendation.headline}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-8">
                  {recommendation.summary}
                </p>

                {recommendation.priorities.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      What we'd build for you:
                    </h4>
                    <div className="space-y-3">
                      {recommendation.priorities.map((p, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-bookable-green/10 flex items-center justify-center mt-0.5">
                            <span className="text-bookable-green text-xs font-bold">{i + 1}</span>
                          </div>
                          <p className="text-gray-600 leading-relaxed">{p}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-600 text-sm">
                    We've emailed a copy of these results to <strong>{email}</strong> — so
                    you can come back to this whenever you're ready.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { handleClose(); onBook(); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-bookable-green text-white font-semibold px-6 py-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Book a conversation
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold px-6 py-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Done for now
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
