import { type FC } from 'react'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'
const sectionHeading = 'text-base font-semibold text-slate-800 mb-4'

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

function MortgageFields({ prefix, label, data, onChange }: { prefix: string; label: string; data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-1">{label}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Lender</label><input type="text" className={inputCls} value={get(`${prefix}_lender`)} onChange={e => set(`${prefix}_lender`, e.target.value)} /></div>
        <div><label className={labelCls}>Policy Owner</label><input type="text" className={inputCls} value={get(`${prefix}_owner`)} onChange={e => set(`${prefix}_owner`, e.target.value)} /></div>
        <div>
          <label className={labelCls}>Repayment Type</label>
          <select className={inputCls} value={get(`${prefix}_repayment_type`)} onChange={e => set(`${prefix}_repayment_type`, e.target.value)}>
            <option value="">Select…</option>
            {['Capital & Interest', 'Interest Only', 'Endowment', 'Part & Part', 'Other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>Account Number</label><input type="text" className={inputCls} value={get(`${prefix}_account`)} onChange={e => set(`${prefix}_account`, e.target.value)} /></div>
        <div><label className={labelCls}>Outstanding Balance (£)</label><input type="number" step="0.01" className={inputCls} value={get(`${prefix}_balance`)} onChange={e => set(`${prefix}_balance`, e.target.value)} /></div>
        <div><label className={labelCls}>Monthly Payment (£)</label><input type="number" step="0.01" className={inputCls} value={get(`${prefix}_monthly`)} onChange={e => set(`${prefix}_monthly`, e.target.value)} /></div>
        <div><label className={labelCls}>End Date</label><input type="date" className={inputCls} value={get(`${prefix}_end_date`)} onChange={e => set(`${prefix}_end_date`, e.target.value)} /></div>
        <div>
          <label className={labelCls}>Interest Rate Type</label>
          <select className={inputCls} value={get(`${prefix}_rate_type`)} onChange={e => set(`${prefix}_rate_type`, e.target.value)}>
            <option value="">Select…</option>
            {['Fixed', 'Variable', 'Tracker', 'Discount', 'SVR'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>Rate End Date</label><input type="date" className={inputCls} value={get(`${prefix}_rate_end_date`)} onChange={e => set(`${prefix}_rate_end_date`, e.target.value)} /></div>
        <div><label className={labelCls}>Interest Rate (%)</label><input type="number" step="0.01" className={inputCls} value={get(`${prefix}_rate`)} onChange={e => set(`${prefix}_rate`, e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <YesNo label="Early Repayment Penalties?" value={get(`${prefix}_erp`)} onChange={v => set(`${prefix}_erp`, v)} />
        <YesNo label="Portable?" value={get(`${prefix}_portable`)} onChange={v => set(`${prefix}_portable`, v)} />
      </div>
      {get(`${prefix}_erp`) === 'Yes' && (
        <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-blue-100">
          <div><label className={labelCls}>Cost of Penalty (£)</label><input type="number" step="0.01" className={inputCls} value={get(`${prefix}_erp_cost`)} onChange={e => set(`${prefix}_erp_cost`, e.target.value)} /></div>
          <div><label className={labelCls}>Penalty Expiry Date</label><input type="date" className={inputCls} value={get(`${prefix}_erp_expiry`)} onChange={e => set(`${prefix}_erp_expiry`, e.target.value)} /></div>
          <YesNo label="Prepared to pay penalty?" value={get(`${prefix}_erp_willing`)} onChange={v => set(`${prefix}_erp_willing`, v)} />
        </div>
      )}
    </div>
  )
}

export const Mortgages: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }
  function getArr(key: string): Record<string, string>[] { return (data[key] as Record<string, string>[]) ?? [] }

  function setTableRow(tableKey: string, idx: number, col: string, val: string) {
    const arr = getArr(tableKey)
    const updated = [...arr]
    while (updated.length <= idx) updated.push({})
    updated[idx] = { ...updated[idx], [col]: val }
    set(tableKey, updated)
  }
  function getTableCell(tableKey: string, idx: number, col: string): string {
    return getArr(tableKey)[idx]?.[col] ?? ''
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={sectionHeading}>Property Ownership</h2>
        <div className="space-y-4">
          <YesNo label="Is this the only property you own?" value={get('only_property')} onChange={v => set('only_property', v)} />
          {get('only_property') === 'No' && (
            <div>
              <label className={labelCls}>Details of other properties</label>
              <textarea className={inputCls} rows={3} value={get('other_properties_detail')} onChange={e => set('other_properties_detail', e.target.value)} />
            </div>
          )}
          <div>
            <label className={labelCls}>Current Homeowner Status</label>
            <select className={inputCls} value={get('homeowner_status')} onChange={e => set('homeowner_status', e.target.value)}>
              <option value="">Select…</option>
              <option>Owned Outright</option>
              <option>Mortgaged</option>
              <option>Renting</option>
            </select>
          </div>
          {get('homeowner_status') === 'Renting' && (
            <div>
              <label className={labelCls}>Monthly Rent (£)</label>
              <input type="number" step="0.01" className={inputCls} value={get('monthly_rent')} onChange={e => set('monthly_rent', e.target.value)} />
            </div>
          )}
          <YesNo label="Any other secured debts?" value={get('other_secured_debts')} onChange={v => set('other_secured_debts', v)} />
        </div>
      </div>

      <MortgageFields prefix="m1" label="Mortgage 1" data={data} onChange={onChange} />

      <div>
        <YesNo label="Is the repayment vehicle on track?" value={get('repayment_on_track')} onChange={v => set('repayment_on_track', v)} />
      </div>

      <MortgageFields prefix="m2" label="2nd Charge Mortgage" data={data} onChange={onChange} />

      {/* Secured debts table */}
      <div>
        <h2 className={sectionHeading}>Secured Debts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Lender', 'Policy Owner', 'Type', 'Account No.', 'Balance (£)', 'Monthly (£)', 'Rate (%)', 'Start', 'End', 'Referred?'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-600 px-2 py-2 border border-slate-200 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {[
                    { col: 'lender', type: 'text' }, { col: 'owner', type: 'text' }, { col: 'type', type: 'text' },
                    { col: 'account', type: 'text' }, { col: 'balance', type: 'number' }, { col: 'monthly', type: 'number' },
                    { col: 'rate', type: 'number' }, { col: 'start', type: 'date' }, { col: 'end', type: 'date' },
                  ].map(({ col, type }) => (
                    <td key={col} className="border border-slate-200 p-1 min-w-[100px]">
                      <input type={type} step={type === 'number' ? '0.01' : undefined} className={inputCls}
                        value={getTableCell('secured_debts', i, col)}
                        onChange={e => setTableRow('secured_debts', i, col, e.target.value)} />
                    </td>
                  ))}
                  <td className="border border-slate-200 p-1">
                    <select className={inputCls} value={getTableCell('secured_debts', i, 'referred')} onChange={e => setTableRow('secured_debts', i, 'referred', e.target.value)}>
                      <option value=""></option><option>Yes</option><option>No</option>
                    </select>
                  </td>
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
