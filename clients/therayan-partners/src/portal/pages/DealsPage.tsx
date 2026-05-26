import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Handshake } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface DealProperty {
  id: string
  address: string
  postcode: string | null
  price: number | null
  bedrooms: number | null
  property_type: string | null
  images: string[]
  status: string
}

export function DealsPage() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState<DealProperty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('properties')
      .select('id, address, postcode, price, bedrooms, property_type, images, status')
      .in('status', ['sent_to_investor', 'completed'])
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProperties((data ?? []) as DealProperty[])
        setLoading(false)
      })
  }, [])

  const fmt = (n: number | null) => n ? `£${n.toLocaleString('en-GB')}` : '—'

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Available Deals</h1>
      <p className="text-sm text-gray-500 mb-8">Browse curated property investment opportunities.</p>

      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Handshake size={28} className="text-slate-400" />
          </div>
          <p className="text-gray-500 text-sm">No deals available right now.</p>
          <p className="text-gray-400 text-xs mt-1">Check back soon for new opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => (
            <div
              key={p.id}
              onClick={() => navigate(`/deals/${p.id}`)}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-gray-300 hover:shadow-md transition-all"
            >
              {p.images?.[0] ? (
                <img src={p.images[0]} alt="" className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                  <Handshake size={32} className="text-gray-300" />
                </div>
              )}
              <div className="p-4">
                <p className="font-semibold text-gray-900 truncate">{p.address}</p>
                {p.postcode && <p className="text-xs text-gray-400 mt-0.5">{p.postcode}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-gray-900">{fmt(p.price)}</span>
                  <div className="flex gap-2 text-xs text-gray-500">
                    {p.bedrooms && <span>{p.bedrooms} bed</span>}
                    {p.property_type && <span className="capitalize">{p.property_type}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
