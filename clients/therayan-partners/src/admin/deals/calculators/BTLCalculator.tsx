import { useState } from 'react'
import { Save } from 'lucide-react'
import type { Property } from '../types'

interface Props {
  property: Property
  analysis: Record<string, unknown> | null
  onSave: (inputs: Record<string, number>, outputs: Record<string, number | null>) => void
}

export function BTLCalculator({ property, analysis, onSave }: Props) {
  const defaultRent = Number(analysis?.avg_monthly_rent ?? 0)

  const [inputs, setInputs] = useState({
    purchase_price: property.price ?? 0,
    deposit_pct: 25,
    mortgage_rate: 5.5,
    monthly_rent: defaultRent,
    management_fee_pct: 10,
    maintenance_monthly: 100,
    insurance_monthly: 50,
    ground_rent_annual: 0,
    service_charge_annual: 0,
  })

  const set = (key: string, val: string) =>
    setInputs(prev => ({ ...prev, [key]: Number(val) || 0 }))

  // Calculations
  const deposit = inputs.purchase_price * (inputs.deposit_pct / 100)
  const mortgageAmount = inputs.purchase_price - deposit
  const monthlyRate = inputs.mortgage_rate / 100 / 12
  const mortgagePayment = monthlyRate > 0
    ? mortgageAmount * (monthlyRate * Math.pow(1 + monthlyRate, 300)) /
      (Math.pow(1 + monthlyRate, 300) - 1)
    : 0
  const managementFee = inputs.monthly_rent * (inputs.management_fee_pct / 100)
  const groundRentMonthly = inputs.ground_rent_annual / 12
  const serviceChargeMonthly = inputs.service_charge_annual / 12
  const totalExpenses = mortgagePayment + managementFee + inputs.maintenance_monthly +
    inputs.insurance_monthly + groundRentMonthly + serviceChargeMonthly
  const netCashflow = inputs.monthly_rent - totalExpenses
  const annualRent = inputs.monthly_rent * 12
  const grossYield = inputs.purchase_price > 0
    ? (annualRent / inputs.purchase_price) * 100 : 0
  const netYield = inputs.purchase_price > 0
    ? ((annualRent - totalExpenses * 12) / inputs.purchase_price) * 100 : 0
  const roi = deposit > 0
    ? ((netCashflow * 12) / deposit) * 100 : 0

  // Stamp duty (simplified UK SDLT for additional property)
  const stampDuty = calcStampDuty(inputs.purchase_price)

  const outputs = {
    deposit,
    stamp_duty: stampDuty,
    mortgage_payment: Math.round(mortgagePayment),
    total_expenses: Math.round(totalExpenses),
    net_cashflow: Math.round(netCashflow),
    gross_yield: Number(grossYield.toFixed(2)),
    net_yield: Number(netYield.toFixed(2)),
    roi: Number(roi.toFixed(2)),
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Inputs</h3>
          {[
            { key: 'purchase_price', label: 'Purchase Price (£)' },
            { key: 'deposit_pct', label: 'Deposit (%)' },
            { key: 'mortgage_rate', label: 'Mortgage Rate (%)' },
            { key: 'monthly_rent', label: 'Monthly Rent (£)' },
            { key: 'management_fee_pct', label: 'Management Fee (%)' },
            { key: 'maintenance_monthly', label: 'Maintenance (£/mo)' },
            { key: 'insurance_monthly', label: 'Insurance (£/mo)' },
            { key: 'ground_rent_annual', label: 'Ground Rent (£/yr)' },
            { key: 'service_charge_annual', label: 'Service Charge (£/yr)' },
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
              { label: 'Deposit', value: `£${deposit.toLocaleString()}` },
              { label: 'Stamp Duty (addl.)', value: `£${stampDuty.toLocaleString()}` },
              { label: 'Monthly Mortgage', value: `£${Math.round(mortgagePayment).toLocaleString()}` },
              { label: 'Total Monthly Costs', value: `£${Math.round(totalExpenses).toLocaleString()}` },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{r.label}</span>
                <span className="text-sm font-medium">{r.value}</span>
              </div>
            ))}

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className={`rounded-lg p-4 text-center ${netCashflow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-xs text-gray-500 mb-1">Net Cashflow/mo</p>
                <p className={`text-xl font-bold ${netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{Math.round(netCashflow).toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Gross Yield</p>
                <p className="text-xl font-bold text-blue-600">{grossYield.toFixed(1)}%</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">ROI</p>
                <p className="text-xl font-bold text-purple-600">{roi.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSave(inputs, outputs)}
            className="mt-6 inline-flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save size={16} /> Save BTL Analysis
          </button>
        </div>
      </div>
    </div>
  )
}

function calcStampDuty(price: number): number {
  // UK SDLT additional property rates (2024/25 simplified)
  if (price <= 250000) return Math.round(price * 0.03)
  if (price <= 925000) return Math.round(7500 + (price - 250000) * 0.08)
  if (price <= 1500000) return Math.round(7500 + 54000 + (price - 925000) * 0.13)
  return Math.round(7500 + 54000 + 74750 + (price - 1500000) * 0.15)
}
