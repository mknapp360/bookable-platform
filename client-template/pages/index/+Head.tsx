// ─────────────────────────────────────────────────────────────
// TEMPLATE: Replace all YOUR_* placeholders before going live
// ─────────────────────────────────────────────────────────────

const SITE_URL = 'https://www.YOUR_DOMAIN.com'
const BRAND_NAME = 'YOUR_BRAND_NAME'

export default function Head() {
  const title = `${BRAND_NAME} — YOUR_TITLE_TAG`
  const description = 'YOUR_META_DESCRIPTION — keep under 160 characters.'

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'LocalBusiness'],
        '@id': `${SITE_URL}/#organization`,
        name: BRAND_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/favicon.svg`,
        },
        description: 'YOUR_ORGANIZATION_DESCRIPTION',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          email: 'YOUR_EMAIL',
          availableLanguage: 'English',
        },
        areaServed: [
          // Add your service areas
          { '@type': 'AdministrativeArea', name: 'YOUR_REGION' },
        ],
        knowsAbout: [
          // Add your areas of expertise
          'YOUR_SERVICE_1',
          'YOUR_SERVICE_2',
        ],
        sameAs: [],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BRAND_NAME,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'Service',
        '@id': `${SITE_URL}/#service`,
        name: 'YOUR_SERVICE_NAME',
        provider: { '@id': `${SITE_URL}/#organization` },
        description: 'YOUR_SERVICE_DESCRIPTION',
        offers: {
          '@type': 'Offer',
          price: 'YOUR_SETUP_PRICE',
          priceCurrency: 'GBP',
          description: 'YOUR_PRICING_DESCRIPTION',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          // Add your FAQs — each one is an indexable rich result in Google
          {
            '@type': 'Question',
            name: 'YOUR_FAQ_QUESTION_1',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'YOUR_FAQ_ANSWER_1',
            },
          },
        ],
      },
    ],
  }

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="YOUR_KEYWORDS, comma, separated" />
      <meta name="author" content={BRAND_NAME} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={`${SITE_URL}/`} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${SITE_URL}/`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
      <meta property="og:site_name" content={BRAND_NAME} />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={`${SITE_URL}/`} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  )
}
