import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useDealAnalysis } from './hooks/useDealAnalysis'
import { formatPrice } from './types'
import type { Property } from './types'
import { BTLCalculator } from './calculators/BTLCalculator'
import { BRRCalculator } from './calculators/BRRCalculator'
import { HMOCalculator } from './calculators/HMOCalculator'

const TENANT_ID = '51ed5edf-0482-4558-934e-3a73617d56f1'

export function DealAnalysisPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()
  const { analyses, saveAnalysis, refetch } = useDealAnalysis(propertyId)

  const [property, setProperty] = useState<Property | null>(null)
  const [analysing, setAnalysing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<Record<string, unknown> | null>(null)
  const [comps, setComps] = useState<unknown[]>([])
  const [tab, setTab] = useState<'btl' | 'brr' | 'hmo'>('btl')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!propertyId) return
    supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()
      .then(({ data }) => {
        if (data) setProperty(data as Property)
      })
  }, [propertyId])

  // Load existing analysis data if available
  useEffect(() => {
    if (analyses.length > 0) {
      const best = analyses[0]
      setAnalysisResult(best.outputs as Record<string, unknown>)
      setComps(best.propertydata_comps ?? [])
    }
  }, [analyses])

  const handleFetchComps = async () => {
    setAnalysing(true)
    setError(null)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

      const res = await fetch(`${supabaseUrl}/functions/v1/analyze-property`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ property_id: propertyId, tenant_id: TENANT_ID }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')

      setAnalysisResult(data.analysis)
      setComps(data.comps ?? [])
      refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setAnalysing(false)
    }
  }

  if (!property) {
    return <div className="p-8 text-sm text-gray-400">Loading property...</div>
  }

  return (
    <div className="p-8">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-start gap-4 mb-8">
        {property.images?.[0] && (
          <img src={property.images[0]} alt="" className="w-24 h-18 rounded-lg object-cover shrink-0" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{property.address}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span>{formatPrice(property.price)}</span>
            {property.bedrooms && <span>{property.bedrooms} bed</span>}
            {property.property_type && <span className="capitalize">{property.property_type}</span>}
            {property.postcode && <span>{property.postcode}</span>}
          </div>
        </div>
      </div>

      {/* PropertyData analysis */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Market Analysis</h2>
          <button
            onClick={handleFetchComps}
            disabled={analysing}
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {analysing ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
            {analysing ? 'Analysing...' : 'Fetch Market Data'}
          </button>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        {analysisResult ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Gross Yield', value: analysisResult.gross_yield ? `${analysisResult.gross_yield}%` : '—' },
              { label: 'Avg Rent/mo', value: analysisResult.avg_monthly_rent ? `£${Number(analysisResult.avg_monthly_rent).toLocaleString()}` : '—' },
              { label: 'Avg £/sqft', value: analysisResult.avg_price_per_sqft ? `£${Number(analysisResult.avg_price_per_sqft).toLocaleString()}` : '—' },
              { label: 'Est. Value', value: analysisResult.estimated_value ? formatPrice(Number(analysisResult.estimated_value)) : '—' },
              { label: '1yr Growth', value: analysisResult.growth_1y ? `${analysisResult.growth_1y}%` : '—' },
              { label: 'HMO Demand', value: analysisResult.hmo_demand ?? '—' },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                <p className="text-lg font-bold text-gray-900">{String(m.value)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Click "Fetch Market Data" to analyse this property's postcode.</p>
        )}

        {/* Comparable sales */}
        {comps.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Comparable Sales (last 12 months, 0.25mi)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-3 py-2 font-medium text-gray-600">Address</th>
                    <th className="px-3 py-2 font-medium text-gray-600">Price</th>
                    <th className="px-3 py-2 font-medium text-gray-600">Date</th>
                    <th className="px-3 py-2 font-medium text-gray-600">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(comps as Record<string, unknown>[]).slice(0, 10).map((c, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{String(c.address ?? c.full_address ?? '—')}</td>
                      <td className="px-3 py-2 font-medium">{formatPrice(Number(c.price ?? c.amount ?? 0))}</td>
                      <td className="px-3 py-2 text-gray-500">{String(c.date ?? c.deed_date ?? '—')}</td>
                      <td className="px-3 py-2 text-gray-500 capitalize">{String(c.type ?? c.property_type ?? '—')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Deal calculators */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(['btl', 'brr', 'hmo'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-4 py-3 text-sm font-medium uppercase transition-colors ${
                tab === t
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'bg-gray-50 text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab === 'btl' && (
            <BTLCalculator
              property={property}
              analysis={analysisResult}
              onSave={(inputs, outputs) => saveAnalysis({
                property_id: property.id,
                tenant_id: TENANT_ID,
                deal_type: 'btl',
                inputs,
                outputs,
                propertydata_comps: comps,
                notes: null,
              })}
            />
          )}
          {tab === 'brr' && (
            <BRRCalculator
              property={property}
              analysis={analysisResult}
              onSave={(inputs, outputs) => saveAnalysis({
                property_id: property.id,
                tenant_id: TENANT_ID,
                deal_type: 'brr',
                inputs,
                outputs,
                propertydata_comps: comps,
                notes: null,
              })}
            />
          )}
          {tab === 'hmo' && (
            <HMOCalculator
              property={property}
              analysis={analysisResult}
              onSave={(inputs, outputs) => saveAnalysis({
                property_id: property.id,
                tenant_id: TENANT_ID,
                deal_type: 'hmo',
                inputs,
                outputs,
                propertydata_comps: comps,
                notes: null,
              })}
            />
          )}
        </div>
      </div>
    </div>
  )
}
