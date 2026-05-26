import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface DealProperty {
  id: string
  address: string
  postcode: string | null
  price: number | null
  bedrooms: number | null
  property_type: string | null
  description: string | null
  images: string[]
}

interface DealPkg {
  opportunity_summary: string | null
  pdf_url: string | null
}

interface Analysis {
  deal_type: string
  outputs: Record<string, unknown>
}

export function DealDetailPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()
  const [property, setProperty] = useState<DealProperty | null>(null)
  const [pkg, setPkg] = useState<DealPkg | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)

  useEffect(() => {
    if (!propertyId) return

    supabase
      .from('properties')
      .select('id, address, postcode, price, bedrooms, property_type, description, images')
      .eq('id', propertyId)
      .single()
      .then(({ data }) => { if (data) setProperty(data as DealProperty) })

    supabase
      .from('deal_packages')
      .select('opportunity_summary, pdf_url')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setPkg(data as DealPkg) })

    supabase
      .from('deal_analysis')
      .select('deal_type, outputs')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setAnalysis(data as Analysis) })
  }, [propertyId])

  const fmt = (n: unknown) => n != null ? `£${Number(n).toLocaleString('en-GB')}` : '—'

  if (!property) return <div className="p-8 text-sm text-gray-400">Loading...</div>

  const outputs = analysis?.outputs ?? {}

  return (
    <div className="p-8 max-w-3xl">
      <button
        onClick={() => navigate('/deals')}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={16} /> Back to deals
      </button>

      {/* Photos */}
      {property.images?.length > 0 && (
        <img
          src={property.images[0]}
          alt=""
          className="w-full h-64 object-cover rounded-xl mb-6"
        />
      )}

      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900">{property.address}</h1>
      <p className="text-sm text-gray-500 mt-1">
        {[property.postcode, property.property_type, property.bedrooms ? `${property.bedrooms} bedrooms` : null]
          .filter(Boolean).join(' · ')}
      </p>
      <p className="text-3xl font-bold text-gray-900 mt-4">{fmt(property.price)}</p>

      {/* Key metrics */}
      {analysis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Deal Type', value: analysis.deal_type.toUpperCase() },
            { label: 'Gross Yield', value: outputs.gross_yield ? `${outputs.gross_yield}%` : '—' },
            { label: 'Avg Rent/mo', value: fmt(outputs.avg_monthly_rent) },
            { label: 'Est. Value', value: fmt(outputs.estimated_value) },
          ].map(m => (
            <div key={m.label} className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">{m.label}</p>
              <p className="text-lg font-bold text-gray-900">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Opportunity summary */}
      {pkg?.opportunity_summary && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">The Opportunity</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{pkg.opportunity_summary}</p>
        </div>
      )}

      {/* Description */}
      {property.description && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Property Description</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
        </div>
      )}

      {/* PDF download */}
      {pkg?.pdf_url && (
        <div className="mt-8">
          <a
            href={pkg.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Download size={16} /> Download Deal Brochure (PDF)
          </a>
        </div>
      )}
    </div>
  )
}
