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

export const AdminDetails: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={sectionHeading}>Plan Being Applied For</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Lender</label><input type="text" className={inputCls} value={get('lender')} onChange={e => set('lender', e.target.value)} /></div>
          <div><label className={labelCls}>Plan Name</label><input type="text" className={inputCls} value={get('plan_name')} onChange={e => set('plan_name', e.target.value)} /></div>
        </div>
      </div>

      <div>
        <h2 className={sectionHeading}>Lifetime Mortgage Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>AER (%)</label><input type="number" step="0.001" className={inputCls} value={get('aer')} onChange={e => set('aer', e.target.value)} /></div>
          <div><label className={labelCls}>MER (%)</label><input type="number" step="0.001" className={inputCls} value={get('mer')} onChange={e => set('mer', e.target.value)} /></div>
          <div><label className={labelCls}>KFI Date</label><input type="date" className={inputCls} value={get('kfi_date')} onChange={e => set('kfi_date', e.target.value)} /></div>
          <div><label className={labelCls}>Term on Illustration</label><input type="text" className={inputCls} value={get('term')} onChange={e => set('term', e.target.value)} /></div>
        </div>
      </div>

      <div>
        <h2 className={sectionHeading}>Financial Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Initial Release (£)</label><input type="number" step="0.01" className={inputCls} value={get('initial_release')} onChange={e => set('initial_release', e.target.value)} /></div>
          <div><label className={labelCls}>Reserve (£)</label><input type="number" step="0.01" className={inputCls} value={get('reserve')} onChange={e => set('reserve', e.target.value)} /></div>
          <div><label className={labelCls}>Total Loan Facility (£)</label><input type="number" step="0.01" className={inputCls} value={get('total_facility')} onChange={e => set('total_facility', e.target.value)} /></div>
          <div><label className={labelCls}>Proc Fee (£)</label><input type="number" step="0.01" className={inputCls} value={get('proc_fee')} onChange={e => set('proc_fee', e.target.value)} /></div>
        </div>
        <div className="mt-4">
          <YesNo label="Is the LTM recommended an Interest Serviced plan?" value={get('interest_serviced')} onChange={v => set('interest_serviced', v)} />
        </div>
      </div>

      <div>
        <h2 className={sectionHeading}>Comparative Illustration Requirements</h2>
        <div className="space-y-4">
          <div><label className={labelCls}>Amount (£)</label><input type="number" step="0.01" className={inputCls} value={get('comp_amount')} onChange={e => set('comp_amount', e.target.value)} /></div>
          <div><label className={labelCls}>Notes about Fees / No ERCs / No Debt Consolidation</label><textarea className={inputCls} rows={4} value={get('comp_notes')} onChange={e => set('comp_notes', e.target.value)} /></div>
        </div>
      </div>

      <div>
        <h2 className={sectionHeading}>Notes for Equilaw</h2>
        <textarea className={inputCls} rows={5} value={get('equilaw_notes')} onChange={e => set('equilaw_notes', e.target.value)} placeholder="Notes to pass to Equilaw…" />
      </div>
    </div>
  )
}
