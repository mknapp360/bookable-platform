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

export const EquityRelease1: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }

  return (
    <div className="space-y-8">
      <h2 className={sectionHeading}>Equity Release — Alternatives &amp; Views</h2>

      <div className="space-y-4">
        <YesNo label="Is downsizing an option?" value={get('downsizing_option')} onChange={v => set('downsizing_option', v)} />
        {get('downsizing_option') === 'Yes' && (
          <div><label className={labelCls}>Notes</label><textarea className={inputCls} rows={3} value={get('downsizing_notes')} onChange={e => set('downsizing_notes', e.target.value)} /></div>
        )}
        {get('downsizing_option') === 'No' && (
          <div><label className={labelCls}>Reason downsizing is not an option</label><textarea className={inputCls} rows={3} value={get('downsizing_notes')} onChange={e => set('downsizing_notes', e.target.value)} /></div>
        )}

        <YesNo label="Use of other assets an option?" value={get('other_assets_option')} onChange={v => set('other_assets_option', v)} />
        {get('other_assets_option') !== '' && (
          <div><label className={labelCls}>Notes</label><textarea className={inputCls} rows={3} value={get('other_assets_notes')} onChange={e => set('other_assets_notes', e.target.value)} /></div>
        )}

        <YesNo label="Other ways to raise funds discussed?" value={get('other_funds_discussed')} onChange={v => set('other_funds_discussed', v)} />
        {get('other_funds_discussed') !== '' && (
          <div className="pl-4 border-l-2 border-blue-100 space-y-2">
            <p className="text-xs font-medium text-slate-600">Which alternatives were discussed?</p>
            {['Family assistance', 'Inheritance', 'Grants', 'Lodger', 'Cut spending'].map(alt => (
              <label key={alt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={((data.other_funds_list as string[]) ?? []).includes(alt)}
                  onChange={() => {
                    const arr = (data.other_funds_list as string[]) ?? []
                    if (arr.includes(alt)) set('other_funds_list', arr.filter(a => a !== alt))
                    else set('other_funds_list', [...arr, alt])
                  }}
                />
                {alt}
              </label>
            ))}
            <div><label className={labelCls}>Notes</label><textarea className={inputCls} rows={3} value={get('other_funds_notes')} onChange={e => set('other_funds_notes', e.target.value)} /></div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelCls}>Importance of leaving an inheritance</label>
          <select className={inputCls} value={get('inheritance_importance')} onChange={e => set('inheritance_importance', e.target.value)}>
            <option value="">Select…</option>
            <option>Very important</option><option>Fairly important</option><option>Not important</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Importance of releasing more equity in the future</label>
          <select className={inputCls} value={get('future_equity_importance')} onChange={e => set('future_equity_importance', e.target.value)}>
            <option value="">Select…</option>
            <option>Very important</option><option>Fairly important</option><option>Not important</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Minimum reserve amount wanted (£)</label>
          <input type="number" step="0.01" className={inputCls} value={get('min_reserve')} onChange={e => set('min_reserve', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>What do you think will happen to property values long-term?</label>
          <select className={inputCls} value={get('property_value_view')} onChange={e => set('property_value_view', e.target.value)}>
            <option value="">Select…</option>
            <option>Rise</option><option>Stay same</option><option>Fall</option><option>Unsure</option>
          </select>
        </div>
      </div>

      <div>
        <h2 className={sectionHeading}>Notes</h2>
        <textarea className={inputCls} rows={4} value={get('notes')} onChange={e => set('notes', e.target.value)} placeholder="Additional notes…" />
      </div>
    </div>
  )
}
