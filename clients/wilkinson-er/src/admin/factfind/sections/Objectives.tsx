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

export const Objectives: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }
  function getArr(key: string): Record<string, string>[] { return (data[key] as Record<string, string>[]) ?? [] }

  function setTableRow(idx: number, col: string, val: string) {
    const arr = getArr('objectives')
    const updated = [...arr]
    while (updated.length <= idx) updated.push({})
    updated[idx] = { ...updated[idx], [col]: val }
    set('objectives', updated)
  }
  function getCell(idx: number, col: string): string { return getArr('objectives')[idx]?.[col] ?? '' }

  function calcTotalRelease(): string {
    const arr = getArr('objectives')
    const total = arr.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0)
    const cashback = parseFloat(get('cashback_amount')) || 0
    return (total + cashback) ? (total + cashback).toFixed(2) : ''
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className={sectionHeading}>Client Circumstances &amp; Suitability</h2>
        <YesNo label="Do you anticipate any changes to your circumstances?" value={get('circumstances_change')} onChange={v => set('circumstances_change', v)} />
        {get('circumstances_change') === 'Yes' && (
          <div><label className={labelCls}>Detail</label><textarea className={inputCls} rows={3} value={get('circumstances_change_detail')} onChange={e => set('circumstances_change_detail', e.target.value)} /></div>
        )}
        <YesNo label="Significant events in last 12 months affecting decision making?" value={get('significant_events')} onChange={v => set('significant_events', v)} />
        {get('significant_events') === 'Yes' && (
          <div><label className={labelCls}>Detail</label><textarea className={inputCls} rows={3} value={get('significant_events_detail')} onChange={e => set('significant_events_detail', e.target.value)} /></div>
        )}
        <YesNo label="Under any duress to release funds?" value={get('under_duress')} onChange={v => set('under_duress', v)} />
        {get('under_duress') === 'Yes' && (
          <div><label className={labelCls}>Detail</label><textarea className={inputCls} rows={3} value={get('under_duress_detail')} onChange={e => set('under_duress_detail', e.target.value)} /></div>
        )}
        <YesNo label="Have you ever been a victim of financial crime or a scam?" value={get('financial_crime')} onChange={v => set('financial_crime', v)} />
        {get('financial_crime') === 'Yes' && (
          <div><label className={labelCls}>Detail</label><textarea className={inputCls} rows={3} value={get('financial_crime_detail')} onChange={e => set('financial_crime_detail', e.target.value)} /></div>
        )}
        <YesNo label="Would anyone be upset about the reduced estate value?" value={get('upset_estate')} onChange={v => set('upset_estate', v)} />
        {get('upset_estate') === 'Yes' && (
          <div><label className={labelCls}>Detail</label><textarea className={inputCls} rows={3} value={get('upset_estate_detail')} onChange={e => set('upset_estate_detail', e.target.value)} /></div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className={sectionHeading}>Setup Fees &amp; Gifting</h2>
        <div>
          <label className={labelCls}>How do you intend to pay setup fees?</label>
          <select className={inputCls} value={get('setup_fees')} onChange={e => set('setup_fees', e.target.value)}>
            <option value="">Select…</option>
            <option>Add to mortgage</option>
            <option>Pay separately</option>
          </select>
        </div>
        <YesNo label="Are any proceeds being gifted?" value={get('proceeds_gifted')} onChange={v => set('proceeds_gifted', v)} />
        {get('proceeds_gifted') === 'Yes' && (
          <div><label className={labelCls}>Detail</label><textarea className={inputCls} rows={3} value={get('proceeds_gifted_detail')} onChange={e => set('proceeds_gifted_detail', e.target.value)} /></div>
        )}
      </div>

      <div>
        <h2 className={sectionHeading}>Objectives</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">Objective Description</th>
                <th className="text-left text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200 w-32">Amount (£)</th>
                <th className="text-left text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200 w-32">Timescale</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="border border-slate-200 p-1"><input type="text" className={inputCls} value={getCell(i, 'description')} onChange={e => setTableRow(i, 'description', e.target.value)} /></td>
                  <td className="border border-slate-200 p-1"><input type="number" step="0.01" className={inputCls} value={getCell(i, 'amount')} onChange={e => setTableRow(i, 'amount', e.target.value)} /></td>
                  <td className="border border-slate-200 p-1"><input type="text" className={inputCls} value={getCell(i, 'timescale')} onChange={e => setTableRow(i, 'timescale', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelCls}>Total Initial Release (£, auto-calc)</label>
            <input type="text" className={readOnlyCls} value={calcTotalRelease()} readOnly />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <YesNo label="Does the plan include cashback?" value={get('has_cashback')} onChange={v => set('has_cashback', v)} />
          {get('has_cashback') === 'Yes' && (
            <div>
              <label className={labelCls}>Amount of Cashback (£)</label>
              <input type="number" step="0.01" className={inputCls} value={get('cashback_amount')} onChange={e => set('cashback_amount', e.target.value)} />
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className={sectionHeading}>Rationale</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Rationale for recommended plan</label>
            <textarea className={inputCls} rows={6} value={get('rationale')} onChange={e => set('rationale', e.target.value)} placeholder="Explain why the recommended plan meets the client's needs and objectives…" />
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
