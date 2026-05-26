import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileDown, Send, Save } from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import { supabase } from '../../lib/supabase'
import { useProperties } from './hooks/useProperties'
import { useDealAnalysis } from './hooks/useDealAnalysis'
import { useDealPackages } from './hooks/useDealPackages'
import { formatPrice } from './types'
import type { Property } from './types'
import { DealBrochurePDF } from './components/DealBrochurePDF'

export function DealPackagePage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()
  const { updateStatus } = useProperties()
  const { analyses } = useDealAnalysis(propertyId)
  const { packages, savePackage, tenantId } = useDealPackages(propertyId)

  const [property, setProperty] = useState<Property | null>(null)
  const [summary, setSummary] = useState('')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

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

  // Load existing package
  useEffect(() => {
    if (packages.length > 0) {
      setSummary(packages[0].opportunity_summary ?? '')
    }
  }, [packages])

  const bestAnalysis = analyses[0] ?? null
  const existingPackage = packages[0] ?? null

  const handleSave = async () => {
    if (!propertyId) return
    setSaving(true)
    const { data: session } = await supabase.auth.getSession()
    await savePackage({
      property_id: propertyId,
      analysis_id: bestAnalysis?.id ?? null,
      tenant_id: tenantId,
      opportunity_summary: summary,
      pdf_url: existingPackage?.pdf_url ?? null,
      created_by: session?.session?.user?.id ?? null,
    })
    setSaving(false)
  }

  const handleGeneratePDF = async () => {
    if (!property) return
    setGenerating(true)

    try {
      const blob = await pdf(
        <DealBrochurePDF
          property={property}
          analysis={bestAnalysis}
          dealPackage={{ ...existingPackage, opportunity_summary: summary } as any}
        />
      ).toBlob()

      // Upload to Supabase storage
      const fileName = `${propertyId}/${Date.now()}.pdf`
      const { error: uploadErr } = await supabase.storage
        .from('deal-brochures')
        .upload(fileName, blob, { contentType: 'application/pdf', upsert: true })

      if (uploadErr) {
        console.error('Upload error:', uploadErr)
        // Fall back to local download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `deal-brochure-${property.postcode ?? 'property'}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const { data: urlData } = supabase.storage
          .from('deal-brochures')
          .getPublicUrl(fileName)

        // Save URL to deal package
        await savePackage({
          property_id: propertyId!,
          analysis_id: bestAnalysis?.id ?? null,
          tenant_id: tenantId,
          opportunity_summary: summary,
          pdf_url: urlData.publicUrl,
          created_by: null,
        })
      }
    } catch (err) {
      console.error('PDF generation error:', err)
    } finally {
      setGenerating(false)
    }
  }

  const handleSendToInvestors = async () => {
    if (!propertyId) return
    await updateStatus(propertyId, 'sent_to_investor')
    navigate('/deals-pipeline')
  }

  if (!property) {
    return <div className="p-8 text-sm text-gray-400">Loading...</div>
  }

  return (
    <div className="p-8 max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Deal Package</h1>
      <p className="text-sm text-gray-500 mb-8">{property.address}</p>

      {/* Property summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          {property.images?.[0] && (
            <img src={property.images[0]} alt="" className="w-32 h-24 rounded-lg object-cover shrink-0" />
          )}
          <div>
            <p className="font-semibold text-gray-900">{property.address}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatPrice(property.price)} · {property.bedrooms ?? '?'} bed · {property.property_type ?? 'Unknown'}
            </p>
            {bestAnalysis && (
              <p className="text-sm text-blue-600 mt-1">
                {bestAnalysis.deal_type.toUpperCase()} · Yield: {bestAnalysis.outputs.gross_yield ?? '—'}%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Opportunity summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">The Opportunity</h2>
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
          placeholder="Describe the investment opportunity..."
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-60 transition-colors"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save'}
        </button>

        <button
          onClick={handleGeneratePDF}
          disabled={generating}
          className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          <FileDown size={16} /> {generating ? 'Generating...' : 'Generate PDF'}
        </button>

        <button
          onClick={handleSendToInvestors}
          className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Send size={16} /> Send to Investors
        </button>
      </div>

      {existingPackage?.pdf_url && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            PDF generated: <a href={existingPackage.pdf_url} target="_blank" rel="noopener noreferrer" className="underline font-medium">Download brochure</a>
          </p>
        </div>
      )}
    </div>
  )
}
