import { useState, useCallback, useEffect, useRef } from 'react'
import {
  ArrowLeft, CheckCircle2, Circle, Save, FileText,
  ChevronRight, AlertCircle
} from 'lucide-react'
import { useFactFind } from '../../hooks/useFactFind'

import { ClientDetails } from './sections/ClientDetails'
import { PersonalDetails } from './sections/PersonalDetails'
import { Medical } from './sections/Medical'
import { OccupationIncome } from './sections/OccupationIncome'
import { PostRetirement } from './sections/PostRetirement'
import { Benefits } from './sections/Benefits'
import { Mortgages } from './sections/Mortgages'
import { UnsecuredDebts } from './sections/UnsecuredDebts'
import { Expenditure } from './sections/Expenditure'
import { SavingsInvestments } from './sections/SavingsInvestments'
import { Protection } from './sections/Protection'
import { Objectives } from './sections/Objectives'
import { PropertyDetails } from './sections/PropertyDetails'
import { Vulnerability } from './sections/Vulnerability'
import { MarketingPrefs } from './sections/MarketingPrefs'
import { EquityRelease1 } from './sections/EquityRelease1'
import { EquityRelease2 } from './sections/EquityRelease2'
import { EquityRelease3 } from './sections/EquityRelease3'
import { IdRequirements } from './sections/IdRequirements'
import { AdminDetails } from './sections/AdminDetails'
import { ErcChecklist } from './sections/ErcChecklist'

// Application docs section
function ApplicationDocs({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }
  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'
  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-slate-800 mb-4">Application Documents</h2>
      <div>
        <label className={labelCls}>Document checklist / notes</label>
        <textarea className={inputCls} rows={6} value={get('notes')} onChange={e => set('notes', e.target.value)} placeholder="List documents submitted, outstanding items, notes for file…" />
      </div>
      <div>
        <label className={labelCls}>Application submitted date</label>
        <input type="date" className={inputCls} value={get('submitted_date')} onChange={e => set('submitted_date', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Reference number</label>
        <input type="text" className={inputCls} value={get('reference')} onChange={e => set('reference', e.target.value)} />
      </div>
    </div>
  )
}

type SectionKey =
  | 'client_details' | 'personal_details' | 'medical' | 'occupation_income'
  | 'post_retirement' | 'benefits' | 'mortgages' | 'unsecured_debts'
  | 'expenditure' | 'savings_investments' | 'protection' | 'objectives'
  | 'property_details' | 'vulnerability' | 'marketing_prefs'
  | 'equity_release_1' | 'equity_release_2' | 'equity_release_3'
  | 'id_requirements' | 'admin_details' | 'erc_checklist' | 'application_docs'

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'client_details', label: '1. Client Details' },
  { key: 'personal_details', label: '2. Personal Details' },
  { key: 'medical', label: '3. Medical Questionnaire' },
  { key: 'occupation_income', label: '4. Occupation & Income' },
  { key: 'post_retirement', label: '5. Post-Retirement Income' },
  { key: 'benefits', label: '6. Benefits' },
  { key: 'mortgages', label: '7. Mortgages & Secured Debts' },
  { key: 'unsecured_debts', label: '8. Unsecured Debts' },
  { key: 'expenditure', label: '9. Full Expenditure' },
  { key: 'savings_investments', label: '10. Savings & Investments' },
  { key: 'protection', label: '11. Protection' },
  { key: 'objectives', label: '12. Objectives' },
  { key: 'property_details', label: '13. Property Details' },
  { key: 'vulnerability', label: '14. Vulnerability Assessment' },
  { key: 'marketing_prefs', label: '15. Marketing Preferences' },
  { key: 'equity_release_1', label: '16. ER — Alternatives & Views' },
  { key: 'equity_release_2', label: '17. ER — Product Preferences' },
  { key: 'equity_release_3', label: '18. ER — Features & Solicitor' },
  { key: 'id_requirements', label: '19. ID Requirements' },
  { key: 'admin_details', label: '20. Admin Details' },
  { key: 'erc_checklist', label: '21. ERC Checklist' },
  { key: 'application_docs', label: '22. Application Docs' },
]

function isSectionFilled(data: Record<string, unknown>): boolean {
  if (!data) return false
  return Object.keys(data).length > 0
}

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

type Props = {
  clientId: string
  clientName: string
  tenantId: string
  onBack: () => void
}

export function FactFindApp({ clientId, clientName, tenantId, onBack }: Props) {
  const { factFind, loading, saving, error, saveSection, markComplete } = useFactFind(clientId, tenantId)

  const [activeSection, setActiveSection] = useState<SectionKey>('client_details')
  const [localData, setLocalData] = useState<Record<SectionKey, Record<string, unknown>>>({} as Record<SectionKey, Record<string, unknown>>)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [completing, setCompleting] = useState(false)
  const prevSectionRef = useRef<SectionKey>(activeSection)

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
    setSaveError(null)
    const sectionData = localData[activeSection] ?? {}
    await saveSection(activeSection, sectionData)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }, [activeSection, localData, saveSection])

  async function handleSectionChange(next: SectionKey) {
    if (next === activeSection) return
    // Auto-save current before navigating
    const sectionData = localData[activeSection] ?? {}
    await saveSection(activeSection, sectionData)
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

  const progress = SECTIONS.length > 0 ? Math.round((sectionsWithData / SECTIONS.length) * 100) : 0

  if (loading) {
    return <div className="p-8 text-gray-400 text-sm">Loading fact find…</div>
  }

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Back */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={13} /> Back to Clients
          </button>
          <div className="mt-2 text-xs font-semibold text-gray-700 truncate">{clientName}</div>
        </div>

        {/* Progress */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Progress</span>
            <span>{sectionsWithData} / {SECTIONS.length}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Section list */}
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
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shrink-0">
          <FileText size={16} className="text-gray-400" />
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-800 truncate">
              Fact Find — {clientName}
            </h1>
            <p className="text-xs text-gray-400">
              {factFind?.updated_at
                ? `Last saved ${new Date(factFind.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                : 'Not yet saved'}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Status badge */}
            <span className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium',
              factFind?.status === 'complete'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            )}>
              {factFind?.status === 'complete' ? 'Complete' : 'Draft'}
            </span>

            {/* Save section */}
            <button
              onClick={handleSaveCurrent}
              disabled={saving}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                saveSuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white',
                saving && 'opacity-60 cursor-wait'
              )}
            >
              <Save size={13} />
              {saving ? 'Saving…' : saveSuccess ? 'Saved!' : 'Save section'}
            </button>

            {/* Mark complete */}
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

        {/* Error banner */}
        {(error || saveError) && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={14} />
            {error || saveError}
          </div>
        )}

        {/* Section content */}
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

function SectionRouter({
  activeSection,
  data,
  onChange,
  factFind,
}: {
  activeSection: SectionKey
  data: Record<string, unknown>
  onChange: (d: Record<string, unknown>) => void
  factFind: ReturnType<typeof useFactFind>['factFind']
}) {
  const mortgagesData = (factFind?.mortgages as Record<string, unknown>) ?? {}
  const unsecuredDebtsData = (factFind?.unsecured_debts as Record<string, unknown>) ?? {}
  const personalDetailsData = (factFind?.personal_details as Record<string, unknown>) ?? {}
  const clientDetailsData = (factFind?.client_details as Record<string, unknown>) ?? {}

  switch (activeSection) {
    case 'client_details':      return <ClientDetails data={data} onChange={onChange} />
    case 'personal_details':    return <PersonalDetails data={data} onChange={onChange} />
    case 'medical':             return <Medical data={data} onChange={onChange} />
    case 'occupation_income':   return <OccupationIncome data={data} onChange={onChange} />
    case 'post_retirement':     return <PostRetirement data={data} onChange={onChange} />
    case 'benefits':            return <Benefits data={data} onChange={onChange} />
    case 'mortgages':           return <Mortgages data={data} onChange={onChange} />
    case 'unsecured_debts':     return <UnsecuredDebts data={data} onChange={onChange} />
    case 'expenditure':
      return (
        <Expenditure
          data={data}
          onChange={onChange}
          mortgagesData={mortgagesData}
          unsecuredDebtsData={unsecuredDebtsData}
        />
      )
    case 'savings_investments': return <SavingsInvestments data={data} onChange={onChange} />
    case 'protection':          return <Protection data={data} onChange={onChange} />
    case 'objectives':          return <Objectives data={data} onChange={onChange} />
    case 'property_details':    return <PropertyDetails data={data} onChange={onChange} />
    case 'vulnerability':
      return (
        <Vulnerability
          data={data}
          onChange={onChange}
          personalDetailsData={personalDetailsData}
        />
      )
    case 'marketing_prefs':     return <MarketingPrefs data={data} onChange={onChange} />
    case 'equity_release_1':    return <EquityRelease1 data={data} onChange={onChange} />
    case 'equity_release_2':    return <EquityRelease2 data={data} onChange={onChange} />
    case 'equity_release_3':    return <EquityRelease3 data={data} onChange={onChange} />
    case 'id_requirements':     return <IdRequirements data={data} onChange={onChange} />
    case 'admin_details':       return <AdminDetails data={data} onChange={onChange} />
    case 'erc_checklist':
      return (
        <ErcChecklist
          data={data}
          onChange={onChange}
          clientDetailsData={clientDetailsData}
        />
      )
    case 'application_docs':    return <ApplicationDocs data={data} onChange={onChange} />
    default:                    return null
  }
}
