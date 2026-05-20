import { type FC } from 'react'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'
const sectionHeading = 'text-base font-semibold text-slate-800 mb-4'

type Props = { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }

const idDocs = ['Driving Licence', 'Passport', 'Bus Pass', 'Blue Disability Badge']
const addressDocs = [
  'Driving Licence', 'Utility Bill', 'Bank Statement', 'Mortgage Statement',
  'Pension Letter', 'Council Tax Bill', 'Benefits Agency Correspondence', 'HMRC Tax Correspondence',
]

export const IdRequirements: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }
  function getArr(key: string): string[] { return (data[key] as string[]) ?? [] }

  function toggleDoc(key: string, doc: string) {
    const arr = getArr(key)
    if (arr.includes(doc)) set(key, arr.filter(d => d !== doc))
    else set(key, [...arr, doc])
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={sectionHeading}>Revolution IDV</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>IDV Completed — Report Status</label>
            <select className={inputCls} value={get('idv_status')} onChange={e => set('idv_status', e.target.value)}>
              <option value="">Select…</option>
              <option>Green</option><option>Amber</option><option>Red</option>
            </select>
          </div>
          {(get('idv_status') === 'Amber' || get('idv_status') === 'Red') && (
            <div>
              <label className={labelCls}>Outcome of conversation with client</label>
              <textarea className={inputCls} rows={4} value={get('idv_outcome')} onChange={e => set('idv_outcome', e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {/* ID Verification Documents */}
      <div>
        <h2 className={sectionHeading}>ID Verification Documents</h2>
        <div className="grid grid-cols-2 gap-6">
          {(['Client 1', 'Client 2'] as const).map((label, ci) => {
            const prefix = ci === 0 ? 'c1' : 'c2'
            const key = `${prefix}_id_docs`
            return (
              <div key={label} className="space-y-3">
                <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-1">{label}</p>
                {idDocs.map(doc => {
                  const docKey = doc.toLowerCase().replace(/[\s/]+/g, '_')
                  const checked = getArr(key).includes(doc)
                  return (
                    <div key={doc} className="space-y-1">
                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={checked}
                          onChange={() => toggleDoc(key, doc)} />
                        {doc}
                      </label>
                      {checked && (
                        <div className="ml-6">
                          <label className={labelCls}>Expiry Date</label>
                          <input type="date" className={inputCls} value={get(`${prefix}_${docKey}_expiry`)} onChange={e => set(`${prefix}_${docKey}_expiry`, e.target.value)} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Address Verification Documents */}
      <div>
        <h2 className={sectionHeading}>Address Verification Documents</h2>
        <div className="grid grid-cols-2 gap-6">
          {(['Client 1', 'Client 2'] as const).map((label, ci) => {
            const prefix = ci === 0 ? 'c1' : 'c2'
            const key = `${prefix}_addr_docs`
            return (
              <div key={label} className="space-y-3">
                <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-1">{label}</p>
                {addressDocs.map(doc => {
                  const docKey = doc.toLowerCase().replace(/[\s/]+/g, '_')
                  const checked = getArr(key).includes(doc)
                  return (
                    <div key={doc} className="space-y-1">
                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={checked}
                          onChange={() => toggleDoc(key, doc)} />
                        {doc}
                      </label>
                      {checked && (
                        <div className="ml-6">
                          <label className={labelCls}>Date Issued / Expiry</label>
                          <input type="date" className={inputCls} value={get(`${prefix}_${docKey}_date`)} onChange={e => set(`${prefix}_${docKey}_date`, e.target.value)} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
