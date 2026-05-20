import { ClipboardList } from 'lucide-react'

// Pretty-print answer slugs like "lead_manual" → "Lead capture: Manual"
export function formatAnswerSlug(slug: string): string {
  const parts = slug.split('_')
  if (parts.length < 2) return slug.replace(/_/g, ' ')
  const category = parts[0]
  const value    = parts.slice(1).join(' ')
  const categoryLabels: Record<string, string> = {
    lead:    'Lead capture',
    onboard: 'Onboarding',
    book:    'Booking',
    pay:     'Payments',
    comms:   'Communications',
  }
  const label = categoryLabels[category] ?? (category.charAt(0).toUpperCase() + category.slice(1))
  return `${label}: ${value.charAt(0).toUpperCase() + value.slice(1)}`
}

export function EnquiryPanel({ metadata }: { metadata: Record<string, unknown> }) {
  const summary  = metadata.summary  as string | undefined
  const headline = metadata.headline as string | undefined
  const grade    = metadata.grade    as string | undefined
  const score    = metadata.score    as number | undefined

  const priorityList: string[] = (() => {
    const raw = metadata.priorities
    if (!raw) return []
    if (Array.isArray(raw)) return raw.map(p => typeof p === 'string' ? p : JSON.stringify(p))
    if (typeof raw === 'string') {
      try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) return parsed.map(String) } catch {}
      return [raw]
    }
    return []
  })()

  const answerList: string[] = (() => {
    const raw = metadata.answers
    if (!raw) return []
    if (Array.isArray(raw)) return raw.map(String)
    if (typeof raw === 'string') {
      try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) return parsed.map(String) } catch {}
      return [raw]
    }
    return []
  })()

  const hasData = grade || summary || priorityList.length > 0 || answerList.length > 0

  if (!hasData) {
    return (
      <div className="py-8 text-center">
        <ClipboardList size={28} className="mx-auto text-slate-200 mb-2" />
        <p className="text-sm text-slate-400">No enquiry data for this contact.</p>
        <p className="text-xs text-slate-300 mt-1">Quiz leads will show their results here automatically.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Grade + headline */}
      {(grade || score !== undefined) && (
        <div className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
          {grade && (
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-indigo-200 text-indigo-700 font-bold text-xl shrink-0 shadow-sm">
              {grade}
            </div>
          )}
          <div>
            {headline && <p className="text-sm font-semibold text-indigo-800">{headline}</p>}
            {score !== undefined && (
              <p className="text-xs text-indigo-500 mt-0.5">Score: {score}</p>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Summary</h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-100">
            {summary}
          </p>
        </div>
      )}

      {/* Priorities */}
      {priorityList.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Top Priorities</h3>
          <ol className="space-y-2">
            {priorityList.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="leading-snug">{p}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Answers */}
      {answerList.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quiz Responses</h3>
          <div className="flex flex-wrap gap-2">
            {answerList.map((slug, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-600 font-medium"
              >
                {formatAnswerSlug(slug)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
