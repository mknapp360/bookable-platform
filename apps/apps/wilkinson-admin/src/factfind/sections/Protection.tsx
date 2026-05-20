import { type FC } from 'react'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
const sectionHeading = 'text-base font-semibold text-slate-800 mb-4'

type Props = { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }

const policyFields: { label: string; key: string; type?: string }[] = [
  { label: 'Policy Holder', key: 'holder' },
  { label: 'Life Insured', key: 'insured' },
  { label: 'Type', key: 'type' },
  { label: 'Provider', key: 'provider' },
  { label: 'Sum Assured (£)', key: 'sum_assured', type: 'number' },
  { label: 'Start Date', key: 'start_date', type: 'date' },
  { label: 'End Date', key: 'end_date', type: 'date' },
  { label: 'Under Trust? (Yes/No)', key: 'under_trust' },
  { label: 'Monthly Premium (£)', key: 'monthly_premium', type: 'number' },
]

export const Protection: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }
  function getArr(key: string): Record<string, string>[] { return (data[key] as Record<string, string>[]) ?? [] }

  function setCell(colIdx: number, fieldKey: string, val: string) {
    const arr = getArr('policies')
    const updated = [...arr]
    while (updated.length <= colIdx) updated.push({})
    updated[colIdx] = { ...updated[colIdx], [fieldKey]: val }
    set('policies', updated)
  }
  function getCell(colIdx: number, fieldKey: string): string {
    return getArr('policies')[colIdx]?.[fieldKey] ?? ''
  }

  const colLabels = ['Policy 1', 'Policy 2', 'Policy 3', 'Policy 4', 'Policy 5']

  return (
    <div className="space-y-8">
      <div>
        <h2 className={sectionHeading}>Protection Policies</h2>
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
              {policyFields.map(field => (
                <tr key={field.key}>
                  <td className="border border-slate-200 px-3 py-2 text-sm text-slate-700 font-medium">{field.label}</td>
                  {Array.from({ length: 5 }).map((_, ci) => {
                    const isSelect = field.key === 'under_trust'
                    return (
                      <td key={ci} className="border border-slate-200 p-1 min-w-[120px]">
                        {isSelect ? (
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
      </div>

      <div>
        <h2 className={sectionHeading}>Notes</h2>
        <textarea className={inputCls} rows={4} value={get('notes')} onChange={e => set('notes', e.target.value)} placeholder="Additional notes…" />
      </div>
    </div>
  )
}
