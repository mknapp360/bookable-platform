import { useData } from 'vike-react/useData'
import type { Data } from './+data'

export default function Head() {
  const { sector, location } = useData<Data>()

  const locationLabel = location.type === 'city'
    ? location.name
    : `${location.name}, ${location.region}`

  const title = `${sector.metaTitle} ${location.name} | Bookable`
  const description = `Bookable builds custom ${sector.keywords[0]} for ${location.namePlural ?? sector.namePlural} in ${location.name}. £500 setup, £75/month. Every lead captured, every process automated.`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: `${sector.metaTitle} for ${location.name}`,
        description,
        provider: {
          '@type': 'Organization',
          name: 'Bookable',
          url: 'https://www.YOUR_DOMAIN.com',
        },
        areaServed: {
          '@type': 'AdministrativeArea',
          name: locationLabel,
        },
        offers: {
          '@type': 'Offer',
          price: '500',
          priceCurrency: 'GBP',
          description: 'One-time setup fee. £75/month thereafter.',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.YOUR_DOMAIN.com/' },
          { '@type': 'ListItem', position: 2, name: sector.namePlural, item: `https://www.YOUR_DOMAIN.com/${sector.slug}` },
          { '@type': 'ListItem', position: 3, name: location.name, item: `https://www.YOUR_DOMAIN.com/${sector.slug}/${location.slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: sector.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
    ],
  }

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={`https://www.YOUR_DOMAIN.com/${sector.slug}/${location.slug}`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://www.YOUR_DOMAIN.com/${sector.slug}/${location.slug}`} />
      <meta property="og:image" content="https://www.YOUR_DOMAIN.com/og-image.png" />
      <meta property="og:site_name" content="Bookable" />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://www.YOUR_DOMAIN.com/og-image.png" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  )
}
