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

export const Benefits: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }

  return (
    <div className="space-y-6">
      <h2 className={sectionHeading}>State Benefits</h2>

      <YesNo label="Do you receive any state benefits?" value={get('receives_benefits')} onChange={v => set('receives_benefits', v)} />
      {get('receives_benefits') === 'Yes' && (
        <div>
          <label className={labelCls}>Please specify</label>
          <textarea className={inputCls} rows={3} value={get('benefits_detail')} onChange={e => set('benefits_detail', e.target.value)} />
        </div>
      )}

      <YesNo label="Are any of these means tested?" value={get('means_tested')} onChange={v => set('means_tested', v)} />
      <YesNo label="Are you in an assessed income period?" value={get('assessed_income_period')} onChange={v => set('assessed_income_period', v)} />
      <YesNo label="Is a benefit assessment required?" value={get('benefit_assessment_required')} onChange={v => set('benefit_assessment_required', v)} />
      <YesNo label="Have you checked availability of benefits recently?" value={get('checked_recently')} onChange={v => set('checked_recently', v)} />
      <YesNo label="Have you discussed benefits with Citizens Advice Bureau?" value={get('discussed_cab')} onChange={v => set('discussed_cab', v)} />

      <div>
        <h2 className={sectionHeading}>Notes</h2>
        <textarea className={inputCls} rows={4} value={get('notes')} onChange={e => set('notes', e.target.value)} placeholder="Additional notes…" />
      </div>
    </div>
  )
}
