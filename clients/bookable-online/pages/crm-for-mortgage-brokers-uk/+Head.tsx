export default function Head() {
  const title = 'CRM for Mortgage Brokers UK | Bookable'
  const description =
    'Replace spreadsheets and admin with a custom automated CRM built for your mortgage brokerage. Automated lead capture, document collection, pipeline management. From £75/month.'
  const url = 'https://www.bookable.online/crm-for-mortgage-brokers-uk'

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: 'CRM for Mortgage Brokers UK',
        provider: {
          '@type': 'Organization',
          name: 'Bookable',
          url: 'https://www.bookable.online',
        },
        description:
          'Custom automated CRM system built specifically for UK mortgage brokers. Replaces spreadsheets, automates lead capture, document collection and case progression. From £75/month.',
        areaServed: { '@type': 'Country', name: 'United Kingdom' },
        audience: {
          '@type': 'Audience',
          audienceType: 'Mortgage brokers, mortgage advisers, broker firms',
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
            { '@type': 'ListItem', position: 2, name: 'CRM for Mortgage Brokers UK', item: url },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Do I need to migrate all my data to use a custom CRM?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We handle migration from spreadsheets and existing systems. Most brokers are surprised how straightforward it is — we map your existing data to the new system so nothing gets lost.',
            },
          },
          {
            '@type': 'Question',
            name: 'Will the CRM work with my current tools?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We can integrate or replace depending on what you need. Common integrations include sourcing platforms, email, calendar and accounting tools.',
            },
          },
          {
            '@type': 'Question',
            name: 'How long does it take to build and go live?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Most systems are live within 2–4 weeks of the initial scoping call. We configure pipeline stages, document types, intake forms and automations to match exactly how your business works.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is the CRM compliant with FCA requirements for mortgage brokers?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The system is structured to support audit trails, documentation workflows and data retention requirements. It is designed with regulated environments in mind.',
            },
          },
          {
            '@type': 'Question',
            name: 'How much does a CRM for mortgage brokers cost?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Bookable charges £75 per month with no per-user fees. Custom CRM builds typically cost £5,000–£20,000 through traditional agencies. We have productised the process to make it accessible at a monthly subscription price.',
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
        content="CRM for mortgage brokers UK, mortgage broker CRM, mortgage broker software, broker CRM system, automated CRM mortgage, mortgage pipeline management, document management mortgage broker, FCA compliant CRM, broker workflow automation"
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
