import { type FC } from 'react'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'
const sectionHeading = 'text-base font-semibold text-slate-800 mb-4'
const readOnlyCls = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500'

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

function calcAge(dob: string): string {
  if (!dob) return ''
  const d = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return isNaN(age) ? '' : String(age)
}

type Props = { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }

export const PersonalDetails: FC<Props> = ({ data, onChange }) => {
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

  const c1dob = get('c1_dob')
  const c2dob = get('c2_dob')

  return (
    <div className="space-y-8">
      {/* Basic personal info */}
      <div>
        <h2 className={sectionHeading}>Personal Information</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Client 1 */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-1">Client 1</p>
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input type="date" className={inputCls} value={c1dob} onChange={e => set('c1_dob', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Age (auto-calculated)</label>
              <input type="text" className={readOnlyCls} value={calcAge(c1dob)} readOnly />
            </div>
            <div>
              <label className={labelCls}>Sex</label>
              <select className={inputCls} value={get('c1_sex')} onChange={e => set('c1_sex', e.target.value)}>
                <option value="">Select…</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Marital Status</label>
              <select className={inputCls} value={get('c1_marital')} onChange={e => set('c1_marital', e.target.value)}>
                <option value="">Select…</option>
                {['Single', 'Married', 'Civil Partnership', 'Divorced', 'Widowed', 'Separated', 'Cohabiting'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {(get('c1_marital') === 'Divorced' || get('c1_marital') === 'Widowed') && (
              <div>
                <label className={labelCls}>Year (divorced/widowed)</label>
                <input type="number" className={inputCls} value={get('c1_marital_year')} onChange={e => set('c1_marital_year', e.target.value)} />
              </div>
            )}
            <YesNo label="Do you smoke?" value={get('c1_smoke')} onChange={v => set('c1_smoke', v)} />
            <YesNo label="Have you made a Will?" value={get('c1_will')} onChange={v => set('c1_will', v)} />
            <YesNo label="Do you have a Lasting Power of Attorney?" value={get('c1_lpa')} onChange={v => set('c1_lpa', v)} />
            {get('c1_lpa') === 'Yes' && <YesNo label="Is the POA being used?" value={get('c1_lpa_used')} onChange={v => set('c1_lpa_used', v)} />}
            <YesNo label="Are you in good health?" value={get('c1_good_health')} onChange={v => set('c1_good_health', v)} />
            <YesNo label="Do you foresee any impact on life expectancy?" value={get('c1_life_expectancy_impact')} onChange={v => set('c1_life_expectancy_impact', v)} />
            <YesNo label="Is English your first language?" value={get('c1_english_first')} onChange={v => set('c1_english_first', v)} />
            <YesNo label="Physical/mental health conditions affecting understanding?" value={get('c1_health_understanding')} onChange={v => set('c1_health_understanding', v)} />
            {get('c1_health_understanding') === 'Yes' && (
              <div>
                <label className={labelCls}>Detail</label>
                <textarea className={inputCls} rows={3} value={get('c1_health_understanding_detail')} onChange={e => set('c1_health_understanding_detail', e.target.value)} />
              </div>
            )}
            <YesNo label="Are you the primary carer for anyone else?" value={get('c1_primary_carer')} onChange={v => set('c1_primary_carer', v)} />
          </div>

          {/* Client 2 */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-1">Client 2</p>
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input type="date" className={inputCls} value={c2dob} onChange={e => set('c2_dob', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Age (auto-calculated)</label>
              <input type="text" className={readOnlyCls} value={calcAge(c2dob)} readOnly />
            </div>
            <div>
              <label className={labelCls}>Sex</label>
              <select className={inputCls} value={get('c2_sex')} onChange={e => set('c2_sex', e.target.value)}>
                <option value="">Select…</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Marital Status</label>
              <select className={inputCls} value={get('c2_marital')} onChange={e => set('c2_marital', e.target.value)}>
                <option value="">Select…</option>
                {['Single', 'Married', 'Civil Partnership', 'Divorced', 'Widowed', 'Separated', 'Cohabiting'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {(get('c2_marital') === 'Divorced' || get('c2_marital') === 'Widowed') && (
              <div>
                <label className={labelCls}>Year (divorced/widowed)</label>
                <input type="number" className={inputCls} value={get('c2_marital_year')} onChange={e => set('c2_marital_year', e.target.value)} />
              </div>
            )}
            <YesNo label="Do you smoke?" value={get('c2_smoke')} onChange={v => set('c2_smoke', v)} />
            <YesNo label="Have you made a Will?" value={get('c2_will')} onChange={v => set('c2_will', v)} />
            <YesNo label="Do you have a Lasting Power of Attorney?" value={get('c2_lpa')} onChange={v => set('c2_lpa', v)} />
            {get('c2_lpa') === 'Yes' && <YesNo label="Is the POA being used?" value={get('c2_lpa_used')} onChange={v => set('c2_lpa_used', v)} />}
            <YesNo label="Are you in good health?" value={get('c2_good_health')} onChange={v => set('c2_good_health', v)} />
            <YesNo label="Do you foresee any impact on life expectancy?" value={get('c2_life_expectancy_impact')} onChange={v => set('c2_life_expectancy_impact', v)} />
            <YesNo label="Is English your first language?" value={get('c2_english_first')} onChange={v => set('c2_english_first', v)} />
            <YesNo label="Physical/mental health conditions affecting understanding?" value={get('c2_health_understanding')} onChange={v => set('c2_health_understanding', v)} />
            {get('c2_health_understanding') === 'Yes' && (
              <div>
                <label className={labelCls}>Detail</label>
                <textarea className={inputCls} rows={3} value={get('c2_health_understanding_detail')} onChange={e => set('c2_health_understanding_detail', e.target.value)} />
              </div>
            )}
            <YesNo label="Are you the primary carer for anyone else?" value={get('c2_primary_carer')} onChange={v => set('c2_primary_carer', v)} />
          </div>
        </div>
      </div>

      {/* Dependants */}
      <div>
        <h2 className={sectionHeading}>Dependants</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Name', 'DOB', 'Relationship', 'Dependent on', 'Resident in property'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="border border-slate-200 p-1"><input type="text" className={inputCls} value={getTableCell('dependants', i, 'name')} onChange={e => setTableRow('dependants', i, 'name', e.target.value)} /></td>
                  <td className="border border-slate-200 p-1"><input type="date" className={inputCls} value={getTableCell('dependants', i, 'dob')} onChange={e => setTableRow('dependants', i, 'dob', e.target.value)} /></td>
                  <td className="border border-slate-200 p-1"><input type="text" className={inputCls} value={getTableCell('dependants', i, 'relationship')} onChange={e => setTableRow('dependants', i, 'relationship', e.target.value)} /></td>
                  <td className="border border-slate-200 p-1">
                    <select className={inputCls} value={getTableCell('dependants', i, 'dependent_on')} onChange={e => setTableRow('dependants', i, 'dependent_on', e.target.value)}>
                      <option value=""></option><option>C1</option><option>C2</option><option>Joint</option>
                    </select>
                  </td>
                  <td className="border border-slate-200 p-1">
                    <select className={inputCls} value={getTableCell('dependants', i, 'resident')} onChange={e => setTableRow('dependants', i, 'resident', e.target.value)}>
                      <option value=""></option><option>Yes</option><option>No</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Non-dependent children/occupants */}
      <div>
        <h2 className={sectionHeading}>Non-Dependent Children / Other Occupants</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Name', 'DOB', 'Relationship', 'Discussed ER with them', 'Resident in property'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="border border-slate-200 p-1"><input type="text" className={inputCls} value={getTableCell('non_dependants', i, 'name')} onChange={e => setTableRow('non_dependants', i, 'name', e.target.value)} /></td>
                  <td className="border border-slate-200 p-1"><input type="date" className={inputCls} value={getTableCell('non_dependants', i, 'dob')} onChange={e => setTableRow('non_dependants', i, 'dob', e.target.value)} /></td>
                  <td className="border border-slate-200 p-1"><input type="text" className={inputCls} value={getTableCell('non_dependants', i, 'relationship')} onChange={e => setTableRow('non_dependants', i, 'relationship', e.target.value)} /></td>
                  <td className="border border-slate-200 p-1">
                    <select className={inputCls} value={getTableCell('non_dependants', i, 'discussed_er')} onChange={e => setTableRow('non_dependants', i, 'discussed_er', e.target.value)}>
                      <option value=""></option><option>Yes</option><option>No</option>
                    </select>
                  </td>
                  <td className="border border-slate-200 p-1">
                    <select className={inputCls} value={getTableCell('non_dependants', i, 'resident')} onChange={e => setTableRow('non_dependants', i, 'resident', e.target.value)}>
                      <option value=""></option><option>Yes</option><option>No</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      <div>
        <h2 className={sectionHeading}>Notes</h2>
        <textarea className={inputCls} rows={4} value={get('notes')} onChange={e => set('notes', e.target.value)} placeholder="Additional notes…" />
      </div>
    </div>
  )
}
