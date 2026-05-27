import { useData } from 'vike-react/useData'
import type { Data } from './+data'

export default function Head() {
  const { post } = useData<Data>()
  const description = post.excerpt ?? `Read "${post.title}" on the Bookable blog.`
  const url = `https://www.bookable.online/blog/${post.slug}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description,
        url,
        datePublished: post.published_at,
        dateModified: post.published_at,
        author: {
          '@type': 'Organization',
          name: 'Bookable',
          url: 'https://www.bookable.online',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Bookable',
          url: 'https://www.bookable.online',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.bookable.online/favicon.svg',
          },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bookable.online/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.bookable.online/blog' },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  }

  return (
    <>
      <title>{post.title} | Bookable Blog</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content="https://www.bookable.online/og-image.png" />
      <meta property="og:site_name" content="Bookable" />
      <meta property="og:locale" content="en_GB" />
      {post.published_at && (
        <meta property="article:published_time" content={post.published_at} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://www.bookable.online/og-image.png" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  )
}
