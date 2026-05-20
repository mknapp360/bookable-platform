const SITE_URL = 'https://wilkinsonequityrelease.bookable.online'
const BRAND_NAME = 'Kate Wilkinson Equity Release'

export default function Head() {
  const title = `${BRAND_NAME} — Specialist Equity Release Adviser`
  const description =
    'Kate Wilkinson is a specialist equity release and later life mortgage adviser, helping homeowners aged 55+ unlock the value in their property with expert, impartial advice across the South East.'

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
          url: `${SITE_URL}/logo.png`,
        },
        description:
          'Kate Wilkinson specialises in equity release and later life mortgages, providing expert impartial advice to homeowners aged 55+ across the South East.',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          telephone: '+44-808-165-7795',
          email: 'kate@wilkinsonequityrelease.co.uk',
          availableLanguage: 'English',
        },
        areaServed: [
          { '@type': 'AdministrativeArea', name: 'South East England' },
          { '@type': 'AdministrativeArea', name: 'United Kingdom' },
        ],
        knowsAbout: [
          'Equity release',
          'Lifetime mortgages',
          'Later life mortgages',
          'Retirement planning',
          'Home reversion plans',
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
        name: 'Equity Release & Later Life Mortgage Advice',
        provider: { '@id': `${SITE_URL}/#organization` },
        description:
          'Specialist equity release and later life mortgage advice for homeowners aged 55+. FCA regulated, whole-of-market, member of the Equity Release Council.',
        areaServed: { '@type': 'AdministrativeArea', name: 'South East England' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is equity release?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Equity release allows homeowners aged 55+ to access the value tied up in their property without having to move. The most common type is a lifetime mortgage, where you borrow against the value of your home while retaining ownership.',
            },
          },
          {
            '@type': 'Question',
            name: 'How can equity release help me?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Equity release can supplement your retirement income, help family members with deposits or education costs, pay off an existing mortgage, or fund home improvements — all while staying in your home.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is equity release safe?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'All plans recommended by Kate Wilkinson meet Equity Release Council standards, which include a no-negative-equity guarantee. This means you will never owe more than the value of your home.',
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
      <meta
        name="keywords"
        content="equity release, lifetime mortgage, later life mortgage, retirement interest only, home reversion, equity release adviser, South East, Kate Wilkinson"
      />
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
