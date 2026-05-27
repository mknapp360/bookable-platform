export default function Head() {
  const title = 'Our Products | Bookable'
  const description =
    'Workflow software for niche operators — CRM, compliance, dining management, writing tools and more. Built around the way you work.'

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.bookable.online/products" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.bookable.online/products" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="https://www.bookable.online/og-image.png" />
      <meta property="og:site_name" content="Bookable" />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="https://www.bookable.online/products" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://www.bookable.online/og-image.png" />
    </>
  )
}
