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

export const PropertyDetails: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={sectionHeading}>Property Type &amp; Ownership</h2>
        <div className="space-y-4">
          <YesNo label="Property being purchased?" value={get('is_purchase')} onChange={v => set('is_purchase', v)} />
          <YesNo label="Buy-to-let property?" value={get('is_btl')} onChange={v => set('is_btl', v)} />
          <YesNo label="Second home?" value={get('is_second_home')} onChange={v => set('is_second_home', v)} />
          <div>
            <label className={labelCls}>Ownership Type</label>
            <select className={inputCls} value={get('ownership_type')} onChange={e => set('ownership_type', e.target.value)}>
              <option value="">Select…</option>
              <option>Sole</option><option>Joint tenants</option><option>Tenants in common</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>When did you buy the property?</label>
            <input type="date" className={inputCls} value={get('purchase_date')} onChange={e => set('purchase_date', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Property Type</label>
            <select className={inputCls} value={get('property_type')} onChange={e => set('property_type', e.target.value)}>
              <option value="">Select…</option>
              {['Detached', 'Semi-detached', 'Terraced', 'Flat', 'Bungalow', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Number of Bedrooms</label>
            <input type="number" className={inputCls} value={get('bedrooms')} onChange={e => set('bedrooms', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Freehold / Leasehold</label>
            <select className={inputCls} value={get('tenure')} onChange={e => set('tenure', e.target.value)}>
              <option value="">Select…</option>
              <option>Freehold</option><option>Leasehold</option>
            </select>
          </div>
          {get('tenure') === 'Leasehold' && (
            <div className="pl-4 border-l-2 border-blue-100 space-y-3">
              <div><label className={labelCls}>Years Remaining on Lease</label><input type="number" className={inputCls} value={get('lease_years')} onChange={e => set('lease_years', e.target.value)} /></div>
              <div><label className={labelCls}>Annual Ground Rent (£)</label><input type="number" step="0.01" className={inputCls} value={get('ground_rent')} onChange={e => set('ground_rent', e.target.value)} /></div>
              <div><label className={labelCls}>Annual Service Charge (£)</label><input type="number" step="0.01" className={inputCls} value={get('service_charge')} onChange={e => set('service_charge', e.target.value)} /></div>
              <div><label className={labelCls}>Landlord Name &amp; Address</label><textarea className={inputCls} rows={3} value={get('landlord_address')} onChange={e => set('landlord_address', e.target.value)} /></div>
              <div><label className={labelCls}>Management Company Name &amp; Address</label><textarea className={inputCls} rows={3} value={get('mgmt_company_address')} onChange={e => set('mgmt_company_address', e.target.value)} /></div>
              <YesNo label="Lease being extended or freehold purchased with LTM?" value={get('lease_extension')} onChange={v => set('lease_extension', v)} />
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className={sectionHeading}>Property Condition &amp; Construction</h2>
        <div className="space-y-4">
          <YesNo label="Non-standard construction materials or subsidence?" value={get('non_standard')} onChange={v => set('non_standard', v)} />
          {get('non_standard') === 'Yes' && (
            <div><label className={labelCls}>Detail</label><textarea className={inputCls} rows={3} value={get('non_standard_detail')} onChange={e => set('non_standard_detail', e.target.value)} /></div>
          )}
          <YesNo label="Flooding or coastal erosion in last 15 years?" value={get('flood_risk')} onChange={v => set('flood_risk', v)} />
          <div>
            <label className={labelCls}>Drainage</label>
            <select className={inputCls} value={get('drainage')} onChange={e => set('drainage', e.target.value)}>
              <option value="">Select…</option>
              <option>Mains drains</option><option>Septic tank</option>
            </select>
          </div>
          <YesNo label="Flat roof?" value={get('flat_roof')} onChange={v => set('flat_roof', v)} />
          {get('flat_roof') === 'Yes' && (
            <div>
              <label className={labelCls}>Percentage of flat roof (%)</label>
              <input type="number" step="1" className={inputCls} value={get('flat_roof_pct')} onChange={e => set('flat_roof_pct', e.target.value)} />
            </div>
          )}
          <YesNo label="Ex-local authority property?" value={get('ex_local_authority')} onChange={v => set('ex_local_authority', v)} />
          {get('ex_local_authority') === 'Yes' && (
            <div>
              <label className={labelCls}>When was it purchased from local authority?</label>
              <input type="date" className={inputCls} value={get('ex_la_purchase_date')} onChange={e => set('ex_la_purchase_date', e.target.value)} />
            </div>
          )}
          <div>
            <label className={labelCls}>Year Built</label>
            <input type="number" className={inputCls} value={get('year_built')} onChange={e => set('year_built', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Warranty (if built within last 10 years)</label>
            <input type="text" className={inputCls} value={get('warranty')} onChange={e => set('warranty', e.target.value)} />
          </div>
        </div>
      </div>

      <div>
        <h2 className={sectionHeading}>Valuation &amp; Special Features</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Estimated Property Value (£)</label>
            <input type="number" step="0.01" className={inputCls} value={get('estimated_value')} onChange={e => set('estimated_value', e.target.value)} />
          </div>
          <YesNo label="Prepared to transfer ownership to a 3rd party?" value={get('transfer_ownership')} onChange={v => set('transfer_ownership', v)} />
          {get('transfer_ownership') === 'Yes' && (
            <div>
              <label className={labelCls}>Proportion (%)</label>
              <input type="number" step="0.01" className={inputCls} value={get('transfer_pct')} onChange={e => set('transfer_pct', e.target.value)} />
            </div>
          )}
          <YesNo label="Solar panels?" value={get('solar_panels')} onChange={v => set('solar_panels', v)} />
          {get('solar_panels') === 'Yes' && (
            <div>
              <label className={labelCls}>Bought or Leased?</label>
              <select className={inputCls} value={get('solar_type')} onChange={e => set('solar_type', e.target.value)}>
                <option value="">Select…</option>
                <option>Bought</option><option>Leased</option>
              </select>
            </div>
          )}
          <YesNo label="Spray foam loft insulation?" value={get('spray_foam')} onChange={v => set('spray_foam', v)} />
          {get('spray_foam') === 'Yes' && (
            <div><label className={labelCls}>Detail</label><textarea className={inputCls} rows={3} value={get('spray_foam_detail')} onChange={e => set('spray_foam_detail', e.target.value)} /></div>
          )}
        </div>
      </div>

      <div>
        <h2 className={sectionHeading}>Notes on Property Condition &amp; Locality</h2>
        <textarea className={inputCls} rows={5} value={get('notes')} onChange={e => set('notes', e.target.value)} placeholder="Property condition, locality, any other relevant information…" />
      </div>
    </div>
  )
}
