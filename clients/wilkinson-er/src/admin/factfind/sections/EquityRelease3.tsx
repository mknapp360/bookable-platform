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

const features = [
  'Initial release to fulfil objectives',
  'Ability to have a reserve',
  'Ability to repay in full on first death',
  'Downsizing protection',
  'Ability to make overpayments without penalty',
  'Having a known Early Repayment Penalty',
  'Having the lowest interest rate',
]

export const EquityRelease3: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={sectionHeading}>Feature Ranking (1 = most important)</h2>
        <div className="space-y-3">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex-1 text-sm text-slate-700">{feature}</div>
              <div className="w-20">
                <select className={inputCls} value={get(`feature_rank_${i}`)} onChange={e => set(`feature_rank_${i}`, e.target.value)}>
                  <option value="">–</option>
                  {Array.from({ length: 7 }, (_, n) => n + 1).map(n => (
                    <option key={n} value={String(n)}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className={sectionHeading}>Property Deeds &amp; Insurance</h2>
        <YesNo label="Do you have property deeds?" value={get('has_deeds')} onChange={v => set('has_deeds', v)} />
        <YesNo label="Buildings &amp; Contents insurance in place?" value={get('buildings_insurance')} onChange={v => set('buildings_insurance', v)} />
        {get('buildings_insurance') === 'Yes' && (
          <div>
            <label className={labelCls}>Renewal Date</label>
            <input type="date" className={inputCls} value={get('insurance_renewal')} onChange={e => set('insurance_renewal', e.target.value)} />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className={sectionHeading}>Solicitor</h2>
        <div>
          <label className={labelCls}>Solicitor</label>
          <select className={inputCls} value={get('solicitor_type')} onChange={e => set('solicitor_type', e.target.value)}>
            <option value="">Select…</option>
            <option>Tivoli Legal</option><option>Other</option>
          </select>
        </div>
        {get('solicitor_type') === 'Other' && (
          <div className="pl-4 border-l-2 border-blue-100 space-y-3">
            <div><label className={labelCls}>Solicitor Name</label><input type="text" className={inputCls} value={get('solicitor_name')} onChange={e => set('solicitor_name', e.target.value)} /></div>
            <div><label className={labelCls}>Solicitor Address</label><textarea className={inputCls} rows={3} value={get('solicitor_address')} onChange={e => set('solicitor_address', e.target.value)} /></div>
            <div><label className={labelCls}>Solicitor Telephone</label><input type="tel" className={inputCls} value={get('solicitor_tel')} onChange={e => set('solicitor_tel', e.target.value)} /></div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className={sectionHeading}>Advice Fee</h2>
        <div>
          <label className={labelCls}>Advice Fee (£)</label>
          <input type="number" step="0.01" className={inputCls} value={get('advice_fee') || '995'} onChange={e => set('advice_fee', e.target.value)} />
        </div>
      </div>

      <div>
        <h2 className={sectionHeading}>General Notes</h2>
        <textarea className={inputCls} rows={4} value={get('notes')} onChange={e => set('notes', e.target.value)} placeholder="General notes…" />
      </div>
    </div>
  )
}
