import { useState } from 'react'
import { Save } from 'lucide-react'
import type { Property } from '../types'

interface Props {
  property: Property
  analysis: Record<string, unknown> | null
  onSave: (inputs: Record<string, number>, outputs: Record<string, number | null>) => void
}

export function SACalculator({ property, onSave }: Props) {
  const [inputs, setInputs] = useState({
    purchase_price: property.price ?? 0,
    refurb_cost: 15000,
    nightly_rate: 120,
    occupancy_pct: 65,
    platform_fee_pct: 3,
    cleaning_per_turnover: 45,
    avg_stay_nights: 3,
    monthly_utilities: 200,
    monthly_insurance: 80,
    management_fee_pct: 0,
    mortgage_rate: 5.5,
    deposit_pct: 25,
  })

  const set = (key: string, val: string) =>
    setInputs(prev => ({ ...prev, [key]: Number(val) || 0 }))

  // Calculations
  const daysPerMonth = 30
  const occupiedNights = daysPerMonth * (inputs.occupancy_pct / 100)
  const turnoversPerMonth = occupiedNights / inputs.avg_stay_nights

  const grossMonthlyRevenue = occupiedNights * inputs.nightly_rate
  const platformFee = grossMonthlyRevenue * (inputs.platform_fee_pct / 100)
  const cleaningCost = turnoversPerMonth * inputs.cleaning_per_turnover
  const managementFee = grossMonthlyRevenue * (inputs.management_fee_pct / 100)

  const deposit = inputs.purchase_price * (inputs.deposit_pct / 100)
  const mortgageAmt = inputs.purchase_price - deposit
  const monthlyRate = inputs.mortgage_rate / 100 / 12
  const mortgagePayment = monthlyRate > 0
    ? mortgageAmt * (monthlyRate * Math.pow(1 + monthlyRate, 300)) /
      (Math.pow(1 + monthlyRate, 300) - 1)
    : 0

  const totalMonthlyExpenses = platformFee + cleaningCost + managementFee +
    inputs.monthly_utilities + inputs.monthly_insurance + mortgagePayment

  const netMonthlyCashflow = grossMonthlyRevenue - totalMonthlyExpenses
  const totalCashInvested = deposit + inputs.refurb_cost
  const annualROI = totalCashInvested > 0
    ? ((netMonthlyCashflow * 12) / totalCashInvested) * 100 : 0

  // Break-even occupancy: find occupancy % where net cashflow = 0
  // Revenue at break-even = fixed costs / (nightly_rate - variable_per_night)
  const fixedMonthlyCosts = inputs.monthly_utilities + inputs.monthly_insurance + mortgagePayment
  const revenuePerNight = inputs.nightly_rate * (1 - inputs.platform_fee_pct / 100) -
    (inputs.cleaning_per_turnover / inputs.avg_stay_nights)
  const breakEvenNights = revenuePerNight > 0 ? fixedMonthlyCosts / revenuePerNight : daysPerMonth
  const breakEvenOccupancy = Math.min((breakEvenNights / daysPerMonth) * 100, 100)

  const outputs = {
    gross_monthly_revenue: Math.round(grossMonthlyRevenue),
    platform_fee: Math.round(platformFee),
    cleaning_cost: Math.round(cleaningCost),
    mortgage_payment: Math.round(mortgagePayment),
    total_expenses: Math.round(totalMonthlyExpenses),
    net_cashflow: Math.round(netMonthlyCashflow),
    annual_roi: Number(annualROI.toFixed(2)),
    break_even_occupancy: Number(breakEvenOccupancy.toFixed(1)),
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
            { key: 'refurb_cost', label: 'Refurb / Setup Cost (£)' },
            { key: 'nightly_rate', label: 'Nightly Rate (£)' },
            { key: 'occupancy_pct', label: 'Occupancy Rate (%)' },
            { key: 'avg_stay_nights', label: 'Avg Stay Length (nights)' },
            { key: 'platform_fee_pct', label: 'Platform Fee - Airbnb (%)' },
            { key: 'cleaning_per_turnover', label: 'Cleaning per Turnover (£)' },
            { key: 'monthly_utilities', label: 'Utilities (£/mo)' },
            { key: 'monthly_insurance', label: 'Insurance (£/mo)' },
            { key: 'management_fee_pct', label: 'Management Fee (%)' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <label className="text-sm text-gray-600 w-52 shrink-0">{label}</label>
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
              { label: 'Occupied Nights/mo', value: `${occupiedNights.toFixed(0)} nights` },
              { label: 'Turnovers/mo', value: turnoversPerMonth.toFixed(1) },
              { label: 'Gross Revenue/mo', value: `£${Math.round(grossMonthlyRevenue).toLocaleString()}` },
              { label: 'Platform Fee', value: `£${Math.round(platformFee).toLocaleString()}` },
              { label: 'Cleaning', value: `£${Math.round(cleaningCost).toLocaleString()}` },
              { label: 'Monthly Mortgage', value: `£${Math.round(mortgagePayment).toLocaleString()}` },
              { label: 'Utilities + Insurance', value: `£${(inputs.monthly_utilities + inputs.monthly_insurance).toLocaleString()}` },
              { label: 'Total Cash Invested', value: `£${totalCashInvested.toLocaleString()}` },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{r.label}</span>
                <span className="text-sm font-medium">{r.value}</span>
              </div>
            ))}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className={`rounded-lg p-4 text-center ${netMonthlyCashflow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-xs text-gray-500 mb-1">Net Cashflow/mo</p>
                <p className={`text-xl font-bold ${netMonthlyCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{Math.round(netMonthlyCashflow).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Annual ROI</p>
                <p className="text-xl font-bold text-purple-600">{annualROI.toFixed(1)}%</p>
              </div>
            </div>

            {/* Break-even indicator */}
            <div className={`mt-4 rounded-lg p-4 ${breakEvenOccupancy <= inputs.occupancy_pct ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className="text-sm font-semibold text-gray-900">Break-even Occupancy</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${breakEvenOccupancy <= 50 ? 'bg-green-500' : breakEvenOccupancy <= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(breakEvenOccupancy, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 w-12 text-right">{breakEvenOccupancy.toFixed(0)}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {breakEvenOccupancy <= inputs.occupancy_pct
                  ? `Profitable at ${inputs.occupancy_pct}% occupancy — ${(inputs.occupancy_pct - breakEvenOccupancy).toFixed(0)}% safety margin`
                  : `Need ${breakEvenOccupancy.toFixed(0)}% occupancy to break even — currently set at ${inputs.occupancy_pct}%`
                }
              </p>
            </div>
          </div>

          <button
            onClick={() => onSave(inputs, outputs)}
            className="mt-6 inline-flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save size={16} /> Save SA Analysis
          </button>
        </div>
      </div>
    </div>
  )
}
