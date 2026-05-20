import { type FC } from 'react'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
const sectionHeading = 'text-base font-semibold text-slate-800 mb-4'

type Props = { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }

const investmentFields: { label: string; key: string; type?: string }[] = [
  { label: 'Owner (C1/C2/Joint)', key: 'owner' },
  { label: 'Type', key: 'type' },
  { label: 'Fund Details', key: 'fund_details' },
  { label: 'Accessible (Yes/No)', key: 'accessible' },
  { label: 'Provider', key: 'provider' },
  { label: 'Initial Investment (£)', key: 'initial', type: 'number' },
  { label: 'Start Date', key: 'start_date', type: 'date' },
  { label: 'Current Value (£)', key: 'current_value', type: 'number' },
  { label: 'Interest Rate (%)', key: 'rate', type: 'number' },
  { label: 'Income Being Taken (Yes/No)', key: 'income_taken' },
  { label: 'Monthly Amount (£)', key: 'monthly', type: 'number' },
  { label: 'Emergency Fund Amount (£)', key: 'emergency_fund', type: 'number' },
]

export const SavingsInvestments: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }
  function getArr(key: string): Record<string, string>[] { return (data[key] as Record<string, string>[]) ?? [] }

  function setCell(colIdx: number, fieldKey: string, val: string) {
    const arr = getArr('investments')
    const updated = [...arr]
    while (updated.length <= colIdx) updated.push({})
    updated[colIdx] = { ...updated[colIdx], [fieldKey]: val }
    set('investments', updated)
  }
  function getCell(colIdx: number, fieldKey: string): string {
    return getArr('investments')[colIdx]?.[fieldKey] ?? ''
  }

  const colLabels = ['Current Account', 'Investment 1', 'Investment 2', 'Investment 3', 'Investment 4']

  return (
    <div className="space-y-8">
      <div>
        <h2 className={sectionHeading}>Savings &amp; Investments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200 w-1/5">Field</th>
                {colLabels.map(c => (
                  <th key={c} className="text-center text-xs font-medium text-slate-600 px-2 py-2 border border-slate-200">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {investmentFields.map(field => (
                <tr key={field.key}>
                  <td className="border border-slate-200 px-3 py-2 text-sm text-slate-700 font-medium">{field.label}</td>
                  {Array.from({ length: 5 }).map((_, ci) => {
                    const isSelect = field.key === 'owner' || field.key === 'accessible' || field.key === 'income_taken'
                    return (
                      <td key={ci} className="border border-slate-200 p-1 min-w-[120px]">
                        {isSelect && field.key === 'owner' ? (
                          <select className={inputCls} value={getCell(ci, field.key)} onChange={e => setCell(ci, field.key, e.target.value)}>
                            <option value=""></option><option>C1</option><option>C2</option><option>Joint</option>
                          </select>
                        ) : isSelect ? (
                          <select className={inputCls} value={getCell(ci, field.key)} onChange={e => setCell(ci, field.key, e.target.value)}>
                            <option value=""></option><option>Yes</option><option>No</option>
                          </select>
                        ) : (
                          <input
                            type={field.type ?? 'text'}
                            step={field.type === 'number' ? '0.01' : undefined}
                            className={inputCls}
                            value={getCell(ci, field.key)}
                            onChange={e => setCell(ci, field.key, e.target.value)}
                          />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-2 italic">Recommended emergency fund: 3–6 months of net monthly expenditure.</p>
      </div>

      <div>
        <h2 className={sectionHeading}>Notes</h2>
        <textarea className={inputCls} rows={4} value={get('notes')} onChange={e => set('notes', e.target.value)} placeholder="Additional notes…" />
      </div>
    </div>
  )
}
