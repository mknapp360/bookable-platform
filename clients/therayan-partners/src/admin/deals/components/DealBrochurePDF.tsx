import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Property, DealAnalysis, DealPackage } from '../types'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1e293b' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, borderBottom: '2px solid #C9A96E', paddingBottom: 15 },
  headerTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#111111' },
  headerSub: { fontSize: 9, color: '#94a3b8' },
  gold: { color: '#C9A96E' },
  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginBottom: 10, color: '#111111', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 },
  photo: { width: '100%', height: 200, objectFit: 'cover', borderRadius: 4, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottom: '1px solid #f1f5f9' },
  label: { color: '#64748b', fontSize: 10 },
  value: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  summary: { fontSize: 11, lineHeight: 1.6, color: '#334155', marginBottom: 20 },
  table: { marginBottom: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 6, borderBottom: '1px solid #e2e8f0' },
  tableRow: { flexDirection: 'row', padding: 6, borderBottom: '1px solid #f1f5f9' },
  tableCell: { flex: 1, fontSize: 9 },
  tableCellBold: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '2px solid #C9A96E', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#94a3b8' },
})

interface Props {
  property: Property
  analysis: DealAnalysis | null
  dealPackage: DealPackage | null
}

export function DealBrochurePDF({ property, analysis, dealPackage }: Props) {
  const outputs = (analysis?.outputs ?? {}) as Record<string, unknown>
  const comps = (analysis?.propertydata_comps ?? []) as Record<string, unknown>[]
  const area = (analysis?.area_data ?? {}) as Record<string, Record<string, unknown>>
  const fmt = (n: unknown) => n != null ? `£${Number(n).toLocaleString('en-GB')}` : '—'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              Thérayan Partners
            </Text>
            <Text style={styles.headerSub}>Investment Opportunity</Text>
          </View>
          <Text style={[styles.gold, { fontSize: 12, fontFamily: 'Helvetica-Bold' }]}>
            Deal Brochure
          </Text>
        </View>

        {/* Property photo */}
        {property.images?.[0] && (
          <Image src={property.images[0]} style={styles.photo} />
        )}

        {/* Address */}
        <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
          {property.address}
        </Text>
        <Text style={{ fontSize: 10, color: '#64748b', marginBottom: 20 }}>
          {[property.postcode, property.property_type, property.bedrooms ? `${property.bedrooms} bedrooms` : null]
            .filter(Boolean).join(' · ')}
        </Text>

        {/* Opportunity summary */}
        {dealPackage?.opportunity_summary && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>The Opportunity</Text>
            <Text style={styles.summary}>{dealPackage.opportunity_summary}</Text>
          </View>
        )}

        {/* Key numbers */}
        <Text style={styles.sectionTitle}>Key Numbers</Text>
        <View style={styles.table}>
          {[
            ['Asking Price', fmt(property.price)],
            ['Estimated Value', fmt(outputs.estimated_value)],
            ['Gross Yield', outputs.gross_yield ? `${outputs.gross_yield}%` : '—'],
            ['Avg Monthly Rent', fmt(outputs.avg_monthly_rent)],
            ['Avg £/sqft', fmt(outputs.avg_price_per_sqft)],
            ['1yr Growth', outputs.growth_1y ? `${outputs.growth_1y}%` : '—'],
            ['Deal Type', analysis?.deal_type?.toUpperCase() ?? '—'],
          ].map(([label, value], i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Comparable sales */}
        {comps.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Comparable Sales</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellBold}>Address</Text>
              <Text style={styles.tableCellBold}>Price</Text>
              <Text style={styles.tableCellBold}>Date</Text>
              <Text style={styles.tableCellBold}>Type</Text>
            </View>
            {comps.slice(0, 8).map((c, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{String(c.address ?? c.full_address ?? '—')}</Text>
                <Text style={styles.tableCell}>{fmt(c.price ?? c.amount)}</Text>
                <Text style={styles.tableCell}>{String(c.date ?? c.deed_date ?? '—')}</Text>
                <Text style={styles.tableCell}>{String(c.type ?? c.property_type ?? '—')}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Area Overview */}
        {Object.keys(area).length > 0 && (
          <View style={{ marginTop: 20 }} break>
            <Text style={styles.sectionTitle}>Area Overview</Text>

            {/* Demographics */}
            {area.demographics && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Demographics</Text>
                {[
                  ['Population', area.demographics.population],
                  ['Avg. Household Income', area.demographics.average_income ? fmt(area.demographics.average_income) : null],
                  ['Owner Occupied', area.demographics.owner_occupied ? `${area.demographics.owner_occupied}%` : null],
                ].filter(([, v]) => v != null).map(([label, value], i) => (
                  <View key={i} style={styles.row}>
                    <Text style={styles.label}>{String(label)}</Text>
                    <Text style={styles.value}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Crime */}
            {area.crime && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Crime</Text>
                {[
                  ['Crime Rate', area.crime.crime_rate ?? area.crime.total],
                  ['vs National Avg', area.crime.national_average ? `${area.crime.national_average}` : null],
                ].filter(([, v]) => v != null).map(([label, value], i) => (
                  <View key={i} style={styles.row}>
                    <Text style={styles.label}>{String(label)}</Text>
                    <Text style={styles.value}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Schools */}
            {area.schools && Array.isArray(area.schools.schools ?? area.schools) && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Nearest Schools</Text>
                {((area.schools.schools ?? area.schools) as Record<string, unknown>[]).slice(0, 4).map((s, i) => (
                  <View key={i} style={styles.row}>
                    <Text style={styles.label}>{String(s.name ?? '—')}</Text>
                    <Text style={styles.value}>{String(s.ofsted_rating ?? s.rating ?? '—')}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Flood Risk */}
            {area.flood_risk && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Flood Risk</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Risk Level</Text>
                  <Text style={styles.value}>{String(area.flood_risk.flood_risk ?? area.flood_risk.risk_level ?? '—')}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Thérayan Partners · Confidential</Text>
          <Text style={styles.footerText}>Contact: sophie@therayanpartners.com</Text>
        </View>
      </Page>
    </Document>
  )
}
