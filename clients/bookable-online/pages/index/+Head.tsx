export default function Head() {
  const title = 'Bookable — AI-Powered Business Automation for Small Business & Regulated Professionals'
  const description =
    'Bookable designs and builds AI-powered systems around how your business actually operates. Automated CRM, case management, compliance tracking and client onboarding. £500 setup, £75/month. Building automated business systems since 2019.'

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'LocalBusiness'],
        '@id': 'https://www.bookable.online/#organization',
        name: 'Bookable',
        url: 'https://www.bookable.online',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.bookable.online/favicon.svg',
        },
        description:
          'Automated software consultancy and developer for small business owners and regulated professionals. Building automated business systems since 2019.',
        foundingDate: '2019',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          telephone: '07562080026',
          availableLanguage: 'English',
        },
        areaServed: [
          { '@type': 'AdministrativeArea', name: 'Surrey' },
          { '@type': 'AdministrativeArea', name: 'Kent' },
          { '@type': 'AdministrativeArea', name: 'West Sussex' },
          { '@type': 'AdministrativeArea', name: 'East Sussex' },
          { '@type': 'AdministrativeArea', name: 'Hampshire' },
          { '@type': 'AdministrativeArea', name: 'Berkshire' },
          { '@type': 'AdministrativeArea', name: 'Hertfordshire' },
          { '@type': 'AdministrativeArea', name: 'Essex' },
          { '@type': 'AdministrativeArea', name: 'Buckinghamshire' },
          { '@type': 'AdministrativeArea', name: 'Oxfordshire' },
          { '@type': 'AdministrativeArea', name: 'South East England' },
        ],
        knowsAbout: [
          'AI-Powered Business Automation',
          'Mortgage Broker CRM',
          'Letting Agent Compliance Software',
          'Property Investor Deal Management',
          'Equity Release Compliance Software',
          'Legal Case Management',
          'FCA Consumer Duty Compliance',
          'Lead Capture Systems',
          'Client Onboarding Automation',
        ],
        sameAs: [],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.bookable.online/#website',
        url: 'https://www.bookable.online',
        name: 'Bookable',
        publisher: { '@id': 'https://www.bookable.online/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.bookable.online/blog?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Service',
        '@id': 'https://www.bookable.online/#service',
        name: 'AI-Powered Business Automation Platform',
        provider: { '@id': 'https://www.bookable.online/#organization' },
        description:
          'Custom AI-powered CRM, lead capture, client onboarding, compliance tracking and case management platforms built for small business owners and regulated professionals.',
        areaServed: { '@type': 'AdministrativeArea', name: 'South East England' },
        audience: {
          '@type': 'Audience',
          audienceType:
            'Small business owners, mortgage brokers, letting agents, property investors, equity release advisers, solicitors, conveyancers',
        },
        offers: {
          '@type': 'Offer',
          price: '500',
          priceCurrency: 'GBP',
          description: 'One-time setup fee. £75/month thereafter.',
          priceSpecification: [
            { '@type': 'UnitPriceSpecification', price: '500', priceCurrency: 'GBP', name: 'Setup fee' },
            {
              '@type': 'UnitPriceSpecification',
              price: '75',
              priceCurrency: 'GBP',
              billingIncrement: 1,
              unitCode: 'MON',
              name: 'Monthly subscription',
            },
          ],
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Bookable Products',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bookable CRM — Automated pipeline and case management for small business owners and regulated professionals. Live since August 2020.' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Dining Steward — Covers, events and member management for membership clubs and private dining operators. Live since September 2025.' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'PropWorth — Automated Renters\' Rights Act compliance for letting agents. Live since May 2026.' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Pagewright — Writing workflow for authors and writing professionals. Live since April 2026.' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SafeReg — Registration and compliance record management. Live since November 2025.' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'QR Card — Digital contact details shared via QR code. Live since May 2026.' } },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How much does Bookable cost?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Bookable charges a one-time setup fee of £500 and £75 per month thereafter. There are no per-user fees and no hidden costs.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is Bookable suitable for mortgage brokers?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Bookable is purpose-built for regulated financial professionals including mortgage brokers, equity release advisers and financial advisers. The platform handles lead capture, qualification, document management and client onboarding automatically.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does Bookable help with FCA Consumer Duty compliance?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Bookable provides FCA-compliant document storage, automated client communication records, and case tracking that meets Consumer Duty requirements — without manual input.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is PropWorth?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'PropWorth was built in response to the Renters\' Rights Act 2026. It automates notification cycles and document prompts for letting agents, replacing manual spreadsheet tracking. Live since May 2026.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does Bookable work for solicitors and conveyancers?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Yes. Bookable's case management system with configurable pipeline stages and document types is well suited to conveyancing, family law, probate and other legal workflows.",
            },
          },
          {
            '@type': 'Question',
            name: 'How long has Bookable been operating?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Bookable has been building automated business systems since 2019. The first product, Bookable CRM, has been live since August 2020.',
            },
          },
          {
            '@type': 'Question',
            name: 'How long does it take to automate my business processes?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Most platforms are live within 2-4 weeks of the initial scoping call. We configure your pipeline stages, document types, intake forms and automations to match exactly how your business works.',
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
        content="AI business automation, CRM for small business, automated CRM mortgage brokers, letting agent compliance software, Renters Rights Act software, case management solicitors, equity release CRM, lead management finance UK, automated onboarding, business automation platform, CRM for financial advisers, property dealpackager software, conveyancing case management, FCA Consumer Duty compliance, CRM Surrey, CRM Kent, CRM Sussex, business automation South East England"
      />
      <meta name="author" content="Bookable" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.bookable.online/" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.bookable.online/" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content="AI-powered business automation for small business owners and regulated professionals. Custom CRM, compliance tracking and case management. Building automated business systems since 2019." />
      <meta property="og:image" content="https://www.bookable.online/og-image.png" />
      <meta property="og:site_name" content="Bookable" />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="https://www.bookable.online/" />
      <meta name="twitter:title" content="Bookable — AI-Powered Business Automation" />
      <meta name="twitter:description" content="Custom automated systems for small business owners and regulated professionals. £500 setup, £75/month. Building automated business systems since 2019." />
      <meta name="twitter:image" content="https://www.bookable.online/og-image.png" />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  )
}
