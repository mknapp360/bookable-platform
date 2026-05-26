import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingDown, RotateCcw, Clock, ExternalLink, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useProperties } from './hooks/useProperties'
import { formatPrice } from './types'
import type { Property } from './types'

const TENANT_ID = '51ed5edf-0482-4558-934e-3a73617d56f1'

export function PropertySearchPage() {
  const navigate = useNavigate()
  const { properties, loading, refetch, updateStatus } = useProperties()

  const [form, setForm] = useState({
    location: '',
    max_price: '',
    property_type: '',
    bedrooms: '',
    source: 'rightmove' as 'rightmove' | 'zoopla',
  })
  const [scraping, setScraping] = useState(false)
  const [result, setResult] = useState<{ total: number; upserted: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault()
    setScraping(true)
    setError(null)
    setResult(null)

    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

      const res = await fetch(`${supabaseUrl}/functions/v1/scrape-properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenant_id: TENANT_ID,
          location: form.location,
          max_price: form.max_price ? Number(form.max_price) : undefined,
          property_type: form.property_type || undefined,
          bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
          source: form.source,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scrape failed')

      setResult({ total: data.total, upserted: data.upserted })
      refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setScraping(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Property Search</h1>
      <p className="text-sm text-gray-500 mb-8">Scrape listings from Rightmove and Zoopla.</p>

      {/* Search form */}
      <form onSubmit={handleScrape} className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
            <input
              type="text"
              required
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="e.g. Brighton, BN1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Price</label>
            <input
              type="number"
              value={form.max_price}
              onChange={e => setForm(f => ({ ...f, max_price: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="e.g. 300000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Property Type</label>
            <select
              value={form.property_type}
              onChange={e => setForm(f => ({ ...f, property_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="">Any</option>
              <option value="detached">Detached</option>
              <option value="semi-detached">Semi-Detached</option>
              <option value="terraced">Terraced</option>
              <option value="flat">Flat</option>
              <option value="bungalow">Bungalow</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bedrooms</label>
            <select
              value={form.bedrooms}
              onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(['rightmove', 'zoopla'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, source: s }))}
                  className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
                    form.source === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={scraping}
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            <Search size={16} />
            {scraping ? 'Scraping...' : 'Search Properties'}
          </button>

          {result && (
            <p className="text-sm text-green-600">
              Found {result.total} listings, {result.upserted} saved.
            </p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </form>

      {/* Results table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
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
                  <th className="px-4 py-3 font-medium text-gray-600">Days</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Flags</th>
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
                          <img
                            src={p.images[0]}
                            alt=""
                            className="w-12 h-9 rounded object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[250px]">
                            {p.address}
                          </p>
                          {p.postcode && (
                            <p className="text-xs text-gray-400">{p.postcode}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">{p.bedrooms ?? '—'}</td>
                    <td className="px-4 py-3 capitalize">{p.property_type ?? '—'}</td>
                    <td className="px-4 py-3">{p.days_listed ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {p.price_reduced && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                            <TrendingDown size={12} /> Reduced
                          </span>
                        )}
                        {p.back_on_market && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                            <RotateCcw size={12} /> Back
                          </span>
                        )}
                        {(p.days_listed ?? 0) >= 90 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                            <Clock size={12} /> 90d+
                          </span>
                        )}
                      </div>
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
                          <a
                            href={p.listing_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600"
                          >
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
