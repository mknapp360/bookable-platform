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

export const EquityRelease2: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }

  return (
    <div className="space-y-8">
      <h2 className={sectionHeading}>Equity Release — Product Preferences</h2>

      <div className="space-y-5">
        <YesNo label="Want to make interest payments?" value={get('interest_payments')} onChange={v => set('interest_payments', v)} />
        {get('interest_payments') === 'Yes' && (
          <div>
            <label className={labelCls}>Amount (£ monthly)</label>
            <input type="number" step="0.01" className={inputCls} value={get('interest_payment_amount')} onChange={e => set('interest_payment_amount', e.target.value)} />
          </div>
        )}

        <YesNo label="Intend to move house in the future?" value={get('intend_move')} onChange={v => set('intend_move', v)} />
        {get('intend_move') === 'Yes' && (
          <div>
            <label className={labelCls}>Timescale</label>
            <input type="text" className={inputCls} value={get('move_timescale')} onChange={e => set('move_timescale', e.target.value)} placeholder="e.g. 5 years" />
          </div>
        )}

        <YesNo label="Would stay in the property after 1st death?" value={get('stay_after_death')} onChange={v => set('stay_after_death', v)} />
        <YesNo label="Concerned about future interest rate / inflation increases?" value={get('rate_concern')} onChange={v => set('rate_concern', v)} />
        <YesNo label="Is having a low interest rate important?" value={get('low_rate_important')} onChange={v => set('low_rate_important', v)} />
        <YesNo label="Prepared to pay valuation fee upfront to reduce rate?" value={get('upfront_valuation')} onChange={v => set('upfront_valuation', v)} />
        <YesNo label="Option to repay early if funds become available?" value={get('early_repayment_option')} onChange={v => set('early_repayment_option', v)} />

        <div>
          <label className={labelCls}>Fixed or variable early repayment penalty preference</label>
          <select className={inputCls} value={get('erp_preference')} onChange={e => set('erp_preference', e.target.value)}>
            <option value="">Select…</option>
            <option>Fixed</option><option>Variable</option><option>No preference</option>
          </select>
        </div>

        <YesNo label="Understands future alterations may need provider approval?" value={get('understands_alterations')} onChange={v => set('understands_alterations', v)} />
        {get('understands_alterations') === 'Yes' && (
          <div>
            <label className={labelCls}>Acknowledgement Date</label>
            <input type="date" className={inputCls} value={get('alterations_ack_date')} onChange={e => set('alterations_ack_date', e.target.value)} />
          </div>
        )}

        <YesNo label="Any LTC / private medical provision affected by the release?" value={get('ltc_affected')} onChange={v => set('ltc_affected', v)} />
        {get('ltc_affected') === 'Yes' && (
          <div><label className={labelCls}>Detail</label><textarea className={inputCls} rows={3} value={get('ltc_detail')} onChange={e => set('ltc_detail', e.target.value)} /></div>
        )}

        <YesNo label="Prepared to transfer ownership to a 3rd party?" value={get('transfer_ownership')} onChange={v => set('transfer_ownership', v)} />
        {get('transfer_ownership') === 'Yes' && (
          <div>
            <label className={labelCls}>Proportion (%)</label>
            <input type="number" step="0.01" className={inputCls} value={get('transfer_pct')} onChange={e => set('transfer_pct', e.target.value)} />
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
