import { useState } from 'react'
import { Save } from 'lucide-react'
import type { Property } from '../types'

interface Props {
  property: Property
  analysis: Record<string, unknown> | null
  onSave: (inputs: Record<string, number>, outputs: Record<string, number | null>) => void
}

export function HMOCalculator({ property, analysis }: Props & { onSave: (inputs: Record<string, number>, outputs: Record<string, number | null>) => void }) {
  const defaultRoomRent = Number(analysis?.hmo_room_rent ?? 600)

  const [inputs, setInputs] = useState({
    purchase_price: property.price ?? 0,
    conversion_cost: 30000,
    num_rooms: 5,
    rent_per_room: defaultRoomRent,
    licensing_cost: 1000,
    bills_per_room: 100,
    management_fee_pct: 12,
    mortgage_rate: 5.5,
    deposit_pct: 25,
  })

  const set = (key: string, val: string) =>
    setInputs(prev => ({ ...prev, [key]: Number(val) || 0 }))

  // Calculations
  const totalInvestment = inputs.purchase_price + inputs.conversion_cost + inputs.licensing_cost
  const deposit = inputs.purchase_price * (inputs.deposit_pct / 100)
  const mortgageAmount = inputs.purchase_price - deposit
  const monthlyRate = inputs.mortgage_rate / 100 / 12
  const mortgagePayment = monthlyRate > 0
    ? mortgageAmount * (monthlyRate * Math.pow(1 + monthlyRate, 300)) /
      (Math.pow(1 + monthlyRate, 300) - 1)
    : 0
  const grossMonthly = inputs.num_rooms * inputs.rent_per_room
  const totalBills = inputs.num_rooms * inputs.bills_per_room
  const managementFee = grossMonthly * (inputs.management_fee_pct / 100)
  const netMonthly = grossMonthly - mortgagePayment - totalBills - managementFee
  const grossYield = inputs.purchase_price > 0
    ? ((grossMonthly * 12) / inputs.purchase_price) * 100 : 0
  const cashInvested = deposit + inputs.conversion_cost + inputs.licensing_cost
  const roi = cashInvested > 0
    ? ((netMonthly * 12) / cashInvested) * 100 : 0

  const outputs = {
    total_investment: totalInvestment,
    deposit,
    gross_monthly: grossMonthly,
    mortgage_payment: Math.round(mortgagePayment),
    total_bills: totalBills,
    management_fee: Math.round(managementFee),
    net_monthly: Math.round(netMonthly),
    gross_yield: Number(grossYield.toFixed(2)),
    roi: Number(roi.toFixed(2)),
  }

  const { onSave } = arguments[0] as Props

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
            { key: 'conversion_cost', label: 'Conversion Cost (£)' },
            { key: 'licensing_cost', label: 'Licensing Cost (£)' },
            { key: 'num_rooms', label: 'Number of Rooms' },
            { key: 'rent_per_room', label: 'Rent per Room (£/mo)' },
            { key: 'bills_per_room', label: 'Bills per Room (£/mo)' },
            { key: 'management_fee_pct', label: 'Management Fee (%)' },
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
              { label: 'Gross Monthly Income', value: `£${grossMonthly.toLocaleString()}` },
              { label: 'Monthly Mortgage', value: `£${Math.round(mortgagePayment).toLocaleString()}` },
              { label: 'Monthly Bills', value: `£${totalBills.toLocaleString()}` },
              { label: 'Management Fee', value: `£${Math.round(managementFee).toLocaleString()}` },
              { label: 'Cash Invested', value: `£${cashInvested.toLocaleString()}` },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{r.label}</span>
                <span className="text-sm font-medium">{r.value}</span>
              </div>
            ))}

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className={`rounded-lg p-4 text-center ${netMonthly >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-xs text-gray-500 mb-1">Net Monthly</p>
                <p className={`text-xl font-bold ${netMonthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{Math.round(netMonthly).toLocaleString()}
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
            <Save size={16} /> Save HMO Analysis
          </button>
        </div>
      </div>
    </div>
  )
}
