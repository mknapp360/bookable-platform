import { type FC } from 'react'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'
const sectionHeading = 'text-base font-semibold text-slate-800 mb-4'
const readOnlyCls = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500'

type Props = { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }

function num(v: unknown): number { return parseFloat((v as string) ?? '0') || 0 }

function formatWeekly(annual: string): string {
  const n = parseFloat(annual)
  if (!n) return ''
  return (n / 52).toFixed(2)
}

export const OccupationIncome: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }

  const incomeFields: { label: string; key: string }[] = [
    { label: 'Annual Salary', key: 'salary' },
    { label: 'Annual Overtime', key: 'overtime' },
    { label: 'P11D', key: 'p11d' },
    { label: 'Annual Bonus', key: 'bonus' },
    { label: 'Occupational Pensions', key: 'occ_pension' },
    { label: 'Personal Pensions / Annuities', key: 'personal_pension' },
    { label: 'State Pension', key: 'state_pension' },
    { label: 'Drawdown / Phased Retirement', key: 'drawdown' },
  ]

  const benefitFields: { label: string; key: string }[] = [
    { label: 'Guaranteed Pension Credit', key: 'gpc' },
    { label: 'Savings Pension Credit', key: 'spc' },
    { label: 'DLA', key: 'dla' },
    { label: 'Other (specify)', key: 'benefits_other' },
  ]

  const investmentFields: { label: string; key: string }[] = [
    { label: 'Dividends', key: 'dividends' },
    { label: 'Savings Interest', key: 'savings_interest' },
    { label: 'Bond Income', key: 'bond_income' },
  ]

  function calcTotalEarned(prefix: string): string {
    const total = incomeFields.reduce((acc, f) => acc + num(get(`${prefix}_${f.key}`)), 0)
    return total ? total.toFixed(2) : ''
  }

  function calcTotalBenefits(prefix: string): string {
    const total = benefitFields.reduce((acc, f) => acc + num(get(`${prefix}_${f.key}`)), 0)
    return total ? total.toFixed(2) : ''
  }

  function calcTotalInvestment(prefix: string): string {
    const total = investmentFields.reduce((acc, f) => acc + num(get(`${prefix}_${f.key}`)), 0)
    return total ? total.toFixed(2) : ''
  }

  function calcTotalNetIncome(prefix: string): string {
    const earned = parseFloat(calcTotalEarned(prefix)) || 0
    const benefits = parseFloat(calcTotalBenefits(prefix)) || 0
    const investment = parseFloat(calcTotalInvestment(prefix)) || 0
    const other = num(get(`${prefix}_other_income`))
    const total = earned + benefits + investment + other
    return total ? total.toFixed(2) : ''
  }

  function calcMonthly(prefix: string): string {
    const annual = parseFloat(calcTotalNetIncome(prefix)) || 0
    return annual ? (annual / 12).toFixed(2) : ''
  }

  const clients = ['Client 1', 'Client 2'] as const
  const prefixes = ['c1', 'c2'] as const

  return (
    <div className="space-y-8">
      {/* Occupation */}
      <div>
        <h2 className={sectionHeading}>Occupation</h2>
        <div className="grid grid-cols-2 gap-6">
          {clients.map((label, ci) => {
            const p = prefixes[ci]
            return (
              <div key={label} className="space-y-3">
                <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-1">{label}</p>
                <div>
                  <label className={labelCls}>Occupation</label>
                  <input type="text" className={inputCls} value={get(`${p}_occupation`)} onChange={e => set(`${p}_occupation`, e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Employment Status</label>
                  <select className={inputCls} value={get(`${p}_emp_status`)} onChange={e => set(`${p}_emp_status`, e.target.value)}>
                    <option value="">Select…</option>
                    {['Employed', 'Self-employed', 'Retired', 'Unemployed', 'Other'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Anticipated Retirement Age</label>
                  <input type="number" className={inputCls} value={get(`${p}_retirement_age`)} onChange={e => set(`${p}_retirement_age`, e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Current / Previous Occupation</label>
                  <input type="text" className={inputCls} value={get(`${p}_prev_occupation`)} onChange={e => set(`${p}_prev_occupation`, e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Employer / Business Name</label>
                  <input type="text" className={inputCls} value={get(`${p}_employer`)} onChange={e => set(`${p}_employer`, e.target.value)} />
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-500 mb-2">2nd Job</p>
                  <div className="space-y-2">
                    <div>
                      <label className={labelCls}>Employment Status</label>
                      <select className={inputCls} value={get(`${p}_job2_status`)} onChange={e => set(`${p}_job2_status`, e.target.value)}>
                        <option value="">Select…</option>
                        {['Employed', 'Self-employed', 'Other'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Occupation</label>
                      <input type="text" className={inputCls} value={get(`${p}_job2_occupation`)} onChange={e => set(`${p}_job2_occupation`, e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Employer / Business Name</label>
                      <input type="text" className={inputCls} value={get(`${p}_job2_employer`)} onChange={e => set(`${p}_job2_employer`, e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Income */}
      <div>
        <h2 className={sectionHeading}>Current Income</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">Income Type</th>
                {clients.map(c => (
                  <>
                    <th key={`${c}-a`} className="text-center text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">{c} Annual (£)</th>
                    <th key={`${c}-w`} className="text-center text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">{c} Weekly (£)</th>
                    <th key={`${c}-s`} className="text-center text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">{c} Spouse %</th>
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
                        <input type="text" className={readOnlyCls} value={formatWeekly(get(`${p}_${f.key}`))} readOnly />
                      </td>
                      <td key={`${p}-s`} className="border border-slate-200 p-1">
                        <input type="number" step="0.01" className={inputCls} value={get(`${p}_${f.key}_spouse_pct`)} onChange={e => set(`${p}_${f.key}_spouse_pct`, e.target.value)} />
                      </td>
                    </>
                  ))}
                </tr>
              ))}
              <tr className="bg-slate-50 font-medium">
                <td className="border border-slate-200 px-3 py-2 text-sm">Total Net Earned Income</td>
                {prefixes.map(p => (
                  <>
                    <td key={`${p}-te`} className="border border-slate-200 p-1"><input type="text" className={readOnlyCls} value={calcTotalEarned(p)} readOnly /></td>
                    <td key={`${p}-tw`} className="border border-slate-200 p-1"><input type="text" className={readOnlyCls} value={calcTotalEarned(p) ? (parseFloat(calcTotalEarned(p)) / 52).toFixed(2) : ''} readOnly /></td>
                    <td key={`${p}-ts`} className="border border-slate-200 p-1"></td>
                  </>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Benefits */}
      <div>
        <h2 className={sectionHeading}>State Benefits (Annual)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">Benefit Type</th>
                {clients.map(c => (
                  <th key={c} className="text-center text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">{c} Annual (£)</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {benefitFields.map(f => (
                <tr key={f.key}>
                  <td className="border border-slate-200 px-3 py-2 text-sm text-slate-700">{f.label}</td>
                  {prefixes.map(p => (
                    <td key={p} className="border border-slate-200 p-1">
                      <input type="number" step="0.01" className={inputCls} value={get(`${p}_${f.key}`)} onChange={e => set(`${p}_${f.key}`, e.target.value)} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-slate-50 font-medium">
                <td className="border border-slate-200 px-3 py-2 text-sm">Total Benefits</td>
                {prefixes.map(p => (
                  <td key={p} className="border border-slate-200 p-1"><input type="text" className={readOnlyCls} value={calcTotalBenefits(p)} readOnly /></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Investment Income */}
      <div>
        <h2 className={sectionHeading}>Investment Income (Annually)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">Income Type</th>
                {clients.map(c => (
                  <th key={c} className="text-center text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">{c} Annual (£)</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {investmentFields.map(f => (
                <tr key={f.key}>
                  <td className="border border-slate-200 px-3 py-2 text-sm text-slate-700">{f.label}</td>
                  {prefixes.map(p => (
                    <td key={p} className="border border-slate-200 p-1">
                      <input type="number" step="0.01" className={inputCls} value={get(`${p}_${f.key}`)} onChange={e => set(`${p}_${f.key}`, e.target.value)} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-slate-50 font-medium">
                <td className="border border-slate-200 px-3 py-2 text-sm">Total Investment Income</td>
                {prefixes.map(p => (
                  <td key={p} className="border border-slate-200 p-1"><input type="text" className={readOnlyCls} value={calcTotalInvestment(p)} readOnly /></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Other + Totals */}
      <div>
        <h2 className={sectionHeading}>Other Income &amp; Totals</h2>
        <div className="grid grid-cols-2 gap-6">
          {clients.map((label, ci) => {
            const p = prefixes[ci]
            return (
              <div key={label} className="space-y-3">
                <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-1">{label}</p>
                <div>
                  <label className={labelCls}>Other Income — specify</label>
                  <input type="text" className={inputCls} value={get(`${p}_other_income_desc`)} onChange={e => set(`${p}_other_income_desc`, e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Other Income Amount (£ annual)</label>
                  <input type="number" step="0.01" className={inputCls} value={get(`${p}_other_income`)} onChange={e => set(`${p}_other_income`, e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Total Net Income (£ annual, auto-calc)</label>
                  <input type="text" className={readOnlyCls} value={calcTotalNetIncome(p)} readOnly />
                </div>
                <div>
                  <label className={labelCls}>Average Monthly Net Income (£, auto-calc)</label>
                  <input type="text" className={readOnlyCls} value={calcMonthly(p)} readOnly />
                </div>
                <div>
                  <label className={labelCls}>Tax Status</label>
                  <input type="text" className={inputCls} value={get(`${p}_tax_status`)} onChange={e => set(`${p}_tax_status`, e.target.value)} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <h2 className={sectionHeading}>Notes</h2>
        <textarea className={inputCls} rows={4} value={get('notes')} onChange={e => set('notes', e.target.value)} placeholder="Additional notes…" />
      </div>
    </div>
  )
}
