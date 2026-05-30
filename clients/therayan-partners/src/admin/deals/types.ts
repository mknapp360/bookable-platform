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
  strategy: string | null
  distance: number | null
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
  deal_type: 'btl' | 'brr' | 'hmo' | 'sa'
  inputs: Record<string, number>
  outputs: Record<string, number | null>
  propertydata_comps: unknown[]
  area_data: Record<string, unknown>
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

export const SOURCING_STRATEGIES = [
  { value: 'unmodernised-properties',       label: 'Needs Modernisation' },
  { value: 'reduced-properties',            label: 'Price Reduced' },
  { value: 'slow-to-sell-properties',       label: 'Slow to Sell' },
  { value: 'repossessed-properties',        label: 'Repossessed' },
  { value: 'short-lease-properties',        label: 'Short Lease' },
  { value: 'cheap-per-square-foot',         label: 'Cheap per Sqft' },
  { value: 'high-yield-properties',         label: 'High Yield' },
  { value: 'cash-buyers-only-properties',   label: 'Cash Buyers Only' },
  { value: 'back-on-market',               label: 'Back on Market' },
  { value: 'auction-properties',            label: 'Auction' },
  { value: 'quick-sale-properties',         label: 'Quick Sale' },
  { value: 'derelict-properties',           label: 'Derelict' },
  { value: 'properties-with-no-chain',      label: 'No Chain' },
  { value: 'poor-epc-score',               label: 'Poor EPC Score' },
  { value: 'two-to-three-bed-conversions',  label: '2-3 Bed Conversion' },
  { value: 'one-to-two-bed-conversions',    label: '1-2 Bed Conversion' },
  { value: 'suitable-for-splitting',        label: 'Suitable for Splitting' },
  { value: 'hmo-licenced-properties',       label: 'HMO Licenced' },
  { value: 'tenanted-properties-for-sale',  label: 'Tenanted' },
  { value: 'large-properties',             label: 'Large Properties' },
  { value: 'land-plots-for-sale',           label: 'Land Plots' },
  { value: 'holiday-let-properties',        label: 'Holiday Let' },
  { value: 'high-rental-demand',            label: 'High Rental Demand' },
  { value: 'properties-near-a-university',  label: 'Near University' },
  { value: 'near-large-development',        label: 'Near Development' },
  { value: 'properties-near-great-school',  label: 'Near Great School' },
  { value: 'high-population-growth',        label: 'High Pop. Growth' },
]

export function formatPrice(price: number | null): string {
  if (!price) return '—'
  return '£' + price.toLocaleString('en-GB')
}
