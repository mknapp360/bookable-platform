import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingDown, RotateCcw, Clock, ExternalLink, ArrowRight, MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useProperties } from './hooks/useProperties'
import { formatPrice, SOURCING_STRATEGIES } from './types'
import type { Property } from './types'

const TENANT_ID = '51ed5edf-0482-4558-934e-3a73617d56f1'

export function PropertySearchPage() {
  const navigate = useNavigate()
  const { properties, loading, refetch, updateStatus } = useProperties()

  const [form, setForm] = useState({
    postcode: '',
    list: 'below-market-value',
    radius: '20',
    results: '50',
    property_type: '',
    exclude_sstc: true,
  })
  const [sourcing, setSourcing] = useState(false)
  const [result, setResult] = useState<{ total: number; upserted: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSource = async (e: React.FormEvent) => {
    e.preventDefault()
    setSourcing(true)
    setError(null)
    setResult(null)

    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

      const res = await fetch(`${supabaseUrl}/functions/v1/source-properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenant_id: TENANT_ID,
          postcode: form.postcode,
          list: form.list,
          radius: Number(form.radius),
          results: Number(form.results),
          standardised_type: form.property_type || undefined,
          exclude_sstc: form.exclude_sstc,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sourcing failed')

      setResult({ total: data.total, upserted: data.upserted })
      refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSourcing(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Property Search</h1>
      <p className="text-sm text-gray-500 mb-8">
        Source investment properties by strategy and location via PropertyData.
      </p>

      {/* Search form */}
      <form onSubmit={handleSource} className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Postcode / Area</label>
            <input
              type="text"
              required
              value={form.postcode}
              onChange={e => setForm(f => ({ ...f, postcode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="e.g. BN1, TN34 1AA, RH1"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Strategy</label>
            <select
              value={form.list}
              onChange={e => setForm(f => ({ ...f, list: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {SOURCING_STRATEGIES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Radius (miles)</label>
            <select
              value={form.radius}
              onChange={e => setForm(f => ({ ...f, radius: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {[1, 5, 10, 15, 20, 30, 40].map(r => (
                <option key={r} value={r}>{r} miles</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Property Type</label>
            <select
              value={form.property_type}
              onChange={e => setForm(f => ({ ...f, property_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="">All types</option>
              <option value="Flat">Flat</option>
              <option value="Terraced house">Terraced</option>
              <option value="Semi-detached house">Semi-Detached</option>
              <option value="Detached house">Detached</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Results</label>
            <input
              type="number"
              value={form.results}
              onChange={e => setForm(f => ({ ...f, results: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              min={10}
              max={500}
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-gray-600 pb-2">
              <input
                type="checkbox"
                checked={form.exclude_sstc}
                onChange={e => setForm(f => ({ ...f, exclude_sstc: e.target.checked }))}
                className="rounded border-gray-300"
              />
              Exclude SSTC
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={sourcing}
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            <Search size={16} />
            {sourcing ? 'Sourcing...' : 'Source Properties'}
          </button>

          {result && (
            <p className="text-sm text-green-600">
              Found {result.total} properties, {result.upserted} saved.
            </p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </form>

      {/* Results table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            Saved Properties ({properties.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
        ) : properties.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No properties yet. Run a search to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Address</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Price</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Beds</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Dist.</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Flags</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Strategy</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {properties.map((p: Property) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt="" className="w-12 h-9 rounded object-cover shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[250px]">{p.address}</p>
                          {p.postcode && <p className="text-xs text-gray-400">{p.postcode}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">{p.bedrooms ?? '—'}</td>
                    <td className="px-4 py-3 capitalize text-xs">{p.property_type ?? '—'}</td>
                    <td className="px-4 py-3 text-xs">
                      {p.distance != null ? (
                        <span className="inline-flex items-center gap-0.5 text-gray-500">
                          <MapPin size={10} /> {p.distance.toFixed(1)}mi
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {p.price_reduced && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600">
                            <TrendingDown size={10} /> Reduced
                          </span>
                        )}
                        {p.back_on_market && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-600">
                            <RotateCcw size={10} /> Back
                          </span>
                        )}
                        {(p.days_listed ?? 0) >= 90 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-600">
                            <Clock size={10} /> {p.days_listed}d
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.strategy && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">
                          {SOURCING_STRATEGIES.find(s => s.value === p.strategy)?.label ?? p.strategy}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/property-analysis/${p.id}`)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          Analyse <ArrowRight size={12} />
                        </button>
                        {p.status === 'sourced' && (
                          <button
                            onClick={() => updateStatus(p.id, 'under_review')}
                            className="text-xs font-medium text-green-600 hover:text-green-800"
                          >
                            + Pipeline
                          </button>
                        )}
                        {p.listing_url && (
                          <a href={p.listing_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
