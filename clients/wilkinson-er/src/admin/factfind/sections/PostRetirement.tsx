import { type FC } from 'react'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'
const sectionHeading = 'text-base font-semibold text-slate-800 mb-4'
const readOnlyCls = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500'

function YesNo({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex gap-2">
        {['Yes', 'No'].map(opt => (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${value === opt ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

type Props = { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }

function num(v: unknown): number { return parseFloat((v as string) ?? '0') || 0 }

export const PostRetirement: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }

  const incomeFields: { label: string; key: string }[] = [
    { label: 'Occupational Pensions', key: 'occ_pension' },
    { label: 'Personal Pensions / Annuities', key: 'personal_pension' },
    { label: 'State Pension', key: 'state_pension' },
    { label: 'Drawdown / Phased Retirement', key: 'drawdown' },
    { label: 'Other Income', key: 'other' },
  ]

  function calcTotal(prefix: string): string {
    const total = incomeFields.reduce((acc, f) => acc + num(get(`${prefix}_${f.key}`)), 0)
    return total ? total.toFixed(2) : ''
  }

  function weeklyFrom(annual: string): string {
    const n = parseFloat(annual)
    return n ? (n / 52).toFixed(2) : ''
  }

  const clients = ['Client 1', 'Client 2'] as const
  const prefixes = ['c1', 'c2'] as const

  return (
    <div className="space-y-8">
      <div>
        <YesNo label="Are the client(s) already retired?" value={get('already_retired')} onChange={v => set('already_retired', v)} />
      </div>

      <div>
        <h2 className={sectionHeading}>Post-Retirement Income</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">Income Type</th>
                {clients.map(c => (
                  <>
                    <th key={`${c}-a`} className="text-center text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">{c} Annual (£)</th>
                    <th key={`${c}-w`} className="text-center text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">{c} Weekly (£)</th>
                  </>
                ))}
              </tr>
            </thead>
            <tbody>
              {incomeFields.map(f => (
                <tr key={f.key}>
                  <td className="border border-slate-200 px-3 py-2 text-sm text-slate-700">{f.label}</td>
                  {prefixes.map(p => (
                    <>
                      <td key={`${p}-a`} className="border border-slate-200 p-1">
                        <input type="number" step="0.01" className={inputCls} value={get(`${p}_${f.key}`)} onChange={e => set(`${p}_${f.key}`, e.target.value)} />
                      </td>
                      <td key={`${p}-w`} className="border border-slate-200 p-1">
                        <input type="text" className={readOnlyCls} value={weeklyFrom(get(`${p}_${f.key}`))} readOnly />
                      </td>
                    </>
                  ))}
                </tr>
              ))}
              <tr className="bg-slate-50 font-medium">
                <td className="border border-slate-200 px-3 py-2 text-sm">Total Net Post-Retirement Income</td>
                {prefixes.map(p => (
                  <>
                    <td key={`${p}-t`} className="border border-slate-200 p-1"><input type="text" className={readOnlyCls} value={calcTotal(p)} readOnly /></td>
                    <td key={`${p}-tw`} className="border border-slate-200 p-1"><input type="text" className={readOnlyCls} value={weeklyFrom(calcTotal(p))} readOnly /></td>
                  </>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className={sectionHeading}>Notes</h2>
        <textarea className={inputCls} rows={6} value={get('notes')} onChange={e => set('notes', e.target.value)} placeholder="Adviser commentary on retirement plans, expected income changes, etc…" />
      </div>
    </div>
  )
}
