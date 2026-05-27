export default function Head() {
  const title = 'CRM for Equity Release Advisors UK | Bookable'
  const description =
    'Replace spreadsheets and manual case tracking with a custom automated CRM built for equity release advisors. Structured case journeys, automated document collection, full audit trail. From £75/month.'
  const url = 'https://www.bookable.online/crm-for-equity-release-advisors'

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: 'CRM for Equity Release Advisors UK',
        provider: {
          '@type': 'Organization',
          name: 'Bookable',
          url: 'https://www.bookable.online',
        },
        description:
          'Custom automated CRM and case management system built specifically for UK equity release advisors. Structured case journeys, automated document collection, compliance audit trails. From £75/month.',
        areaServed: { '@type': 'Country', name: 'United Kingdom' },
        audience: {
          '@type': 'Audience',
          audienceType: 'Equity release advisors, equity release advisers, later life lending specialists',
        },
        offers: {
          '@type': 'Offer',
          price: '75',
          priceCurrency: 'GBP',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '75',
            priceCurrency: 'GBP',
            billingIncrement: 1,
            unitCode: 'MON',
            name: 'Monthly subscription',
          },
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: 'en-GB',
        isPartOf: { '@type': 'WebSite', url: 'https://www.bookable.online' },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bookable.online/' },
            { '@type': 'ListItem', position: 2, name: 'CRM for Equity Release Advisors UK', item: url },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Will the CRM support my FCA compliance requirements?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Systems are structured to maintain full audit trails and document tracking throughout the case lifecycle. Every action is logged and every document stored against the case, designed with regulated environments in mind.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I track every stage of an equity release case?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes — each case follows a defined, visible journey from fact-find through to completion. You can see at a glance where every case sits, what\'s outstanding, and what needs action.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do I need to change how I currently work?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. The system is built around your existing process. We start by mapping how your cases actually progress and build the system to reflect that exactly.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can this CRM replace my spreadsheets?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes — that\'s exactly the goal. Spreadsheets are replaced by a structured system that handles case tracking, document management and audit trails automatically.',
            },
          },
          {
            '@type': 'Question',
            name: 'How much does a CRM for equity release advisors cost?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Bookable charges £75 per month with no per-user fees. Custom systems traditionally cost thousands upfront plus ongoing licensing. We have productised the process to make it accessible on a simple monthly subscription.',
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
        content="CRM for equity release advisors, equity release CRM, equity release case management, equity release software UK, later life lending CRM, equity release compliance, FCA compliant equity release system, equity release advisor software"
      />
      <meta name="author" content="Bookable" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="https://www.bookable.online/og-image.png" />
      <meta property="og:site_name" content="Bookable" />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://www.bookable.online/og-image.png" />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  )
}
