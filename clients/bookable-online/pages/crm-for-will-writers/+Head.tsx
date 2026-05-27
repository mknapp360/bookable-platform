export default function Head() {
  const title = 'CRM for Will Writers UK | Bookable'
  const description =
    'Replace paper files, spreadsheets, and manual case tracking with a custom CRM built for will writing practices. Structured client journeys, document storage, automated reminders. From £75/month.'
  const url = 'https://www.bookable.online/crm-for-will-writers'

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: 'CRM for Will Writers UK',
        provider: {
          '@type': 'Organization',
          name: 'Bookable',
          url: 'https://www.bookable.online',
        },
        description:
          'Custom CRM and case management system built specifically for UK will writing practices. Structured client journeys, document storage and versioning, automated follow-ups, and full case history. From £75/month.',
        areaServed: { '@type': 'Country', name: 'United Kingdom' },
        audience: {
          '@type': 'Audience',
          audienceType: 'Will writers, will writing firms, estate planning practitioners',
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
            { '@type': 'ListItem', position: 2, name: 'CRM for Will Writers UK', item: url },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Can the CRM handle document storage and draft management for wills?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes — documents are stored, organised, and linked to each client case. Drafts are versioned clearly so there is no confusion over which is the current version. Everything is accessible in one place, attached to the right client.',
            },
          },
          {
            '@type': 'Question',
            name: 'Will this replace my spreadsheets and folders?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes — that\'s exactly what it\'s designed to do. Spreadsheets, paper files, and folder structures are replaced by a single system that tracks clients, documents, and case progression automatically.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do I need to change my current will writing process?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. The system is built around your current workflow. We start by mapping how your cases progress and build the system to reflect that exactly.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is this CRM suitable for a small will writing firm?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes — especially those looking to scale without increasing admin overhead. The system gives you the structure to handle more clients without adding complexity.',
            },
          },
          {
            '@type': 'Question',
            name: 'How much does a CRM for will writers cost?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Bookable charges a one-time setup fee and then £75 per month with no per-user fees. Traditional systems are expensive and overbuilt. We have simplified the model to make it accessible for practices of any size.',
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
        content="CRM for will writers, will writing CRM, will writing software UK, will writer case management, estate planning CRM, will writing practice management, document management will writers, will writing firm software"
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
