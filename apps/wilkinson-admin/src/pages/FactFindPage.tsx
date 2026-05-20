/**
 * FactFindPage — equity release fact-find for Viva Retirement Solutions.
 *
 * Route: /fact-find            → contact picker (cases list)
 * Route: /fact-find/:caseId   → fact-find form for that case
 *
 * The 21 section components live in src/factfind/sections/ and are
 * Katie's proprietary business logic — never pushed to @bookable/crm-core.
 */

import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useCallback, useEffect, useRef } from 'react'
import { ArrowLeft, CheckCircle2, Circle, Save, FileText, ChevronRight, AlertCircle, ClipboardList } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useFactFind } from '../hooks/useFactFind'
import { useTenant } from '../hooks/useTenant'

// ─── Section imports ──────────────────────────────────────────────────────────
// TODO: copy section components from er-site/src/admin/factfind/sections/ here
// For now each section renders a placeholder — replace one by one as you copy them.
import { SectionRouter } from '../factfind/SectionRouter'

type SectionKey =
  | 'client_details' | 'personal_details' | 'medical' | 'occupation_income'
  | 'post_retirement' | 'benefits' | 'mortgages' | 'unsecured_debts'
  | 'expenditure' | 'savings_investments' | 'protection' | 'objectives'
  | 'property_details' | 'vulnerability' | 'marketing_prefs'
  | 'equity_release_1' | 'equity_release_2' | 'equity_release_3'
  | 'id_requirements' | 'admin_details' | 'erc_checklist' | 'application_docs'

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'client_details',     label: '1. Client Details' },
  { key: 'personal_details',   label: '2. Personal Details' },
  { key: 'medical',            label: '3. Medical Questionnaire' },
  { key: 'occupation_income',  label: '4. Occupation & Income' },
  { key: 'post_retirement',    label: '5. Post-Retirement Income' },
  { key: 'benefits',           label: '6. Benefits' },
  { key: 'mortgages',          label: '7. Mortgages & Secured Debts' },
  { key: 'unsecured_debts',    label: '8. Unsecured Debts' },
  { key: 'expenditure',        label: '9. Full Expenditure' },
  { key: 'savings_investments',label: '10. Savings & Investments' },
  { key: 'protection',         label: '11. Protection' },
  { key: 'objectives',         label: '12. Objectives' },
  { key: 'property_details',   label: '13. Property Details' },
  { key: 'vulnerability',      label: '14. Vulnerability Assessment' },
  { key: 'marketing_prefs',    label: '15. Marketing Preferences' },
  { key: 'equity_release_1',   label: '16. ER — Alternatives & Views' },
  { key: 'equity_release_2',   label: '17. ER — Product Preferences' },
  { key: 'equity_release_3',   label: '18. ER — Features & Solicitor' },
  { key: 'id_requirements',    label: '19. ID Requirements' },
  { key: 'admin_details',      label: '20. Admin Details' },
  { key: 'erc_checklist',      label: '21. ERC Checklist' },
  { key: 'application_docs',   label: '22. Application Docs' },
]

function isSectionFilled(data: Record<string, unknown>): boolean {
  return !!data && Object.keys(data).length > 0
}

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ─── Case picker (shown at /fact-find with no caseId) ────────────────────────
function CasePicker() {
  const navigate = useNavigate()
  const [cases, setCases] = useState<{ id: string; title: string; contact: { first_name: string; last_name: string } | null }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('cases')
      .select('id, title, contact:contacts(first_name, last_name)')
      .is('closed_at', null)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCases((data as typeof cases) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList size={20} className="text-slate-400" />
        <h1 className="text-xl font-bold text-slate-900">Fact Finds</h1>
      </div>

      {loading && <p className="text-sm text-slate-400">Loading cases…</p>}

      {!loading && cases.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-400">
          No open cases yet. <Link to="/cases" className="text-blue-600 hover:underline">Create a case →</Link>
        </div>
      )}

      {!loading && cases.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Case</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Client</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.title}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {c.contact ? `${c.contact.first_name} ${c.contact.last_name}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/fact-find/${c.id}`)}
                      className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      Open →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Fact-find form (shown at /fact-find/:caseId) ────────────────────────────
function FactFindForm({ caseId }: { caseId: string }) {
  const navigate = useNavigate()
  const { tenant } = useTenant()
  const { factFind, loading, saving, error, saveSection, markComplete } = useFactFind(caseId, tenant?.id)

  const [activeSection, setActiveSection] = useState<SectionKey>('client_details')
  const [localData, setLocalData] = useState<Record<SectionKey, Record<string, unknown>>>({} as Record<SectionKey, Record<string, unknown>>)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [completing, setCompleting] = useState(false)
  const prevSectionRef = useRef<SectionKey>(activeSection)

  // Case title for the header
  const [caseTitle, setCaseTitle] = useState('')
  useEffect(() => {
    supabase
      .from('cases')
      .select('title, contact:contacts(first_name, last_name)')
      .eq('id', caseId)
      .single()
      .then(({ data }) => {
        if (data) {
          const contact = data.contact as { first_name: string; last_name: string } | null
          setCaseTitle(contact ? `${contact.first_name} ${contact.last_name} — ${data.title}` : data.title)
        }
      })
  }, [caseId])

  // Sync factFind data into localData when it loads
  useEffect(() => {
    if (!factFind) return
    const next: Record<string, Record<string, unknown>> = {}
    for (const s of SECTIONS) {
      next[s.key] = (factFind[s.key] as Record<string, unknown>) ?? {}
    }
    setLocalData(next as Record<SectionKey, Record<string, unknown>>)
  }, [factFind])

  const currentSectionData = localData[activeSection] ?? {}

  function handleSectionDataChange(data: Record<string, unknown>) {
    setLocalData(prev => ({ ...prev, [activeSection]: data }))
  }

  const handleSaveCurrent = useCallback(async () => {
    await saveSection(activeSection, localData[activeSection] ?? {})
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }, [activeSection, localData, saveSection])

  async function handleSectionChange(next: SectionKey) {
    if (next === activeSection) return
    await saveSection(activeSection, localData[activeSection] ?? {})
    prevSectionRef.current = activeSection
    setActiveSection(next)
  }

  async function handleMarkComplete() {
    setCompleting(true)
    await markComplete()
    setCompleting(false)
  }

  const sectionsWithData = SECTIONS.filter(s => {
    const d = (factFind?.[s.key] as Record<string, unknown>) ?? {}
    return isSectionFilled(d)
  }).length

  const progress = Math.round((sectionsWithData / SECTIONS.length) * 100)

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading…</div>

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => navigate('/fact-find')}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={13} /> All cases
          </button>
          <div className="mt-2 text-xs font-semibold text-gray-700 truncate">{caseTitle}</div>
        </div>

        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Progress</span>
            <span>{sectionsWithData} / {SECTIONS.length}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {SECTIONS.map(s => {
            const hasData = isSectionFilled((factFind?.[s.key] as Record<string, unknown>) ?? {})
            const isActive = activeSection === s.key
            return (
              <button
                key={s.key}
                onClick={() => handleSectionChange(s.key)}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2 text-left text-xs transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                )}
              >
                {hasData
                  ? <CheckCircle2 size={13} className={isActive ? 'text-blue-500' : 'text-green-500'} />
                  : <Circle size={13} className="text-gray-300" />
                }
                <span className="truncate leading-snug">{s.label}</span>
                {isActive && <ChevronRight size={11} className="ml-auto shrink-0 text-blue-400" />}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shrink-0">
          <FileText size={16} className="text-gray-400" />
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-800 truncate">Fact Find — {caseTitle}</h1>
            <p className="text-xs text-gray-400">
              {factFind?.updated_at
                ? `Last saved ${new Date(factFind.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                : 'Not yet saved'}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium',
              factFind?.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            )}>
              {factFind?.status === 'complete' ? 'Complete' : 'Draft'}
            </span>
            <button
              onClick={handleSaveCurrent}
              disabled={saving}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                saveSuccess ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white',
                saving && 'opacity-60 cursor-wait'
              )}
            >
              <Save size={13} />
              {saving ? 'Saving…' : saveSuccess ? 'Saved!' : 'Save section'}
            </button>
            {factFind?.status !== 'complete' && (
              <button
                onClick={handleMarkComplete}
                disabled={completing}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <CheckCircle2 size={13} />
                {completing ? 'Saving…' : 'Mark as Complete'}
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <SectionRouter
              activeSection={activeSection}
              data={currentSectionData}
              onChange={handleSectionDataChange}
              factFind={factFind}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── Page entry point ─────────────────────────────────────────────────────────
export function FactFindPage() {
  const { caseId } = useParams<{ caseId: string }>()
  return caseId ? <FactFindForm caseId={caseId} /> : <CasePicker />
}
