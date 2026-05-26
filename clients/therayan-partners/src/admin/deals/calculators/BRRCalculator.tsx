import { useState } from 'react'
import { Save, AlertTriangle } from 'lucide-react'
import type { Property } from '../types'

interface Props {
  property: Property
  analysis: Record<string, unknown> | null
  onSave: (inputs: Record<string, number>, outputs: Record<string, number | null>) => void
}

export function BRRCalculator({ property, analysis, onSave }: Props) {
  const estimatedValue = Number(analysis?.estimated_value ?? 0)

  const [inputs, setInputs] = useState({
    purchase_price: property.price ?? 0,
    refurb_cost: 20000,
    gdv: estimatedValue || (property.price ? Math.round(property.price * 1.3) : 0),
    refinance_ltv: 75,
    mortgage_rate: 5.5,
    monthly_rent: Number(analysis?.avg_monthly_rent ?? 0),
  })

  const set = (key: string, val: string) =>
    setInputs(prev => ({ ...prev, [key]: Number(val) || 0 }))

  // Calculations
  const totalInvestment = inputs.purchase_price + inputs.refurb_cost
  const refinanceValue = inputs.gdv * (inputs.refinance_ltv / 100)
  const moneyLeftIn = totalInvestment - refinanceValue
  const equity = inputs.gdv - refinanceValue
  const monthlyRate = inputs.mortgage_rate / 100 / 12
  const mortgagePayment = monthlyRate > 0
    ? refinanceValue * (monthlyRate * Math.pow(1 + monthlyRate, 300)) /
      (Math.pow(1 + monthlyRate, 300) - 1)
    : 0
  const netCashflow = inputs.monthly_rent - mortgagePayment
  const roi = moneyLeftIn > 0
    ? ((netCashflow * 12) / moneyLeftIn) * 100
    : netCashflow > 0 ? Infinity : 0
  const grossYield = inputs.gdv > 0
    ? ((inputs.monthly_rent * 12) / inputs.gdv) * 100 : 0

  // Negative equity detector
  const askingVsValue = estimatedValue > 0
    ? ((inputs.purchase_price - estimatedValue) / estimatedValue) * 100
    : null
  const negativeEquityWarning = askingVsValue !== null && askingVsValue > -10

  const outputs = {
    total_investment: totalInvestment,
    refinance_value: Math.round(refinanceValue),
    money_left_in: Math.round(moneyLeftIn),
    equity: Math.round(equity),
    mortgage_payment: Math.round(mortgagePayment),
    net_cashflow: Math.round(netCashflow),
    gross_yield: Number(grossYield.toFixed(2)),
    roi: roi === Infinity ? null : Number(roi.toFixed(2)),
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Inputs</h3>
          {[
            { key: 'purchase_price', label: 'Purchase Price (£)' },
            { key: 'refurb_cost', label: 'Refurb Cost (£)' },
            { key: 'gdv', label: 'GDV / After Value (£)' },
            { key: 'refinance_ltv', label: 'Refinance LTV (%)' },
            { key: 'mortgage_rate', label: 'Mortgage Rate (%)' },
            { key: 'monthly_rent', label: 'Monthly Rent (£)' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <label className="text-sm text-gray-600 w-44 shrink-0">{label}</label>
              <input
                type="number"
                value={inputs[key as keyof typeof inputs]}
                onChange={e => set(key, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          ))}
        </div>

        {/* Outputs */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Results</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Investment', value: `£${totalInvestment.toLocaleString()}` },
              { label: 'Refinance Release', value: `£${Math.round(refinanceValue).toLocaleString()}` },
              { label: 'Money Left In', value: `£${Math.round(moneyLeftIn).toLocaleString()}` },
              { label: 'Equity', value: `£${Math.round(equity).toLocaleString()}` },
              { label: 'Monthly Mortgage', value: `£${Math.round(mortgagePayment).toLocaleString()}` },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{r.label}</span>
                <span className="text-sm font-medium">{r.value}</span>
              </div>
            ))}

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className={`rounded-lg p-4 text-center ${moneyLeftIn <= 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
                <p className="text-xs text-gray-500 mb-1">Money Left In</p>
                <p className={`text-xl font-bold ${moneyLeftIn <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                  £{Math.round(Math.abs(moneyLeftIn)).toLocaleString()}
                  {moneyLeftIn <= 0 && ' out'}
                </p>
              </div>
              <div className={`rounded-lg p-4 text-center ${netCashflow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-xs text-gray-500 mb-1">Net Cashflow/mo</p>
                <p className={`text-xl font-bold ${netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{Math.round(netCashflow).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">ROI</p>
                <p className="text-xl font-bold text-purple-600">
                  {roi === Infinity ? '∞' : `${roi.toFixed(1)}%`}
                </p>
              </div>
            </div>
          </div>

          {/* Negative equity detector */}
          {askingVsValue !== null && (
            <div className={`mt-6 rounded-lg p-4 ${negativeEquityWarning ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-start gap-2">
                {negativeEquityWarning && <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />}
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Negative Equity Detector
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Asking price is <strong>{askingVsValue > 0 ? '+' : ''}{askingVsValue.toFixed(1)}%</strong> vs
                    estimated value ({estimatedValue > 0 ? `£${estimatedValue.toLocaleString()}` : 'unknown'}).
                    {negativeEquityWarning
                      ? ' Warning: asking price is close to or above estimated value.'
                      : ' Looks good — asking price is well below estimated value.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => onSave(inputs, outputs)}
            className="mt-6 inline-flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save size={16} /> Save BRR Analysis
          </button>
        </div>
      </div>
    </div>
  )
}
