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

type Props = {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  mortgagesData?: Record<string, unknown>
  unsecuredDebtsData?: Record<string, unknown>
}

const monthlyCategories = [
  {
    heading: 'Household',
    items: [
      { label: 'Mortgage / Rent / Secured debts (auto)', key: 'mortgage', auto: true },
      { label: 'Council Tax', key: 'council_tax' },
      { label: 'Water', key: 'water' },
      { label: 'Gas', key: 'gas' },
      { label: 'Electricity', key: 'electricity' },
      { label: 'Telephone', key: 'telephone' },
      { label: 'Food Shopping', key: 'food' },
      { label: 'Buildings / Contents Insurance', key: 'buildings_insurance' },
      { label: 'TV / Satellite / Cable', key: 'tv' },
    ],
  },
  {
    heading: 'Transport',
    items: [
      { label: 'Fuel', key: 'fuel' },
      { label: 'Car Tax', key: 'car_tax' },
      { label: 'Car Insurance', key: 'car_insurance' },
      { label: 'Servicing & Maintenance', key: 'car_service' },
      { label: 'Breakdown Cover', key: 'breakdown' },
      { label: 'Public Transport', key: 'public_transport' },
    ],
  },
  {
    heading: 'Miscellaneous',
    items: [
      { label: 'Unsecured debts (auto)', key: 'unsecured', auto: true },
      { label: 'Healthcare', key: 'healthcare' },
      { label: 'Newspapers / Subscriptions', key: 'subscriptions' },
      { label: 'Maintenance / Alimony', key: 'maintenance' },
      { label: 'School Fees', key: 'school_fees' },
      { label: 'Clothing', key: 'clothing' },
      { label: 'Entertainment / Socialising', key: 'entertainment' },
      { label: 'Insurances', key: 'insurances' },
      { label: 'Other', key: 'other_misc' },
    ],
  },
]

const annualItems = [
  { label: 'Holidays', key: 'ann_holidays' },
  { label: 'Cars', key: 'ann_cars' },
  { label: 'Memberships', key: 'ann_memberships' },
  { label: 'Caravan site fees', key: 'ann_caravan' },
  { label: 'Other', key: 'ann_other' },
]

export const Expenditure: FC<Props> = ({ data, onChange, mortgagesData = {}, unsecuredDebtsData = {} }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }

  const columns = ['c1', 'c2', 'joint'] as const
  const colLabels = { c1: 'Client 1', c2: 'Client 2', joint: 'Joint' }

  function getMortgageMonthly(): string {
    const m1 = parseFloat((mortgagesData.m1_monthly as string) ?? '') || 0
    const m2 = parseFloat((mortgagesData.m2_monthly as string) ?? '') || 0
    const rent = parseFloat((mortgagesData.monthly_rent as string) ?? '') || 0
    const total = m1 + m2 + rent
    return total ? total.toFixed(2) : ''
  }

  function getUnsecuredMonthly(): string {
    const debts = (unsecuredDebtsData.debts as Record<string, string>[]) ?? []
    const total = debts.reduce((acc, row) => acc + (parseFloat(row.monthly) || 0), 0)
    return total ? total.toFixed(2) : ''
  }

  function getCell(col: string, key: string): string {
    if (key === 'mortgage') {
      if (col === 'joint') return getMortgageMonthly()
    }
    if (key === 'unsecured') {
      if (col === 'joint') return getUnsecuredMonthly()
    }
    return get(`${col}_${key}`)
  }

  function calcColumnTotal(col: string): string {
    let total = 0
    for (const cat of monthlyCategories) {
      for (const item of cat.items) {
        const val = parseFloat(getCell(col, item.key)) || 0
        total += val
      }
    }
    for (const item of annualItems) {
      const val = parseFloat(get(`${col}_${item.key}`)) || 0
      total += val / 12
    }
    return total ? total.toFixed(2) : ''
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={sectionHeading}>Monthly Expenditure</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200 w-2/5">Item</th>
                {columns.map(c => (
                  <th key={c} className="text-center text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">{colLabels[c]} (£/mo)</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyCategories.map(cat => (
                <>
                  <tr key={cat.heading} className="bg-slate-50">
                    <td colSpan={4} className="border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">{cat.heading}</td>
                  </tr>
                  {cat.items.map(item => (
                    <tr key={item.key}>
                      <td className="border border-slate-200 px-3 py-2 text-sm text-slate-700">{item.label}</td>
                      {columns.map(col => {
                        const isAuto = item.auto && (col === 'joint')
                        const val = getCell(col, item.key)
                        return (
                          <td key={col} className="border border-slate-200 p-1">
                            {isAuto
                              ? <input type="text" className={readOnlyCls} value={val} readOnly />
                              : item.auto
                                ? <input type="number" step="0.01" className={inputCls} value={get(`${col}_${item.key}`)} onChange={e => set(`${col}_${item.key}`, e.target.value)} />
                                : <input type="number" step="0.01" className={inputCls} value={val} onChange={e => set(`${col}_${item.key}`, e.target.value)} />
                            }
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </>
              ))}
              <tr className="bg-slate-50">
                <td colSpan={4} className="border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">Annual Expenditure (amortised monthly)</td>
              </tr>
              {annualItems.map(item => (
                <tr key={item.key}>
                  <td className="border border-slate-200 px-3 py-2 text-sm text-slate-700">{item.label} (annual £)</td>
                  {columns.map(col => (
                    <td key={col} className="border border-slate-200 p-1">
                      <input type="number" step="0.01" className={inputCls} value={get(`${col}_${item.key}`)} onChange={e => set(`${col}_${item.key}`, e.target.value)} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-slate-50 font-medium">
                <td className="border border-slate-200 px-3 py-2 text-sm">Total Monthly Expenditure</td>
                {columns.map(col => (
                  <td key={col} className="border border-slate-200 p-1">
                    <input type="text" className={readOnlyCls} value={calcColumnTotal(col)} readOnly />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <YesNo
          label="Has or will household income unexpectedly reduce?"
          value={get('income_reduced')}
          onChange={v => set('income_reduced', v)}
        />
        {get('income_reduced') === 'Yes' && (
          <div>
            <label className={labelCls}>Notes</label>
            <textarea className={inputCls} rows={3} value={get('income_reduced_notes')} onChange={e => set('income_reduced_notes', e.target.value)} />
          </div>
        )}
      </div>

      <div>
        <h2 className={sectionHeading}>Notes</h2>
        <textarea className={inputCls} rows={4} value={get('notes')} onChange={e => set('notes', e.target.value)} placeholder="Additional notes…" />
      </div>
    </div>
  )
}
