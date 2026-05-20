import { type FC } from 'react'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'
const sectionHeading = 'text-base font-semibold text-slate-800 mb-4'

function YesNoCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {['Yes', 'No'].map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`px-2 py-1 text-xs rounded font-medium transition-colors ${value === opt ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          {opt}
        </button>
      ))}
    </div>
  )
}

type Props = { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }

const CONDITIONS_11 = [
  'Dementia / Alzheimer\'s',
  'Chronic Respiratory Disease',
  'Chronic Kidney Failure',
  'Heart / Kidney / Liver / Lung transplant',
  'Cirrhosis of the liver',
  'Motor Neuron Disease',
  'Heart Valve replacement / Pacemaker / ICD',
  'Peripheral Vascular Disease',
  'Hepatitis C',
  'HIV',
]

export const Medical: FC<Props> = ({ data, onChange }) => {
  function set(key: string, value: unknown) { onChange({ ...data, [key]: value }) }
  function get(key: string): string { return (data[key] as string) ?? '' }
  function getArr(key: string): string[] { return (data[key] as string[]) ?? [] }

  function toggleCondition(client: 'c1' | 'c2', condition: string) {
    const key = `${client}_conditions_11`
    const arr = getArr(key)
    if (arr.includes(condition)) {
      set(key, arr.filter(c => c !== condition))
    } else {
      set(key, [...arr, condition])
    }
  }

  const rows: { label: string; key: string; type?: 'dropdown' | 'yn' }[] = [
    { label: '1. Smoked 10+ cigarettes/day for 10+ years?', key: 'q1', type: 'yn' },
    { label: '2. Weekly alcohol consumption', key: 'q2_alcohol', type: 'dropdown' },
    { label: '3. High blood pressure requiring daily medication?', key: 'q3', type: 'yn' },
    { label: '4. Diabetes controlled with tablets or insulin?', key: 'q4', type: 'yn' },
    { label: '5a. Heart attack, bypass or angioplasty?', key: 'q5a', type: 'yn' },
    { label: '5b. Angina / ischaemic heart disease requiring daily medication?', key: 'q5b', type: 'yn' },
    { label: '6a. Major stroke (CVA)?', key: 'q6a', type: 'yn' },
    { label: '6b. Mini stroke (TIA) in last 5 years requiring medication?', key: 'q6b', type: 'yn' },
    { label: '7. Multiple sclerosis requiring walking aids?', key: 'q7', type: 'yn' },
    { label: '8. Cancer, leukaemia, lymphoma requiring chemo/radiotherapy?', key: 'q8', type: 'yn' },
    { label: "9. Parkinson's disease requiring walking aids or daily medication?", key: 'q9', type: 'yn' },
    { label: '10. Advised to take early retirement due to ill health (other than conditions listed)?', key: 'q10', type: 'yn' },
    { label: '12. Taking other prescription drugs not already mentioned?', key: 'q12', type: 'yn' },
  ]

  return (
    <div className="space-y-8">
      {/* Height & Weight */}
      <div>
        <h2 className={sectionHeading}>Height &amp; Weight</h2>
        <div className="grid grid-cols-2 gap-6">
          {(['Client 1', 'Client 2'] as const).map((label, ci) => {
            const prefix = ci === 0 ? 'c1' : 'c2'
            return (
              <div key={label} className="space-y-4">
                <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-1">{label}</p>
                <div>
                  <p className={labelCls}>Height</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className={labelCls}>ft</label>
                      <input type="number" className={inputCls} value={get(`${prefix}_height_ft`)} onChange={e => set(`${prefix}_height_ft`, e.target.value)} />
                    </div>
                    <div className="flex-1">
                      <label className={labelCls}>in</label>
                      <input type="number" className={inputCls} value={get(`${prefix}_height_in`)} onChange={e => set(`${prefix}_height_in`, e.target.value)} />
                    </div>
                    <div className="flex items-end pb-2 text-slate-400 text-xs">OR</div>
                    <div className="flex-1">
                      <label className={labelCls}>cm</label>
                      <input type="number" className={inputCls} value={get(`${prefix}_height_cm`)} onChange={e => set(`${prefix}_height_cm`, e.target.value)} />
                    </div>
                  </div>
                </div>
                <div>
                  <p className={labelCls}>Weight</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className={labelCls}>stone</label>
                      <input type="number" className={inputCls} value={get(`${prefix}_weight_st`)} onChange={e => set(`${prefix}_weight_st`, e.target.value)} />
                    </div>
                    <div className="flex-1">
                      <label className={labelCls}>lbs</label>
                      <input type="number" className={inputCls} value={get(`${prefix}_weight_lbs`)} onChange={e => set(`${prefix}_weight_lbs`, e.target.value)} />
                    </div>
                    <div className="flex items-end pb-2 text-slate-400 text-xs">OR</div>
                    <div className="flex-1">
                      <label className={labelCls}>kg</label>
                      <input type="number" className={inputCls} value={get(`${prefix}_weight_kg`)} onChange={e => set(`${prefix}_weight_kg`, e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Medical questions table */}
      <div>
        <h2 className={sectionHeading}>Medical Questions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200 w-1/2">Question</th>
                <th className="text-center text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200 w-1/4">Client 1</th>
                <th className="text-center text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200 w-1/4">Client 2</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key}>
                  <td className="border border-slate-200 px-3 py-2 text-sm text-slate-700">{row.label}</td>
                  <td className="border border-slate-200 px-3 py-2">
                    {row.type === 'dropdown' ? (
                      <select className={inputCls} value={get(`c1_${row.key}`)} onChange={e => set(`c1_${row.key}`, e.target.value)}>
                        <option value="">Select…</option>
                        <option>0-49 units</option><option>50-69 units</option><option>70+ units</option>
                      </select>
                    ) : (
                      <YesNoCell value={get(`c1_${row.key}`)} onChange={v => set(`c1_${row.key}`, v)} />
                    )}
                  </td>
                  <td className="border border-slate-200 px-3 py-2">
                    {row.type === 'dropdown' ? (
                      <select className={inputCls} value={get(`c2_${row.key}`)} onChange={e => set(`c2_${row.key}`, e.target.value)}>
                        <option value="">Select…</option>
                        <option>0-49 units</option><option>50-69 units</option><option>70+ units</option>
                      </select>
                    ) : (
                      <YesNoCell value={get(`c2_${row.key}`)} onChange={v => set(`c2_${row.key}`, v)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Question 11 — condition checklist */}
      <div>
        <h2 className={sectionHeading}>11. Diagnosed with any of the following?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">Condition</th>
                <th className="text-center text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">Client 1</th>
                <th className="text-center text-xs font-medium text-slate-600 px-3 py-2 border border-slate-200">Client 2</th>
              </tr>
            </thead>
            <tbody>
              {CONDITIONS_11.map(cond => (
                <tr key={cond}>
                  <td className="border border-slate-200 px-3 py-2 text-sm text-slate-700">{cond}</td>
                  <td className="border border-slate-200 px-3 py-2 text-center">
                    <input type="checkbox"
                      checked={getArr('c1_conditions_11').includes(cond)}
                      onChange={() => toggleCondition('c1', cond)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-center">
                    <input type="checkbox"
                      checked={getArr('c2_conditions_11').includes(cond)}
                      onChange={() => toggleCondition('c2', cond)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reasons not completed */}
      <div>
        <h2 className={sectionHeading}>Reasons Why Not Completed</h2>
        <textarea className={inputCls} rows={4} value={get('not_completed_reason')} onChange={e => set('not_completed_reason', e.target.value)} placeholder="If medical questionnaire was not fully completed, explain why…" />
      </div>

      {/* Signature dates */}
      <div>
        <h2 className={sectionHeading}>Signatures</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Client 1 Signature Date</label>
            <input type="date" className={inputCls} value={get('c1_signature_date')} onChange={e => set('c1_signature_date', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Client 2 Signature Date</label>
            <input type="date" className={inputCls} value={get('c2_signature_date')} onChange={e => set('c2_signature_date', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}
