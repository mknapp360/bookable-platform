import { type FC } from 'react'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'
const sectionHeading = 'text-base font-semibold text-slate-800 mb-4'
const readOnlyCls = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500'

type Props = {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  clientDetailsData?: Record<string, unknown>
}

const CHECKLIST_ITEMS = [
  'Confirmed whole-of-market or restricted adviser status and explained limitations?',
  'Confirmed and agreed how service will be tailored?',
  'Fully discussed alternatives (downsizing, grants, savings, family, etc.)?',
  'Established eligibility for state benefits and effect of equity release on them?',
  'Considered the customer\'s tax position?',
  'Advised to speak to family / beneficiaries and independent legal adviser?',
  'Explained impact on estate planning including negative house price inflation?',
  'Explained not to release funds for investment to generate wealth or income (except IHT planning)?',
  'Recommended reviewing / making a Will?',
  'If no POA, recommended seeking advice from solicitor?',
  'Advised joint customers that drawdown facility removed if either loses mental capacity without POA?',
  'Discussed health and life expectancy and how released funds might change if health deteriorates?',
]

export const ErcChecklist: FC<Props> = ({ data, onChange, clientDetailsData = {} }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }

  const c1Name = [
    clientDetailsData.c1_title,
    clientDetailsData.c1_forenames,
    clientDetailsData.c1_surname,
  ].filter(Boolean).join(' ')

  const c2Name = [
    clientDetailsData.c2_title,
    clientDetailsData.c2_forenames,
    clientDetailsData.c2_surname,
  ].filter(Boolean).join(' ')

  const customerNames = [c1Name, c2Name].filter(Boolean).join(' & ') || ''

  return (
    <div className="space-y-8">
      <div>
        <h2 className={sectionHeading}>ERC Compliance Checklist</h2>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Customer Names (auto-filled from Client Details)</label>
            <input type="text" className={readOnlyCls} value={customerNames} readOnly />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item, i) => {
          const key = `item_${i + 1}`
          const value = get(key)
          return (
            <div key={i} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg">
              <div className="flex gap-2 shrink-0 pt-0.5">
                {['Yes', 'No'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set(key, opt)}
                    className={`px-3 py-1 text-xs rounded font-medium transition-colors ${value === opt ? (opt === 'Yes' ? 'bg-green-600 text-white' : 'bg-red-500 text-white') : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-medium text-slate-500 mr-1">{i + 1}.</span>
                {item}
              </p>
            </div>
          )
        })}
      </div>

      <div>
        <h2 className={sectionHeading}>Notes</h2>
        <textarea className={inputCls} rows={5} value={get('notes')} onChange={e => set('notes', e.target.value)} placeholder="Additional compliance notes…" />
      </div>
    </div>
  )
}
