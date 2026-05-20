import { type FC } from 'react'

const labelCls = 'block text-xs font-medium text-slate-600 mb-1'
const sectionHeading = 'text-base font-semibold text-slate-800 mb-4'

function YesNo({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100">
      <span className="text-sm text-slate-700">{label}</span>
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

export const MarketingPrefs: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={sectionHeading}>Permission to Liaise With</h2>
        <div className="space-y-1">
          <YesNo label="Solicitor / Conveyancer" value={get('liaise_solicitor')} onChange={v => set('liaise_solicitor', v)} />
          <YesNo label="Introducer" value={get('liaise_introducer')} onChange={v => set('liaise_introducer', v)} />
          <YesNo label="Selling agent / Vendor / Builder" value={get('liaise_agent')} onChange={v => set('liaise_agent', v)} />
        </div>
      </div>

      <div>
        <h2 className={sectionHeading}>Marketing Contact Permissions</h2>
        <div className="space-y-1">
          <YesNo label="Post" value={get('contact_post')} onChange={v => set('contact_post', v)} />
          <YesNo label="Email" value={get('contact_email')} onChange={v => set('contact_email', v)} />
          <YesNo label="Phone" value={get('contact_phone')} onChange={v => set('contact_phone', v)} />
          <YesNo label="SMS" value={get('contact_sms')} onChange={v => set('contact_sms', v)} />
        </div>
      </div>

      <div>
        <h2 className={sectionHeading}>Future Contact</h2>
        <div>
          <label className={labelCls}>Happy to be called about future mortgage needs</label>
          <div className="flex gap-2">
            {['Yes', 'No'].map(opt => (
              <button key={opt} type="button" onClick={() => set('future_mortgage_contact', opt)}
                className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${get('future_mortgage_contact') === opt ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
