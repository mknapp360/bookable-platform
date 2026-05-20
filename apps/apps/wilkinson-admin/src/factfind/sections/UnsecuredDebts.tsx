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

export const UnsecuredDebts: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }
  function getArr(key: string): Record<string, string>[] { return (data[key] as Record<string, string>[]) ?? [] }

  function setTableRow(idx: number, col: string, val: string) {
    const arr = getArr('debts')
    const updated = [...arr]
    while (updated.length <= idx) updated.push({})
    updated[idx] = { ...updated[idx], [col]: val }
    set('debts', updated)
  }
  function getCell(idx: number, col: string): string { return getArr('debts')[idx]?.[col] ?? '' }

  function calcTotalDebts(): string {
    const arr = getArr('debts')
    const total = arr.reduce((acc, row) => acc + (parseFloat(row.balance) || 0), 0)
    return total ? total.toFixed(2) : ''
  }

  function calcTotalLtm(): string {
    const arr = getArr('debts')
    const total = arr.filter(r => r.repaid_ltm === 'Yes').reduce((acc, row) => acc + (parseFloat(row.balance) || 0), 0)
    return total ? total.toFixed(2) : ''
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className={sectionHeading}>Debt History</h2>
        <YesNo label="Any debt management plans, CCJs or bankruptcies?" value={get('dmp_ccj')} onChange={v => set('dmp_ccj', v)} />
        {get('dmp_ccj') === 'Yes' && (
          <div>
            <label className={labelCls}>Details</label>
            <textarea className={inputCls} rows={3} value={get('dmp_ccj_detail')} onChange={e => set('dmp_ccj_detail', e.target.value)} />
          </div>
        )}
        <YesNo label="Any unsecured debts?" value={get('has_debts')} onChange={v => set('has_debts', v)} />
      </div>

      <div>
        <h2 className={sectionHeading}>Unsecured Debts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Client', 'Type', 'Lender', 'Balance (£)', 'Rate (%)', 'Start', 'End', 'Monthly (£)', 'Paid in full monthly?', 'Repaid with LTM?'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-600 px-2 py-2 border border-slate-200 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td className="border border-slate-200 p-1 min-w-[80px]">
                    <select className={inputCls} value={getCell(i, 'client')} onChange={e => setTableRow(i, 'client', e.target.value)}>
                      <option value=""></option><option>C1</option><option>C2</option><option>Joint</option>
                    </select>
                  </td>
                  <td className="border border-slate-200 p-1 min-w-[120px]">
                    <select className={inputCls} value={getCell(i, 'type')} onChange={e => setTableRow(i, 'type', e.target.value)}>
                      <option value=""></option>
                      {['Credit Card', 'Loan', 'HP', 'Overdraft', 'Buy Now Pay Later', 'Other'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="border border-slate-200 p-1 min-w-[120px]"><input type="text" className={inputCls} value={getCell(i, 'lender')} onChange={e => setTableRow(i, 'lender', e.target.value)} /></td>
                  <td className="border border-slate-200 p-1 min-w-[100px]"><input type="number" step="0.01" className={inputCls} value={getCell(i, 'balance')} onChange={e => setTableRow(i, 'balance', e.target.value)} /></td>
                  <td className="border border-slate-200 p-1 min-w-[80px]"><input type="number" step="0.01" className={inputCls} value={getCell(i, 'rate')} onChange={e => setTableRow(i, 'rate', e.target.value)} /></td>
                  <td className="border border-slate-200 p-1 min-w-[110px]"><input type="date" className={inputCls} value={getCell(i, 'start')} onChange={e => setTableRow(i, 'start', e.target.value)} /></td>
                  <td className="border border-slate-200 p-1 min-w-[110px]"><input type="date" className={inputCls} value={getCell(i, 'end')} onChange={e => setTableRow(i, 'end', e.target.value)} /></td>
                  <td className="border border-slate-200 p-1 min-w-[100px]"><input type="number" step="0.01" className={inputCls} value={getCell(i, 'monthly')} onChange={e => setTableRow(i, 'monthly', e.target.value)} /></td>
                  <td className="border border-slate-200 p-1 min-w-[80px]">
                    <select className={inputCls} value={getCell(i, 'paid_full')} onChange={e => setTableRow(i, 'paid_full', e.target.value)}>
                      <option value=""></option><option>Yes</option><option>No</option>
                    </select>
                  </td>
                  <td className="border border-slate-200 p-1 min-w-[80px]">
                    <select className={inputCls} value={getCell(i, 'repaid_ltm')} onChange={e => setTableRow(i, 'repaid_ltm', e.target.value)}>
                      <option value=""></option><option>Yes</option><option>No</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelCls}>Total Unsecured Debts (£, auto-calc)</label>
            <input type="text" className={readOnlyCls} value={calcTotalDebts()} readOnly />
          </div>
          <div>
            <label className={labelCls}>Total Being Repaid with LTM (£, auto-calc)</label>
            <input type="text" className={readOnlyCls} value={calcTotalLtm()} readOnly />
          </div>
        </div>
      </div>

      <div>
        <h2 className={sectionHeading}>Consolidation Rationale</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Why does the client want to consolidate?</label>
            <textarea className={inputCls} rows={4} value={get('consolidation_reason')} onChange={e => set('consolidation_reason', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea className={inputCls} rows={3} value={get('notes')} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}
