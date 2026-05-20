import { type FC } from 'react'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'
const sectionHeading = 'text-base font-semibold text-slate-800 mb-4'

type YNProps = { value: string; onChange: (v: string) => void; label: string }
function YesNo({ value, onChange, label }: YNProps) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex gap-2">
        {['Yes', 'No'].map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${value === opt ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

type Props = { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }

export const ClientDetails: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) {
    onChange({ ...data, [key]: value })
  }
  function get(key: string): string { return (data[key] as string) ?? '' }

  return (
    <div className="space-y-8">
      {/* Client 1 & 2 names */}
      <div>
        <h2 className={sectionHeading}>Client Names</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-1">Client 1</p>
            <div>
              <label className={labelCls}>Title</label>
              <select className={inputCls} value={get('c1_title')} onChange={e => set('c1_title', e.target.value)}>
                <option value="">Select…</option>
                {['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Prof', 'Rev', 'Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Forename(s)</label>
              <input type="text" className={inputCls} value={get('c1_forenames')} onChange={e => set('c1_forenames', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Surname</label>
              <input type="text" className={inputCls} value={get('c1_surname')} onChange={e => set('c1_surname', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Known as</label>
              <input type="text" className={inputCls} value={get('c1_known_as')} onChange={e => set('c1_known_as', e.target.value)} />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-1">Client 2</p>
            <div>
              <label className={labelCls}>Title</label>
              <select className={inputCls} value={get('c2_title')} onChange={e => set('c2_title', e.target.value)}>
                <option value="">Select…</option>
                {['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Prof', 'Rev', 'Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Forename(s)</label>
              <input type="text" className={inputCls} value={get('c2_forenames')} onChange={e => set('c2_forenames', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Surname</label>
              <input type="text" className={inputCls} value={get('c2_surname')} onChange={e => set('c2_surname', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Known as</label>
              <input type="text" className={inputCls} value={get('c2_known_as')} onChange={e => set('c2_known_as', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h2 className={sectionHeading}>Property Address</h2>
        <div className="space-y-3">
          {['Address Line 1', 'Address Line 2', 'Address Line 3', 'Address Line 4'].map((l, i) => (
            <div key={i}>
              <label className={labelCls}>{l}</label>
              <input type="text" className={inputCls} value={get(`address_line${i + 1}`)} onChange={e => set(`address_line${i + 1}`, e.target.value)} />
            </div>
          ))}
          <div className="max-w-[180px]">
            <label className={labelCls}>Postcode</label>
            <input type="text" className={inputCls} value={get('postcode')} onChange={e => set('postcode', e.target.value)} />
          </div>
          <YesNo label="Have both clients lived here for 3+ years?" value={get('lived_here_3yr')} onChange={v => set('lived_here_3yr', v)} />
          {get('lived_here_3yr') === 'No' && (
            <div className="pl-4 border-l-2 border-blue-100 space-y-3">
              <div>
                <label className={labelCls}>Previous Address</label>
                <textarea className={`${inputCls}`} rows={3} value={get('previous_address')} onChange={e => set('previous_address', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Time at previous address</label>
                <input type="text" className={inputCls} value={get('previous_address_time')} onChange={e => set('previous_address_time', e.target.value)} placeholder="e.g. 2 years" />
              </div>
            </div>
          )}
          <YesNo label="Does anyone else live in the property?" value={get('others_in_property')} onChange={v => set('others_in_property', v)} />
          {get('others_in_property') === 'Yes' && (
            <div className="pl-4 border-l-2 border-blue-100">
              <YesNo label="Are they willing to sign an occupants waiver?" value={get('occupants_waiver')} onChange={v => set('occupants_waiver', v)} />
            </div>
          )}
        </div>
      </div>

      {/* Contact details */}
      <div>
        <h2 className={sectionHeading}>Contact Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Home Telephone</label>
            <input type="tel" className={inputCls} value={get('home_tel')} onChange={e => set('home_tel', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Mobile</label>
            <input type="tel" className={inputCls} value={get('mobile')} onChange={e => set('mobile', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Email Address</label>
            <input type="email" className={inputCls} value={get('email')} onChange={e => set('email', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Terms & DPA */}
      <div>
        <h2 className={sectionHeading}>Terms of Business &amp; DPA</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Terms of Business — Date discussed</label>
            <input type="date" className={inputCls} value={get('tob_discussed')} onChange={e => set('tob_discussed', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Terms of Business — Date issued</label>
            <input type="date" className={inputCls} value={get('tob_issued')} onChange={e => set('tob_issued', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>DPA discussed and agreed (date)</label>
            <input type="date" className={inputCls} value={get('dpa_agreed')} onChange={e => set('dpa_agreed', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Accompanied */}
      <div>
        <h2 className={sectionHeading}>Accompanied During Appointment</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Name 1</label>
            <input type="text" className={inputCls} value={get('accompanied_name1')} onChange={e => set('accompanied_name1', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Relationship 1</label>
            <input type="text" className={inputCls} value={get('accompanied_rel1')} onChange={e => set('accompanied_rel1', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Name 2</label>
            <input type="text" className={inputCls} value={get('accompanied_name2')} onChange={e => set('accompanied_name2', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Relationship 2</label>
            <input type="text" className={inputCls} value={get('accompanied_rel2')} onChange={e => set('accompanied_rel2', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Dates & Adviser */}
      <div>
        <h2 className={sectionHeading}>Administration</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Factfind Completion Date</label>
            <input type="date" className={inputCls} value={get('factfind_date')} onChange={e => set('factfind_date', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Presentation Date</label>
            <input type="date" className={inputCls} value={get('presentation_date')} onChange={e => set('presentation_date', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Servicing Adviser</label>
            <input type="text" className={inputCls} value={get('servicing_adviser') || 'Katie Wilkinson'} onChange={e => set('servicing_adviser', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Lead Source</label>
            <input type="text" className={inputCls} value={get('lead_source')} onChange={e => set('lead_source', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}
