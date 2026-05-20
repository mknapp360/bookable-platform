const SITE_URL = 'https://therayan.bookable.online'
const BRAND_NAME = 'Thérayan Partners'

export default function Head() {
  const title = `${BRAND_NAME} — Connecting Property Opportunity with Investment Ambition`
  const description =
    'Thérayan Partners connects motivated property sellers with experienced investors. Tailored strategies, transparent process, and long-term portfolio growth.'

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
          'Thérayan Partners specialises in connecting property sellers with investors, delivering tailored strategies and sustainable portfolio growth.',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          telephone: '+44-20-1234-5678',
          email: 'info@therayanpartners.com',
          availableLanguage: 'English',
        },
        areaServed: [
          { '@type': 'AdministrativeArea', name: 'United Kingdom' },
        ],
        knowsAbout: [
          'Property investment',
          'Real estate strategy',
          'Portfolio growth',
          'Property sales',
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
        name: 'Property Investment & Sales Advisory',
        provider: { '@id': `${SITE_URL}/#organization` },
        description:
          'Connecting property sellers with investors through tailored, transparent strategies that deliver strong outcomes for all parties.',
        areaServed: { '@type': 'AdministrativeArea', name: 'United Kingdom' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What does Thérayan Partners do?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Thérayan Partners connects motivated property sellers with experienced investors. We create tailored strategies that deliver strong outcomes for sellers and long-term growth for investors.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I sell my property through Thérayan Partners?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Get in touch via our contact form or email. We will understand your goals, match you with suitable investors, and manage the process professionally from start to finish.',
            },
          },
          {
            '@type': 'Question',
            name: 'How can I invest through Thérayan Partners?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We source and present handpicked investment opportunities aligned with your criteria and long-term portfolio growth objectives. Contact us to discuss your investment goals.',
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
        content="property investment, property sales, real estate UK, portfolio growth, property investors, sell my property, investment opportunities"
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
