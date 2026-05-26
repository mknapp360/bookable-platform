export interface Property {
  id: string
  tenant_id: string
  source: string
  external_id: string | null
  address: string
  postcode: string | null
  price: number | null
  bedrooms: number | null
  property_type: string | null
  description: string | null
  images: string[]
  listing_url: string | null
  days_listed: number | null
  price_reduced: boolean
  back_on_market: boolean
  status: PropertyStatus
  created_at: string
  updated_at: string
}

export type PropertyStatus =
  | 'sourced'
  | 'under_review'
  | 'deal_packaged'
  | 'sent_to_investor'
  | 'completed'
  | 'archived'

export const PIPELINE_COLUMNS: { status: PropertyStatus; label: string }[] = [
  { status: 'sourced',           label: 'Sourced' },
  { status: 'under_review',     label: 'Under Review' },
  { status: 'deal_packaged',    label: 'Deal Packaged' },
  { status: 'sent_to_investor', label: 'Sent to Investor' },
  { status: 'completed',        label: 'Completed' },
  { status: 'archived',         label: 'Archived' },
]

export interface DealAnalysis {
  id: string
  property_id: string
  tenant_id: string
  deal_type: 'btl' | 'brr' | 'hmo'
  inputs: Record<string, number>
  outputs: Record<string, number | null>
  propertydata_comps: unknown[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DealPackage {
  id: string
  property_id: string
  analysis_id: string | null
  tenant_id: string
  opportunity_summary: string | null
  pdf_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export function formatPrice(price: number | null): string {
  if (!price) return '—'
  return '£' + price.toLocaleString('en-GB')
}
