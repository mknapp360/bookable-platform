import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Search, ArrowRight, ExternalLink, Loader2, Pencil } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatPrice, SOURCING_STRATEGIES } from './types'
import type { Property } from './types'

const TENANT_ID = '51ed5edf-0482-4558-934e-3a73617d56f1'

const DEFAULT_STRATEGIES = [
  'reduced-properties',
  'repossessed-properties',
  'cheap-per-square-foot',
  'unmodernised-properties',
]

interface DealCalc {
  type: 'BTL' | 'BRR' | 'HMO' | 'SA'
  grossYield: number
  netCashflow: number
  roi: number
}

interface ScoredProperty extends Property {
  score: number
  scoreBreakdown: string
  bestDeal: DealCalc
  allDeals: DealCalc[]
}

// Estimate monthly rent from price and bedrooms using UK averages
function estimateRent(price: number, beds: number): number {
  // Rough UK rental yield by beds: 1-bed ~5.5%, 2-bed ~5%, 3-bed ~4.5%, 4+ ~4%
  const yieldPct = beds <= 1 ? 5.5 : beds === 2 ? 5.0 : beds === 3 ? 4.5 : 4.0
  return Math.round((price * (yieldPct / 100)) / 12)
}

function calcBTL(price: number, beds: number): DealCalc {
  const rent = estimateRent(price, beds)
  const deposit = price * 0.25
  const mortgageAmt = price - deposit
  const monthlyRate = 0.055 / 12
  const mortgagePayment = mortgageAmt * (monthlyRate * Math.pow(1 + monthlyRate, 300)) / (Math.pow(1 + monthlyRate, 300) - 1)
  const managementFee = rent * 0.10
  const expenses = mortgagePayment + managementFee + 100 + 50 // maintenance + insurance
  const netCashflow = rent - expenses
  const grossYield = (rent * 12) / price * 100
  const roi = deposit > 0 ? (netCashflow * 12) / deposit * 100 : 0
  return { type: 'BTL', grossYield: round(grossYield), netCashflow: Math.round(netCashflow), roi: round(roi) }
}

function calcBRR(price: number, beds: number): DealCalc {
  const rent = estimateRent(price, beds)
  const refurb = beds <= 2 ? 15000 : beds === 3 ? 20000 : 30000
  const gdv = Math.round(price * 1.25) // assume 25% uplift after refurb
  const refinanceValue = gdv * 0.75
  const moneyLeftIn = (price + refurb) - refinanceValue
  const monthlyRate = 0.055 / 12
  const mortgagePayment = refinanceValue * (monthlyRate * Math.pow(1 + monthlyRate, 300)) / (Math.pow(1 + monthlyRate, 300) - 1)
  const netCashflow = rent - mortgagePayment
  const grossYield = (rent * 12) / gdv * 100
  const roi = moneyLeftIn > 0 ? (netCashflow * 12) / moneyLeftIn * 100 : (netCashflow > 0 ? 999 : 0)
  return { type: 'BRR', grossYield: round(grossYield), netCashflow: Math.round(netCashflow), roi: round(roi) }
}

function calcHMO(price: number, beds: number): DealCalc {
  const rooms = Math.max(beds, 3) // at least 3 rooms for HMO
  const roomRent = 550 // conservative UK average room rent
  const grossMonthly = rooms * roomRent
  const deposit = price * 0.25
  const mortgageAmt = price - deposit
  const monthlyRate = 0.055 / 12
  const mortgagePayment = mortgageAmt * (monthlyRate * Math.pow(1 + monthlyRate, 300)) / (Math.pow(1 + monthlyRate, 300) - 1)
  const bills = rooms * 100
  const managementFee = grossMonthly * 0.12
  const conversionCost = 25000
  const netCashflow = grossMonthly - mortgagePayment - bills - managementFee
  const grossYield = (grossMonthly * 12) / price * 100
  const cashInvested = deposit + conversionCost + 1000 // + licensing
  const roi = cashInvested > 0 ? (netCashflow * 12) / cashInvested * 100 : 0
  return { type: 'HMO', grossYield: round(grossYield), netCashflow: Math.round(netCashflow), roi: round(roi) }
}

function calcSA(price: number, beds: number): DealCalc {
  const nightlyRate = beds <= 1 ? 80 : beds === 2 ? 110 : beds === 3 ? 140 : 170
  const occupancy = 0.65
  const daysPerMonth = 30
  const occupiedNights = daysPerMonth * occupancy
  const avgStay = 3
  const turnovers = occupiedNights / avgStay

  const grossRevenue = occupiedNights * nightlyRate
  const platformFee = grossRevenue * 0.03
  const cleaning = turnovers * 45
  const utilities = 200
  const insurance = 80
  const refurb = 15000

  const deposit = price * 0.25
  const mortgageAmt = price - deposit
  const monthlyRate = 0.055 / 12
  const mortgagePayment = mortgageAmt * (monthlyRate * Math.pow(1 + monthlyRate, 300)) / (Math.pow(1 + monthlyRate, 300) - 1)

  const netCashflow = grossRevenue - platformFee - cleaning - utilities - insurance - mortgagePayment
  const grossYield = (grossRevenue * 12) / price * 100
  const cashInvested = deposit + refurb
  const roi = cashInvested > 0 ? (netCashflow * 12) / cashInvested * 100 : 0
  return { type: 'SA', grossYield: round(grossYield), netCashflow: Math.round(netCashflow), roi: round(roi) }
}

function round(n: number): number {
  return Math.round(n * 10) / 10
}

function scoreProperty(p: Property): ScoredProperty {
  const price = p.price ?? 0
  const beds = p.bedrooms ?? 2
  if (price <= 0) {
    return { ...p, score: 0, scoreBreakdown: 'No price data', bestDeal: { type: 'BTL', grossYield: 0, netCashflow: 0, roi: 0 }, allDeals: [] }
  }

  const isFlat = (p.property_type ?? '').toLowerCase().includes('flat')
  const hmoEligible = !isFlat && beds >= 3

  // Sophie's priority: HMO and SA first, BTL/BRR as fallback
  const deals: DealCalc[] = [calcSA(price, beds)]
  if (hmoEligible) deals.push(calcHMO(price, beds))
  deals.push(calcBTL(price, beds), calcBRR(price, beds))

  // Best deal = highest ROI
  const bestDeal = deals.reduce((a, b) => a.roi > b.roi ? a : b)

  // Score: base from best ROI, bonuses from property signals
  let score = 0

  // ROI component (0-60 points)
  if (bestDeal.roi >= 20) score += 60
  else if (bestDeal.roi >= 15) score += 50
  else if (bestDeal.roi >= 10) score += 40
  else if (bestDeal.roi >= 5) score += 30
  else if (bestDeal.roi > 0) score += 20
  else score += 5

  // Positive cashflow bonus (0-15)
  if (bestDeal.netCashflow >= 500) score += 15
  else if (bestDeal.netCashflow >= 200) score += 10
  else if (bestDeal.netCashflow > 0) score += 5

  // Yield bonus (0-10)
  if (bestDeal.grossYield >= 8) score += 10
  else if (bestDeal.grossYield >= 6) score += 7
  else if (bestDeal.grossYield >= 5) score += 4

  // Property signal bonuses (0-15)
  if (p.price_reduced) score += 5
  if (p.back_on_market) score += 3
  if ((p.days_listed ?? 0) >= 90) score += 4
  if (p.strategy === 'repossessed-properties') score += 3

  const breakdown = `${bestDeal.type} ${bestDeal.roi > 0 ? '+' : ''}${bestDeal.roi}% ROI · £${bestDeal.netCashflow}/mo · ${bestDeal.grossYield}% yield`

  return {
    ...p,
    score: Math.min(score, 100),
    scoreBreakdown: breakdown,
    bestDeal,
    allDeals: deals,
  }
}

export function BestDealsPage() {
  const navigate = useNavigate()
  const [postcodes, setPostcodes] = useState(['', '', '', '', ''])
  const [sweeping, setSweeping] = useState(false)
  const [progress, setProgress] = useState('')
  const [results, setResults] = useState<ScoredProperty[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load existing properties on mount, scored and ranked
  useEffect(() => {
    supabase
      .from('properties')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const scored = (data as Property[]).map(scoreProperty)
          scored.sort((a, b) => b.score - a.score)
          setResults(scored.slice(0, 20))
        }
      })
  }, [])

  const [editingBeds, setEditingBeds] = useState<string | null>(null)

  const updateBedrooms = async (propertyId: string, newBeds: number) => {
    await supabase.from('properties').update({ bedrooms: newBeds }).eq('id', propertyId)
    setResults(prev => {
      const updated = prev.map(p => {
        if (p.id !== propertyId) return p
        const patched = { ...p, bedrooms: newBeds }
        return scoreProperty(patched)
      })
      updated.sort((a, b) => b.score - a.score)
      return updated
    })
    setEditingBeds(null)
  }

  const updatePostcode = (i: number, val: string) => {
    setPostcodes(prev => {
      const next = [...prev]
      next[i] = val.toUpperCase()
      return next
    })
  }

  const handleSweep = async (e: React.FormEvent) => {
    e.preventDefault()
    const activePostcodes = postcodes.filter(p => p.trim())
    if (activePostcodes.length === 0) return

    setSweeping(true)
    setError(null)
    setResults([])

    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

      const allProperties: Property[] = []

      for (const postcode of activePostcodes) {
        for (const strategy of DEFAULT_STRATEGIES) {
          setProgress(`Scanning ${postcode} — ${SOURCING_STRATEGIES.find(s => s.value === strategy)?.label ?? strategy}...`)

          try {
            const res = await fetch(`${supabaseUrl}/functions/v1/source-properties`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                tenant_id: TENANT_ID,
                postcode: postcode.trim(),
                list: strategy,
                radius: 15,
                results: 20,
                exclude_sstc: true,
              }),
            })

            if (res.ok) {
              const data = await res.json()
              // Fetch the newly saved properties
              const { data: props } = await supabase
                .from('properties')
                .select('*')
                .eq('tenant_id', TENANT_ID)
                .eq('strategy', strategy)
                .ilike('postcode', `${postcode.trim().split(' ')[0]}%`)
                .order('created_at', { ascending: false })
                .limit(20)

              if (props) allProperties.push(...(props as Property[]))
            }
          } catch {
            // Continue with next strategy/postcode
          }
        }
      }

      // Deduplicate by address
      const seen = new Set<string>()
      const unique = allProperties.filter(p => {
        const key = `${p.address}-${p.price}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      // Score and rank
      const scored = unique.map(scoreProperty)
      scored.sort((a, b) => b.score - a.score)

      setResults(scored.slice(0, 20))
      setProgress('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSweeping(false)
      setProgress('')
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-1">
        <Trophy size={24} className="text-amber-500" />
        <h1 className="text-2xl font-bold text-gray-900">Best Deals</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Sweep multiple postcodes across top strategies and surface the best-scored opportunities.
      </p>

      {/* Postcode inputs */}
      <form onSubmit={handleSweep} className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <label className="block text-xs font-medium text-gray-600 mb-3">Target Postcodes (up to 5)</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {postcodes.map((pc, i) => (
            <input
              key={i}
              type="text"
              value={pc}
              onChange={e => updatePostcode(i, e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-center font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder={['BN1', 'TN34', 'M1', 'LS1', 'BS1'][i]}
            />
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-4">
          Sweeps each postcode across 4 strategies: Price Reduced, Repossessed, Cheap/sqft, Needs Modernisation (15mi radius).
        </p>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={sweeping || postcodes.every(p => !p.trim())}
            className="inline-flex items-center gap-2 bg-amber-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-amber-600 disabled:opacity-60 transition-colors"
          >
            {sweeping ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {sweeping ? 'Sweeping...' : 'Find Best Deals'}
          </button>

          {progress && <p className="text-sm text-gray-500">{progress}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            <h2 className="font-semibold text-gray-900">Top {results.length} Deals</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-3 font-medium text-gray-600 w-8">#</th>
                  <th className="px-3 py-3 font-medium text-gray-600">Property</th>
                  <th className="px-3 py-3 font-medium text-gray-600">Price</th>
                  <th className="px-3 py-3 font-medium text-gray-600">Best</th>
                  <th className="px-3 py-3 font-medium text-gray-600">Yield</th>
                  <th className="px-3 py-3 font-medium text-gray-600">Cashflow/mo</th>
                  <th className="px-3 py-3 font-medium text-gray-600">ROI</th>
                  <th className="px-3 py-3 font-medium text-gray-600">Score</th>
                  <th className="px-3 py-3 font-medium text-gray-600">Strategy</th>
                  <th className="px-3 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((p, i) => {
                  const d = p.bestDeal
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-gray-400 font-mono">{i + 1}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] && (
                            <img src={p.images[0]} alt="" className="w-12 h-9 rounded object-cover shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[200px]">{p.address}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              {p.postcode} ·{' '}
                              {editingBeds === p.id ? (
                                <select
                                  autoFocus
                                  defaultValue={p.bedrooms ?? 2}
                                  onChange={e => updateBedrooms(p.id, Number(e.target.value))}
                                  onBlur={() => setEditingBeds(null)}
                                  className="w-12 px-1 py-0 border border-blue-400 rounded text-[11px] bg-white"
                                >
                                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                  ))}
                                </select>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingBeds(p.id) }}
                                  className="inline-flex items-center gap-0.5 hover:text-blue-600 transition-colors"
                                  title="Click to edit bedrooms"
                                >
                                  {p.bedrooms ?? '?'} bed <Pencil size={8} />
                                </button>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-medium">{formatPrice(p.price)}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.type === 'SA'  ? 'bg-emerald-100 text-emerald-700' :
                          d.type === 'HMO' ? 'bg-purple-100 text-purple-700' :
                          d.type === 'BRR' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {d.type}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`font-medium ${d.grossYield >= 6 ? 'text-green-600' : d.grossYield >= 4 ? 'text-gray-900' : 'text-red-500'}`}>
                          {d.grossYield}%
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`font-medium ${d.netCashflow >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          £{d.netCashflow.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`font-bold ${d.roi >= 10 ? 'text-green-600' : d.roi >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                          {d.roi > 900 ? '∞' : `${d.roi}%`}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                p.score >= 70 ? 'bg-green-500' :
                                p.score >= 50 ? 'bg-amber-500' : 'bg-gray-400'
                              }`}
                              style={{ width: `${p.score}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-gray-500">{p.score}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-gray-100 text-gray-500">
                          {SOURCING_STRATEGIES.find(s => s.value === p.strategy)?.label ?? p.strategy}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/property-analysis/${p.id}`)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                          >
                            Analyse <ArrowRight size={12} />
                          </button>
                          {p.listing_url && (
                            <a href={p.listing_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
